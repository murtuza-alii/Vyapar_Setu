/**
 * src/db/storage.ts
 * Universal Local-First Storage Adapter:
 * - Triple-tier runtime detection: IndexedDB -> LocalStorage -> In-Memory Map
 * - Zero external native dependencies, runs in headless Node.js, CLI test runners, and browser
 * - Reactive subscriptions for instant UI updates
 */
import { randomUUID } from 'node:crypto';

export interface OutboxAction {
  id: string;
  entityType?: 'TRANSACTION' | 'PARTY' | 'DEAL' | 'STOCK' | 'PAYMENT' | string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  collection?: string;
  entityId?: string;
  payload: any;
  timestamp: number;
  syncStatus: 'PENDING' | 'SYNCING' | 'IN_FLIGHT' | 'SYNCED' | 'FAILED';
  retryCount: number;
  maxRetries?: number;
  lastErrorMessage?: string;
  lastError?: string;
  nextRetryTimestamp?: number;
  conflictStrategy?: 'LAST_WRITE_WINS' | 'APPEND_ONLY' | 'REJECT_ON_CONFLICT';
}

export interface IStorageAdapter {
  get<T>(collection: string, id: string): Promise<T | null>;
  getAll<T>(collection: string, queryOrFilter?: Record<string, any> | ((item: T) => boolean)): Promise<T[]>;
  put<T extends { id: string }>(collection: string, item: T): Promise<void>;
  putMany<T extends { id: string }>(collection: string, items: T[]): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  clear(collection?: string): Promise<void>;
  clearCollection(collection: string): Promise<void>;
  enqueueOutboxAction(action: any): Promise<OutboxAction>;
  getOutboxActions(status?: any): Promise<OutboxAction[]>;
  updateOutboxAction(action: OutboxAction): Promise<void>;
  subscribe<T>(collection: string, listener: (items: T[]) => void): () => void;
  getDriverName(): 'indexeddb' | 'localstorage' | 'memory';
}

function safeUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `act_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}

/**
 * In-Memory driver for Node.js / tsx CLI testing without DOM or IndexedDB globals.
 */
export class MemoryStorageDriver implements IStorageAdapter {
  protected collections = new Map<string, Map<string, any>>();
  protected outboxList: OutboxAction[] = [];
  protected listeners = new Map<string, Set<(items: any[]) => void>>();

  protected getCollectionMap(name: string): Map<string, any> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map<string, any>());
    }
    return this.collections.get(name)!;
  }

  async get<T>(collection: string, id: string): Promise<T | null> {
    const col = this.getCollectionMap(collection);
    const item = col.get(id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async getAll<T>(collection: string, queryOrFilter?: Record<string, any> | ((item: T) => boolean)): Promise<T[]> {
    const col = this.getCollectionMap(collection);
    let items = Array.from(col.values()).map(v => JSON.parse(JSON.stringify(v)));
    if (typeof queryOrFilter === 'function') {
      const fn = queryOrFilter as (item: T) => boolean;
      items = items.filter(fn);
    } else if (queryOrFilter && typeof queryOrFilter === 'object') {
      items = items.filter(item => {
        return Object.entries(queryOrFilter).every(([k, v]) => (item as any)[k] === v);
      });
    }
    return items;
  }

  async put<T extends { id: string }>(collection: string, item: T): Promise<void> {
    if (!item || !item.id) throw new Error('Item must have an id');
    const col = this.getCollectionMap(collection);
    col.set(item.id, JSON.parse(JSON.stringify(item)));
    this.notifyListeners(collection);
  }

  async putMany<T extends { id: string }>(collection: string, items: T[]): Promise<void> {
    const col = this.getCollectionMap(collection);
    for (const item of items) {
      if (item && item.id) {
        col.set(item.id, JSON.parse(JSON.stringify(item)));
      }
    }
    this.notifyListeners(collection);
  }

  async delete(collection: string, id: string): Promise<void> {
    const col = this.getCollectionMap(collection);
    if (col.has(id)) {
      col.delete(id);
      this.notifyListeners(collection);
    }
  }

  async clear(collection?: string): Promise<void> {
    if (collection) {
      this.getCollectionMap(collection).clear();
      this.notifyListeners(collection);
    } else {
      for (const [colName, colMap] of this.collections.entries()) {
        colMap.clear();
        this.notifyListeners(colName);
      }
    }
  }

  async clearCollection(collection: string): Promise<void> {
    await this.clear(collection);
  }

  async enqueueOutboxAction(
    action: any
  ): Promise<OutboxAction> {
    const fullAction: OutboxAction = {
      id: action.id || safeUUID(),
      entityType: action.entityType || 'TRANSACTION',
      operation: action.operation || 'CREATE',
      collection: action.collection,
      entityId: action.entityId,
      payload: action.payload,
      timestamp: action.timestamp || Date.now(),
      syncStatus: action.syncStatus || 'PENDING',
      retryCount: action.retryCount || 0,
      maxRetries: action.maxRetries || 5,
      conflictStrategy: action.conflictStrategy || 'LAST_WRITE_WINS',
      nextRetryTimestamp: Date.now(),
    };
    this.outboxList.push(fullAction);
    await this.put('outbox', fullAction);
    return JSON.parse(JSON.stringify(fullAction));
  }

  async getOutboxActions(status?: any): Promise<OutboxAction[]> {
    let list = this.outboxList;
    if (status) {
      list = list.filter(a => a.syncStatus === status);
    }
    return JSON.parse(JSON.stringify(list));
  }

  async updateOutboxAction(action: OutboxAction): Promise<void> {
    const idx = this.outboxList.findIndex(a => a.id === action.id);
    if (idx !== -1) {
      this.outboxList[idx] = JSON.parse(JSON.stringify(action));
    }
    await this.put('outbox', action);
  }

  subscribe<T>(collection: string, listener: (items: T[]) => void): () => void {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, new Set());
    }
    this.listeners.get(collection)!.add(listener);

    // Immediate initial push
    this.getAll<T>(collection).then(items => listener(items));

    return () => {
      this.listeners.get(collection)?.delete(listener);
    };
  }

  protected notifyListeners(collection: string): void {
    const set = this.listeners.get(collection);
    if (!set || set.size === 0) return;
    this.getAll(collection).then(items => {
      set.forEach(cb => cb(items));
    });
  }

  getDriverName(): 'memory' {
    return 'memory';
  }
}

export class InMemoryStorageAdapter extends MemoryStorageDriver {}

/**
 * LocalStorage driver with namespacing.
 */
export class LocalStorageDriver implements IStorageAdapter {
  private prefix = 'vyapar_setu:v1:';
  private memoryFallback = new MemoryStorageDriver();

  private getKey(collection: string, id: string): string {
    return `${this.prefix}${collection}:${id}`;
  }

  async get<T>(collection: string, id: string): Promise<T | null> {
    try {
      if (typeof localStorage === 'undefined') return this.memoryFallback.get<T>(collection, id);
      const data = localStorage.getItem(this.getKey(collection, id));
      return data ? JSON.parse(data) : null;
    } catch {
      return this.memoryFallback.get<T>(collection, id);
    }
  }

  async getAll<T>(collection: string, queryOrFilter?: Record<string, any> | ((item: T) => boolean)): Promise<T[]> {
    try {
      if (typeof localStorage === 'undefined') return this.memoryFallback.getAll<T>(collection, queryOrFilter);
      let results: T[] = [];
      const colPrefix = `${this.prefix}${collection}:`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(colPrefix)) {
          const val = localStorage.getItem(key);
          if (val) results.push(JSON.parse(val));
        }
      }
      if (typeof queryOrFilter === 'function') {
        const fn = queryOrFilter as (item: T) => boolean;
        results = results.filter(fn);
      } else if (queryOrFilter && typeof queryOrFilter === 'object') {
        results = results.filter(item => {
          return Object.entries(queryOrFilter).every(([k, v]) => (item as any)[k] === v);
        });
      }
      return results;
    } catch {
      return this.memoryFallback.getAll<T>(collection, queryOrFilter);
    }
  }

  async put<T extends { id: string }>(collection: string, item: T): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.getKey(collection, item.id), JSON.stringify(item));
      }
    } finally {
      await this.memoryFallback.put(collection, item);
    }
  }

  async putMany<T extends { id: string }>(collection: string, items: T[]): Promise<void> {
    for (const item of items) {
      await this.put(collection, item);
    }
  }

  async delete(collection: string, id: string): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.getKey(collection, id));
      }
    } finally {
      await this.memoryFallback.delete(collection, id);
    }
  }

  async clear(collection?: string): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        if (collection) {
          const colPrefix = `${this.prefix}${collection}:`;
          const toRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(colPrefix)) toRemove.push(key);
          }
          toRemove.forEach(k => localStorage.removeItem(k));
        } else {
          const toRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) toRemove.push(key);
          }
          toRemove.forEach(k => localStorage.removeItem(k));
        }
      }
    } finally {
      await this.memoryFallback.clear(collection);
    }
  }

  async clearCollection(collection: string): Promise<void> {
    await this.clear(collection);
  }

  async enqueueOutboxAction(action: any): Promise<OutboxAction> {
    return this.memoryFallback.enqueueOutboxAction(action);
  }

  async getOutboxActions(status?: any): Promise<OutboxAction[]> {
    return this.memoryFallback.getOutboxActions(status);
  }

  async updateOutboxAction(action: OutboxAction): Promise<void> {
    return this.memoryFallback.updateOutboxAction(action);
  }

  subscribe<T>(collection: string, listener: (items: T[]) => void): () => void {
    return this.memoryFallback.subscribe<T>(collection, listener);
  }

  getDriverName(): 'localstorage' {
    return 'localstorage';
  }
}

/**
 * Browser IndexedDB driver.
 */
export class IndexedDBDriver implements IStorageAdapter {
  private dbName = 'vyapar_setu_db';
  private version = 1;
  private memoryFallback = new MemoryStorageDriver();
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        const stores = [
          'parties',
          'journal_entries',
          'accounts',
          'inventory_items',
          'deals',
          'outbox',
          'settings',
          'rfqs',
          'quotes',
          'pools',
          'passports',
          'merchants',
        ];
        stores.forEach(name => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: 'id' });
          }
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  private async getStore(collection: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.getDB();
    if (!db.objectStoreNames.contains(collection)) {
      throw new Error(`Store ${collection} not found`);
    }
    const tx = db.transaction(collection, mode);
    return tx.objectStore(collection);
  }

  async get<T>(collection: string, id: string): Promise<T | null> {
    try {
      const store = await this.getStore(collection, 'readonly');
      return new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.memoryFallback.get<T>(collection, id);
    }
  }

  async getAll<T>(collection: string, queryOrFilter?: Record<string, any> | ((item: T) => boolean)): Promise<T[]> {
    try {
      const store = await this.getStore(collection, 'readonly');
      return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => {
          let res = req.result as T[];
          if (typeof queryOrFilter === 'function') {
            const fn = queryOrFilter as (item: T) => boolean;
            res = res.filter(fn);
          } else if (queryOrFilter && typeof queryOrFilter === 'object') {
            res = res.filter(item => {
              return Object.entries(queryOrFilter).every(([k, v]) => (item as any)[k] === v);
            });
          }
          resolve(res);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.memoryFallback.getAll<T>(collection, queryOrFilter);
    }
  }

  async put<T extends { id: string }>(collection: string, item: T): Promise<void> {
    try {
      const store = await this.getStore(collection, 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback
    } finally {
      await this.memoryFallback.put(collection, item);
    }
  }

  async putMany<T extends { id: string }>(collection: string, items: T[]): Promise<void> {
    for (const item of items) {
      await this.put(collection, item);
    }
  }

  async delete(collection: string, id: string): Promise<void> {
    try {
      const store = await this.getStore(collection, 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback
    } finally {
      await this.memoryFallback.delete(collection, id);
    }
  }

  async clear(collection?: string): Promise<void> {
    try {
      if (collection) {
        const store = await this.getStore(collection, 'readwrite');
        await new Promise<void>((resolve, reject) => {
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch {
      // Fallback
    } finally {
      await this.memoryFallback.clear(collection);
    }
  }

  async clearCollection(collection: string): Promise<void> {
    await this.clear(collection);
  }

  async enqueueOutboxAction(action: any): Promise<OutboxAction> {
    return this.memoryFallback.enqueueOutboxAction(action);
  }

  async getOutboxActions(status?: any): Promise<OutboxAction[]> {
    return this.memoryFallback.getOutboxActions(status);
  }

  async updateOutboxAction(action: OutboxAction): Promise<void> {
    return this.memoryFallback.updateOutboxAction(action);
  }

  subscribe<T>(collection: string, listener: (items: T[]) => void): () => void {
    return this.memoryFallback.subscribe<T>(collection, listener);
  }

  getDriverName(): 'indexeddb' {
    return 'indexeddb';
  }
}

/**
 * Universal Storage Factory: Auto-selects the best supported driver.
 */
export function createStorageAdapter(): IStorageAdapter {
  if (typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined') {
    return new IndexedDBDriver();
  }
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return new LocalStorageDriver();
  }
  return new MemoryStorageDriver();
}

/** Global singleton adapter */
export const storage: IStorageAdapter = createStorageAdapter();
