/**
 * src/db/outbox.ts
 * Optimistic Outbox Mutation Queue & Offline Synchronization:
 * - Immediate local application of mutations (optimistic UI)
 * - Exponential backoff retry with jitter
 * - Connectivity awareness (auto-detects online/offline)
 * - Conflict resolution strategy support
 */
import { IStorageAdapter, storage, OutboxAction } from './storage';

export type OutboxOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type OutboxStatus = 'PENDING' | 'SYNCING' | 'IN_FLIGHT' | 'FAILED' | 'SYNCED';
export type ConflictStrategy = 'LAST_WRITE_WINS' | 'APPEND_ONLY' | 'REJECT_ON_CONFLICT';

export interface SyncStats {
  isOnline: boolean;
  pendingCount: number;
  inFlightCount: number;
  failedCount: number;
  syncedCount: number;
  totalCount: number;
  lastSyncTime?: number;
}

export class OutboxQueue {
  private adapter: IStorageAdapter;
  private collection = 'outbox';
  private isOnline = true;
  private listeners: Set<(stats: SyncStats) => void> = new Set();
  private isProcessing = false;

  constructor(adapter: IStorageAdapter = storage) {
    this.adapter = adapter;
    this.initConnectivityListeners();
  }

  private initConnectivityListeners(): void {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.broadcastStats();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.broadcastStats();
      });
    }
  }

  setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    this.broadcastStats();
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Enqueues an optimistic mutation to the outbox queue.
   */
  async enqueue<T = any>(params: {
    collection?: string;
    entityId?: string;
    entityType?: 'TRANSACTION' | 'PARTY' | 'DEAL' | 'STOCK' | 'PAYMENT' | string;
    operation: OutboxOperation;
    payload: T;
    conflictStrategy?: ConflictStrategy;
    maxRetries?: number;
  }): Promise<OutboxAction> {
    const action: OutboxAction = {
      id: `outbox_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
      collection: params.collection,
      entityId: params.entityId,
      entityType: params.entityType || 'TRANSACTION',
      operation: params.operation,
      payload: params.payload,
      timestamp: Date.now(),
      syncStatus: 'PENDING',
      retryCount: 0,
      maxRetries: params.maxRetries ?? 5,
      nextRetryTimestamp: Date.now(),
      conflictStrategy: params.conflictStrategy || 'LAST_WRITE_WINS'
    };

    await this.adapter.enqueueOutboxAction(action);
    this.broadcastStats();
    return action;
  }

  /**
   * Retrieves pending or retry-eligible actions.
   */
  async getEligibleActions(): Promise<OutboxAction[]> {
    const now = Date.now();
    return this.adapter.getAll<OutboxAction>(this.collection, action => {
      if (action.syncStatus === 'PENDING') return true;
      if (action.syncStatus === 'FAILED' && action.retryCount < (action.maxRetries ?? 5) && now >= (action.nextRetryTimestamp ?? 0)) {
        return true;
      }
      return false;
    });
  }

  /**
   * Calculates exponential backoff delay with 20% jitter (capped at 30s).
   */
  private calculateBackoff(retryCount: number): number {
    const base = 1000 * Math.pow(2, retryCount);
    const jitter = base * 0.2 * (Math.random() * 2 - 1);
    const delay = Math.round(base + jitter);
    return Math.min(delay, 30000);
  }

  /**
   * Process all pending outbox actions with a sync handler.
   */
  async processQueue(
    syncHandler: (action: OutboxAction) => Promise<boolean>
  ): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (this.isProcessing) return { processed: 0, succeeded: 0, failed: 0 };
    if (!this.isOnline) return { processed: 0, succeeded: 0, failed: 0 };

    this.isProcessing = true;
    let succeeded = 0;
    let failed = 0;

    try {
      const actions = await this.getEligibleActions();

      for (const action of actions) {
        action.syncStatus = 'IN_FLIGHT';
        await this.adapter.updateOutboxAction(action);
        this.broadcastStats();

        try {
          const success = await syncHandler(action);
          if (success) {
            action.syncStatus = 'SYNCED';
            action.lastError = undefined;
            action.lastErrorMessage = undefined;
            succeeded++;
          } else {
            throw new Error('Sync handler returned false');
          }
        } catch (err: any) {
          action.retryCount++;
          action.syncStatus = 'FAILED';
          action.lastError = err?.message || 'Network sync error';
          action.lastErrorMessage = action.lastError;
          action.nextRetryTimestamp = Date.now() + this.calculateBackoff(action.retryCount);
          failed++;
        }

        await this.adapter.updateOutboxAction(action);
        this.broadcastStats();
      }

      return { processed: actions.length, succeeded, failed };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Clear out completed / synced actions from the outbox.
   */
  async purgeSynced(): Promise<number> {
    const synced = await this.adapter.getAll<OutboxAction>(this.collection, a => a.syncStatus === 'SYNCED');
    for (const item of synced) {
      await this.adapter.delete(this.collection, item.id);
    }
    this.broadcastStats();
    return synced.length;
  }

  /**
   * Get sync queue summary statistics.
   */
  async getStats(): Promise<SyncStats> {
    const all = await this.adapter.getAll<OutboxAction>(this.collection);
    const pending = all.filter(a => a.syncStatus === 'PENDING').length;
    const inFlight = all.filter(a => a.syncStatus === 'IN_FLIGHT' || a.syncStatus === 'SYNCING').length;
    const failed = all.filter(a => a.syncStatus === 'FAILED').length;
    const synced = all.filter(a => a.syncStatus === 'SYNCED').length;

    return {
      isOnline: this.isOnline,
      pendingCount: pending,
      inFlightCount: inFlight,
      failedCount: failed,
      syncedCount: synced,
      totalCount: all.length,
      lastSyncTime: Date.now()
    };
  }

  /**
   * Subscribe to real-time outbox stats changes.
   */
  subscribeStats(callback: (stats: SyncStats) => void): () => void {
    this.listeners.add(callback);
    this.getStats().then(stats => callback(stats));
    return () => {
      this.listeners.delete(callback);
    };
  }

  private async broadcastStats(): Promise<void> {
    if (this.listeners.size === 0) return;
    const stats = await this.getStats();
    this.listeners.forEach(cb => cb(stats));
  }
}

export const outbox = new OutboxQueue(storage);
