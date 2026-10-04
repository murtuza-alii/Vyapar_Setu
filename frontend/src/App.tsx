import React, { useState, useEffect } from 'react';
import { 
  TradeMode, 
  UserRole, 
  Party, 
  TextileItem, 
  BuildingMaterialItem, 
  DealCard, 
  DealStage, 
  VoiceParsedTransaction,
  GroupBuyingPool,
  Language
} from './types';
import { TRANSLATIONS } from './i18n/translations';
import { 
  INITIAL_PARTIES, 
  INITIAL_TEXTILE_INVENTORY, 
  INITIAL_BUILDING_INVENTORY, 
  INITIAL_DEALS, 
  PEER_MERCHANTS, 
  GROUP_BUYING_POOLS, 
  MOCK_TRADE_PASSPORT 
} from './mock/mockData';
import { Header } from './components/Header';
import { CockpitModule } from './components/CockpitModule';
import { ControlTowerModule } from './components/ControlTowerModule';
import { NetworkModule } from './components/NetworkModule';
import { LedgerModule } from './components/LedgerModule';
import { NewDealModal } from './components/NewDealModal';
import { EditorialHeroAndBento } from './components/EditorialHeroAndBento';
import { 
  LayoutDashboard, 
  Truck, 
  Network, 
  BookOpen, 
  HardHat, 
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  // Global Application State (Default to English as requested)
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('vyapar_setu_lang') as Language;
      return saved === 'hi' || saved === 'kn' || saved === 'en' ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const [tradeMode, setTradeMode] = useState<TradeMode>('TEXTILE');
  const [userRole, setUserRole] = useState<UserRole>('OWNER');
  const [activeTab, setActiveTab] = useState<'COCKPIT' | 'CONTROL_TOWER' | 'NETWORK' | 'LEDGER'>('COCKPIT');
  const [newDealModalOpen, setNewDealModalOpen] = useState(false);

  const t = TRANSLATIONS[language];

  // Sync language selection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vyapar_setu_lang', language);
    } catch {}
  }, [language]);

  // Shared Data States with LocalStorage Persistence
  const [parties, setParties] = useState<Party[]>(() => {
    try {
      const saved = localStorage.getItem('vyapar_setu_parties');
      return saved ? JSON.parse(saved) : INITIAL_PARTIES;
    } catch {
      return INITIAL_PARTIES;
    }
  });

  const [textileInventory, _setTextileInventory] = useState<TextileItem[]>(INITIAL_TEXTILE_INVENTORY);
  const [buildingInventory, _setBuildingInventory] = useState<BuildingMaterialItem[]>(INITIAL_BUILDING_INVENTORY);

  const [deals, setDeals] = useState<DealCard[]>(() => {
    try {
      const saved = localStorage.getItem('vyapar_setu_deals');
      return saved ? JSON.parse(saved) : INITIAL_DEALS;
    } catch {
      return INITIAL_DEALS;
    }
  });

  const [groupPools, setGroupPools] = useState<GroupBuyingPool[]>(() => {
    try {
      const saved = localStorage.getItem('vyapar_setu_pools');
      return saved ? JSON.parse(saved) : GROUP_BUYING_POOLS;
    } catch {
      return GROUP_BUYING_POOLS;
    }
  });
  
  // Financial State
  const [cashInHand, setCashInHand] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vyapar_setu_cash');
      return saved ? Number(saved) : 145000;
    } catch {
      return 145000;
    }
  });

  const [bankBalance, setBankBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vyapar_setu_bank');
      return saved ? Number(saved) : 820000;
    } catch {
      return 820000;
    }
  });

  // Sync state mutations to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('vyapar_setu_parties', JSON.stringify(parties));
    } catch {}
  }, [parties]);

  useEffect(() => {
    try {
      localStorage.setItem('vyapar_setu_deals', JSON.stringify(deals));
    } catch {}
  }, [deals]);

  useEffect(() => {
    try {
      localStorage.setItem('vyapar_setu_pools', JSON.stringify(groupPools));
    } catch {}
  }, [groupPools]);

  useEffect(() => {
    try {
      localStorage.setItem('vyapar_setu_cash', cashInHand.toString());
    } catch {}
  }, [cashInHand]);

  useEffect(() => {
    try {
      localStorage.setItem('vyapar_setu_bank', bankBalance.toString());
    } catch {}
  }, [bankBalance]);

  // Handler: Reset Demo Data
  const handleResetDemoData = () => {
    if (confirm('क्या आप सभी डेमो डेटा को मूल स्थिति में रीसेट करना चाहते हैं? (Reset all demo data?)')) {
      localStorage.removeItem('vyapar_setu_parties');
      localStorage.removeItem('vyapar_setu_deals');
      localStorage.removeItem('vyapar_setu_pools');
      localStorage.removeItem('vyapar_setu_cash');
      localStorage.removeItem('vyapar_setu_bank');
      setParties(INITIAL_PARTIES);
      setDeals(INITIAL_DEALS);
      setGroupPools(GROUP_BUYING_POOLS);
      setCashInHand(145000);
      setBankBalance(820000);
      alert('डेमो डेटा सफलतापूर्वक रीसेट हो गया!');
    }
  };

  // Handler: Commit Voice-Parsed Transaction
  const handleCommitVoiceTransaction = (tx: VoiceParsedTransaction) => {
    // 1. Update party balance
    setParties(prev => prev.map(p => {
      if (p.name.toLowerCase().includes(tx.partyName.toLowerCase()) || tx.partyName.toLowerCase().includes(p.name.toLowerCase())) {
        const newBalance = tx.transactionType === 'SALE' 
          ? p.currentBalance + tx.balanceDue 
          : p.currentBalance - tx.cashPaidOrReceived;
        return {
          ...p,
          currentBalance: newBalance,
          lastPaymentDate: '2026-10-04',
          aging: {
            ...p.aging,
            days0_15: p.aging.days0_15 + (tx.transactionType === 'SALE' ? tx.balanceDue : 0),
          },
        };
      }
      return p;
    }));

    // 2. Adjust cash drawer
    if (tx.cashPaidOrReceived > 0) {
      setCashInHand(prev => prev + tx.cashPaidOrReceived);
    }

    // 3. Create a new Deal Card if it was a Sale
    if (tx.transactionType === 'SALE') {
      const newDealId = `deal-${Date.now().toString().slice(-4)}`;
      const newDeal: DealCard = {
        id: newDealId,
        dealNumber: `SD-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: `${tx.quantity} ${tx.unit} ${tx.itemName} (${tx.lotOrGrade})`,
        tradeMode: tx.tradeMode,
        partyId: 'pty-101',
        partyName: tx.partyName,
        partyCity: 'Bengaluru',
        partyPhone: '+91 98450 12345',
        createdAt: '2026-10-04 16:40',
        stage: 'STOCK_PICKING',
        items: [
          {
            id: `item-${Date.now()}`,
            name: tx.itemName,
            details: `${tx.lotOrGrade}, ${tx.quantity} ${tx.unit}`,
            quantity: tx.quantity,
            unit: tx.unit,
            rate: tx.rate,
            landedCost: tx.rate * 0.82,
            subtotal: tx.totalAmount,
          },
        ],
        totalAmount: tx.totalAmount,
        advanceReceived: tx.cashPaidOrReceived,
        balanceDue: tx.balanceDue,
        paymentTerms: '15 Days Net, 2% CD in 7 days',
        dispatch: {
          vehicleNo: tx.logisticsNote ? 'KA-01-FA-4521' : 'TBD',
          driverName: 'Ramesh Gowda',
          driverPhone: '98450 55112',
          transporterName: 'National Express Cargo',
          biltyNo: `BIL-NAT-${Math.floor(1000 + Math.random() * 9000)}`,
          freightTerms: 'PAID',
          freightAmount: tx.tradeMode === 'TEXTILE' ? 2400 : 5000,
        },
        delivery: {
          deliveredQty: 0,
          acceptedQty: 0,
          damagedQty: 0,
          shortageQty: 0,
          creditNoteIssued: 0,
          isConfirmed: false,
        },
        margin: {
          grossRevenue: tx.totalAmount,
          landedCost: tx.totalAmount * 0.82,
          freightCost: 2400,
          hamaliCost: 500,
          cashDiscount: tx.totalAmount * 0.02,
          dalaliBrokerage: tx.totalAmount * 0.01,
          netProfit: tx.totalAmount - (tx.totalAmount * 0.82 + 2400 + 500 + tx.totalAmount * 0.03),
          netMarginPercent: 11.2,
          profitBand: 'HEALTHY',
        },
        notes: `वॉइस असिस्टेंट द्वारा दर्ज: "${tx.rawTranscript}"`,
      };

      setDeals(prev => [newDeal, ...prev]);
    }

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
    alert(`सौदा सफलतापूर्वक बही-खाते और कंट्रोल टॉवर में दर्ज हो गया!`);
  };

  // Handler: Update Deal Stage
  const handleUpdateDealStage = (dealId: string, nextStage: DealStage) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          stage: nextStage,
          balanceDue: nextStage === 'SETTLED' ? 0 : d.balanceDue,
        };
      }
      return d;
    }));
  };

  // Handler: Update Deal Margin
  const handleUpdateDealMargin = (dealId: string, marginUpdates: Partial<DealCard['margin']>) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          margin: { ...d.margin, ...marginUpdates },
        };
      }
      return d;
    }));
  };

  // Handler: Confirm Delivery & Damaged Goods
  const handleConfirmDelivery = (dealId: string, acceptedQty: number, damagedQty: number, shortageQty: number) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const unitRate = d.items[0]?.rate || 100;
        const creditNote = (damagedQty + shortageQty) * unitRate;
        return {
          ...d,
          stage: 'DELIVERED_CHECK',
          balanceDue: Math.max(0, d.balanceDue - creditNote),
          delivery: {
            deliveredQty: acceptedQty + damagedQty + shortageQty,
            acceptedQty,
            damagedQty,
            shortageQty,
            creditNoteIssued: creditNote,
            isConfirmed: true,
          },
        };
      }
      return d;
    }));
  };

  // Handler: Join Group Buying Pool
  const handleJoinPool = (poolId: string, quantity: number) => {
    setGroupPools(prev => prev.map(p => {
      if (p.id === poolId) {
        return {
          ...p,
          pledgedVolume: p.pledgedVolume + quantity,
          participantsCount: p.participantsCount + 1,
          userPledgeQuantity: (p.userPledgeQuantity || 0) + quantity,
        };
      }
      return p;
    }));
  };

  // Handler: Record Payment Entry
  const handleRecordPayment = (partyId: string, amount: number, mode: string) => {
    setParties(prev => prev.map(p => {
      if (p.id === partyId) {
        return {
          ...p,
          currentBalance: Math.max(0, p.currentBalance - amount),
          lastPaymentDate: '2026-10-04',
          aging: {
            ...p.aging,
            days30_plus: Math.max(0, p.aging.days30_plus - amount),
          },
        };
      }
      return p;
    }));

    if (mode === 'CASH') {
      setCashInHand(prev => prev + amount);
    } else {
      setBankBalance(prev => prev + amount);
    }
  };

  const handleUpdatePartyBalance = (partyId: string, amountPaid: number) => {
    handleRecordPayment(partyId, amountPaid, 'UPI');
  };

  // Handler: Create New Deal from NewDealModal
  const handleCreateDeal = (deal: DealCard) => {
    setDeals(prev => [deal, ...prev]);
  };

  return (
    <div className="min-h-[100dvh] bg-[#090D16] text-slate-100 flex flex-col font-sans">
      
      {/* Top Application Header */}
      <Header
        tradeMode={tradeMode}
        setTradeMode={setTradeMode}
        userRole={userRole}
        setUserRole={setUserRole}
        language={language}
        setLanguage={setLanguage}
        cashInHand={cashInHand}
        bankBalance={bankBalance}
        onResetDemoData={handleResetDemoData}
        t={t}
      />

      {/* Main Container wrapped with overflow-x-hidden for GSAP animations */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 overflow-x-hidden">
        
        {/* Editorial Cinematic Hero & Gapless Bento Grid */}
        <EditorialHeroAndBento
          tradeMode={tradeMode}
          language={language}
          t={t}
          onExploreCockpit={() => {
            setActiveTab('COCKPIT');
            window.scrollTo({ top: 680, behavior: 'smooth' });
          }}
          onOpenControlTower={() => {
            setActiveTab('CONTROL_TOWER');
            window.scrollTo({ top: 680, behavior: 'smooth' });
          }}
        />

        {/* Navigation Tabs Bar */}
        <div id="module-tabs" className="flex items-center justify-between border-b border-slate-800/80 pb-2 pt-4">
          <nav className="flex items-center space-x-1.5 sm:space-x-2">
            
            <button
              type="button"
              onClick={() => setActiveTab('COCKPIT')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'COCKPIT'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400/90" />
              <span>{t.tabCockpit}</span>
            </button>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab('CONTROL_TOWER')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'CONTROL_TOWER'
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Truck className="w-4 h-4 text-sky-400/90" />
                <span>{t.tabControlTower}</span>
              </button>
              {activeTab === 'CONTROL_TOWER' && (
                <button
                  type="button"
                  onClick={() => setNewDealModalOpen(true)}
                  title={t.newDealBtn}
                  className="tactile-btn ml-1.5 flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm leading-none shadow-sm"
                  aria-label="New Deal"
                >
                  +
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('NETWORK')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'NETWORK'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Network className="w-4 h-4 text-indigo-400/90" />
              <span>{t.tabNetwork}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('LEDGER')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'LEDGER'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400/90" />
              <span>{t.tabLedger}</span>
            </button>

          </nav>

          {/* Trade Mode Indicator Pill */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            {tradeMode === 'TEXTILE' ? (
              <>
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-slate-400">{t.textileModeIndicator}</span>
              </>
            ) : (
              <>
                <HardHat className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-slate-400">{t.buildingModeIndicator}</span>
              </>
            )}
          </div>
        </div>

        {/* Tab 1: Daily Cockpit */}
        {activeTab === 'COCKPIT' && (
          <CockpitModule
            tradeMode={tradeMode}
            userRole={userRole}
            parties={parties}
            textileInventory={textileInventory}
            buildingInventory={buildingInventory}
            onCommitVoiceTransaction={handleCommitVoiceTransaction}
            onUpdatePartyBalance={handleUpdatePartyBalance}
            language={language}
            t={t}
          />
        )}

        {/* Tab 2: Wholesale Control Tower */}
        {activeTab === 'CONTROL_TOWER' && (
          <ControlTowerModule
            tradeMode={tradeMode}
            userRole={userRole}
            deals={deals}
            onUpdateDealStage={handleUpdateDealStage}
            onUpdateDealMargin={handleUpdateDealMargin}
            onConfirmDelivery={handleConfirmDelivery}
            language={language}
            t={t}
          />
        )}

        {/* Tab 3: Collaborative Trade Network */}
        {activeTab === 'NETWORK' && (
          <NetworkModule
            tradeMode={tradeMode}
            peerMerchants={PEER_MERCHANTS}
            groupPools={groupPools}
            tradePassport={MOCK_TRADE_PASSPORT}
            onJoinPool={handleJoinPool}
            language={language}
            t={t}
          />
        )}

        {/* Tab 4: Micro-Khata Ledger */}
        {activeTab === 'LEDGER' && (
          <LedgerModule
            userRole={userRole}
            parties={parties}
            cashInHand={cashInHand}
            bankBalance={bankBalance}
            onRecordPayment={handleRecordPayment}
            language={language}
            t={t}
          />
        )}

      </main>

      {/* New Deal Entry Modal */}
      <NewDealModal
        isOpen={newDealModalOpen}
        tradeMode={tradeMode}
        parties={parties}
        onClose={() => setNewDealModalOpen(false)}
        onCreateDeal={handleCreateDeal}
        language={language}
        t={t}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t.footerCopyright}</span>
          <span className="font-mono text-slate-400">{t.footerTagline}</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
