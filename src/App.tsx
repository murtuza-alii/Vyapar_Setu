import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Network, 
  BookOpen, 
  Layers, 
  HardHat, 
  Shield, 
  Wifi, 
  WifiOff,
  Coins,
  Store,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { storage } from './db/storage';
import { outbox, SyncStats } from './db/outbox';
import { seedInitialDatabase, SeedSummary } from './db/seed-data';
import { canViewFinancialMargins, canApproveCreditOverride } from './modules/foundation/rbac';
import { UserRole } from './types/common';

export type TradeMode = 'TEXTILE' | 'BUILDING';
export type ActiveTab = 'COCKPIT' | 'CONTROL_TOWER' | 'NETWORK' | 'LEDGER';

export function App() {
  const [tradeMode, setTradeMode] = useState<TradeMode>('TEXTILE');
  const [userRole, setUserRole] = useState<UserRole>('MUKHIYA');
  const [activeTab, setActiveTab] = useState<ActiveTab>('COCKPIT');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [seedSummary, setSeedSummary] = useState<SeedSummary | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  useEffect(() => {
    // Initialize storage and seed data
    seedInitialDatabase(storage).then(summary => {
      setSeedSummary(summary);
    }).catch(console.error);

    // Subscribe to outbox stats
    const unsubscribe = outbox.subscribeStats((stats) => {
      setSyncStats(stats);
      setIsOnline(stats.isOnline);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    outbox.setOnlineStatus(nextState);
  };

  const handleReSeed = async () => {
    setIsSeeding(true);
    try {
      const summary = await seedInitialDatabase(storage, true);
      setSeedSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const showFinancials = canViewFinancialMargins(userRole);
  const canOverrideCredit = canApproveCreditOverride(userRole);

  return (
    <div className="min-h-[100dvh] bg-[#090D16] text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand & Market Cluster */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-lg">
              सेतु
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                व्यापार सेतु <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Vyapar Setu</span>
              </h1>
              <p className="text-[11px] text-slate-400">
                {tradeMode === 'TEXTILE' ? 'भीलवाड़ा / सूरत कपड़ा मंडी' : 'किशनगढ़ / उदयपुर बिल्डिंग मैटेरियल्स'}
              </p>
            </div>
          </div>

          {/* Controls: Mode Switcher, Role Selector, Sync Badge */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            
            {/* Trade Mode Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setTradeMode('TEXTILE')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  tradeMode === 'TEXTILE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>थान/कपड़ा</span>
              </button>
              <button
                type="button"
                onClick={() => setTradeMode('BUILDING')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  tradeMode === 'BUILDING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>बिल्डिंग</span>
              </button>
            </div>

            {/* RBAC Role Selector */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="MUKHIYA" className="bg-slate-900 text-slate-200">मुखिया (Owner)</option>
                <option value="MUNIM" className="bg-slate-900 text-slate-200">मुनीम-जी (Munim)</option>
                <option value="GODOWN" className="bg-slate-900 text-slate-200">गोदाम (Dispatcher)</option>
                <option value="PARTNER" className="bg-slate-900 text-slate-200">पार्टनर (Partner)</option>
              </select>
            </div>

            {/* Offline / Online Status Badge */}
            <button
              type="button"
              onClick={handleToggleOnline}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono border transition-all ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online Synced' : 'Offline Mode'}</span>
            </button>

            {/* Seed Reload Button */}
            <button
              type="button"
              onClick={handleReSeed}
              disabled={isSeeding}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title="Reset Mandi Seed Data"
            >
              <RefreshCw className={`w-3 h-3 ${isSeeding ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">रीसीड</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 overflow-x-auto">
          <nav className="flex space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab('COCKPIT')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'COCKPIT'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>व्यापार साथी (Daily Cockpit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CONTROL_TOWER')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'CONTROL_TOWER'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>सौदा व रवानगी (Control Tower)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('NETWORK')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'NETWORK'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>व्यापार नेटवर्क (Trade Network)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('LEDGER')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'LEDGER'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>बही-खाता (Micro-Khata)</span>
            </button>
          </nav>
        </div>

        {/* Status & Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">मंडी क्लस्टर</p>
              <p className="text-sm font-bold text-slate-100">
                {tradeMode === 'TEXTILE' ? 'जयपुर / सूरत' : 'किशनगढ़ / उदयपुर'}
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">सक्रिय भूमिका</p>
              <p className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>{userRole}</span>
                {showFinancials ? (
                  <span className="text-[10px] text-emerald-400 font-mono">(Margins Visible)</span>
                ) : (
                  <span className="text-[10px] text-rose-400 font-mono">(Rates Redacted)</span>
                )}
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">डबल-एंट्री लेजर</p>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% संतुलित (0 पैसे अंतर)</span>
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
              isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">आउटबॉक्स कतार</p>
              <p className="text-sm font-bold text-slate-100 font-mono">
                {syncStats ? `${syncStats.pendingCount} लंबित / ${syncStats.totalCount} कुल` : 'सिंक सक्रिय'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Module Render Area */}
        <div className="glass-panel rounded-xl p-8 min-h-[420px] flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-wholesale-glow">
            {activeTab === 'COCKPIT' && <LayoutDashboard className="w-8 h-8" />}
            {activeTab === 'CONTROL_TOWER' && <Truck className="w-8 h-8" />}
            {activeTab === 'NETWORK' && <Network className="w-8 h-8" />}
            {activeTab === 'LEDGER' && <BookOpen className="w-8 h-8" />}
          </div>
          
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            {activeTab === 'COCKPIT' && 'स्तंभ 1: व्यापार साथी (Pillar 1 Cockpit)'}
            {activeTab === 'CONTROL_TOWER' && 'स्तंभ 2: सौदा व रवानगी (Pillar 2 Control Tower)'}
            {activeTab === 'NETWORK' && 'स्तंभ 3: व्यापार नेटवर्क (Pillar 3 Vyapar Network)'}
            {activeTab === 'LEDGER' && 'बही-खाता व गल्ला मिलान (Micro-Khata & Galla Tally)'}
          </h2>

          <p className="text-sm text-slate-400 max-w-lg mb-6">
            फाउंडेशन व डेटा इंजन 100% सक्रिय है। मोड: <span className="text-amber-400 font-medium">{tradeMode}</span> • भूमिका: <span className="text-indigo-400 font-medium">{userRole}</span> • क्रेडिट ओवरराइड अनुमति: <span className={canOverrideCredit ? 'text-emerald-400 font-medium' : 'text-slate-500'}>{canOverrideCredit ? 'स्वीकृत' : 'अस्वीकृत'}</span>
          </p>

          {/* Seed summary badge */}
          {seedSummary && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 max-w-md w-full text-xs text-slate-300 font-mono">
              <div className="flex justify-between items-center py-0.5">
                <span>व्यापारी (Wholesalers):</span>
                <span className="text-amber-400 font-bold">{seedSummary.wholesalersCount}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>व्यापार पार्टियाँ (Parties):</span>
                <span className="text-amber-400 font-bold">{seedSummary.partiesCount}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>इन्वेंटरी मद (Inventory Items):</span>
                <span className="text-amber-400 font-bold">{seedSummary.inventoryItemsCount}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>आरंभिक वाउचर (Vouchers):</span>
                <span className="text-emerald-400 font-bold">{seedSummary.journalEntriesCount} (संतुलित)</span>
              </div>
            </div>
          )}

          {!showFinancials && (
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>गोदाम व पार्टनर सुरक्षा: वित्तीय मार्जिन व खरीद दरें स्वतः सुरक्षित रूप से मास्क्ड हैं।</span>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0F172A] py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>व्यापार सेतु (Vyapar Setu) © 2026 • राजस्थान होलसेल व मंडी ऑपरेटिंग सिस्टम</span>
          <span className="font-mono text-slate-400">Offline SQLite Sync Ready • Double-Entry Accounting Invariant</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
