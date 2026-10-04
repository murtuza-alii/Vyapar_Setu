import React, { useState } from 'react';
import { DealCard, DealStage, TradeMode, UserRole, Language } from '../types';
import { Translations, TRANSLATIONS } from '../i18n/translations';
import { 
  Truck, 
  FileText, 
  CheckCircle, 
  Scale, 
  IndianRupee, 
  Phone, 
  ShieldAlert, 
  Calculator, 
  Layers, 
  PackageCheck,
  ChevronRight,
  ExternalLink,
  Printer,
  X,
  Lock,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InvoiceModal } from './InvoiceModal';

interface ControlTowerModuleProps {
  tradeMode: TradeMode;
  userRole: UserRole;
  deals: DealCard[];
  onUpdateDealStage: (dealId: string, nextStage: DealStage) => void;
  onUpdateDealMargin: (dealId: string, marginUpdates: Partial<DealCard['margin']>) => void;
  onConfirmDelivery: (dealId: string, acceptedQty: number, damagedQty: number, shortageQty: number) => void;
  language?: Language;
  t?: Translations;
}

export const ControlTowerModule: React.FC<ControlTowerModuleProps> = ({
  tradeMode,
  userRole,
  deals,
  onUpdateDealStage,
  onUpdateDealMargin,
  onConfirmDelivery,
  language = 'en',
  t,
}) => {
  const activeT = t || TRANSLATIONS[language];

  // Selected Deal for Detail View & Margin Calculator
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || '');
  const selectedDeal = deals.find(d => d.id === selectedDealId) || deals[0];

  // Pipeline Filter by Stage
  const [stageFilter, setStageFilter] = useState<'ALL' | DealStage>('ALL');

  // Filter deals by current trade mode and stage filter
  const filteredDeals = deals.filter(deal => {
    if (deal.tradeMode !== tradeMode) return false;
    if (stageFilter === 'ALL') return true;
    return deal.stage === stageFilter;
  });

  // Stage sequence map
  const STAGES: { key: DealStage; label: string; subLabel: string; icon: any }[] = [
    { key: 'SAUDA_CONFIRMED', label: activeT.stages.SAUDA_CONFIRMED, subLabel: language === 'en' ? 'Contract Agreed' : language === 'kn' ? 'ಖಚಿತ ಒಪ್ಪಂದ' : 'सौदा पक्का', icon: FileText },
    { key: 'CREDIT_VERIFIED', label: activeT.stages.CREDIT_VERIFIED, subLabel: language === 'en' ? 'Advance Confirmed' : language === 'kn' ? 'ಮುಂಗಡ ಸ್ವೀಕೃತ' : 'अग्रिम प्राप्त', icon: ShieldAlert },
    { key: 'STOCK_PICKING', label: activeT.stages.STOCK_PICKING, subLabel: language === 'en' ? 'Lot Reserved' : language === 'kn' ? 'ಲಾಟ್ ಮೀಸಲು' : 'लॉट आवंटित', icon: PackageCheck },
    { key: 'DISPATCHED', label: activeT.stages.DISPATCHED, subLabel: language === 'en' ? 'Waybill Generated' : language === 'kn' ? 'ಬಿಲ್ತಿ ರವಾನೆ' : 'बिल्टी रवाना', icon: Truck },
    { key: 'DELIVERED_CHECK', label: activeT.stages.DELIVERED_CHECK, subLabel: language === 'en' ? 'Inspection Done' : language === 'kn' ? 'ಪರಿಶೀಲನೆ ಮುಗಿದಿದೆ' : 'जांच पूर्ण', icon: Scale },
    { key: 'SETTLED', label: activeT.stages.SETTLED, subLabel: language === 'en' ? 'Balance Cleared' : language === 'kn' ? 'ಬಾಕಿ ಚುಕ್ತಾ' : 'खाता चुकता', icon: CheckCircle },
  ];

  // Local state for interactive Margin Calculator
  const [freightInput, setFreightInput] = useState<number>(selectedDeal?.margin.freightCost || 3200);
  const [hamaliInput, setHamaliInput] = useState<number>(selectedDeal?.margin.hamaliCost || 650);
  const [cdInput, setCdInput] = useState<number>(selectedDeal?.margin.cashDiscount || 3430);
  const [dalaliInput, setDalaliInput] = useState<number>(selectedDeal?.margin.dalaliBrokerage || 1715);

  // Delivery check state
  const [acceptedQtyInput, setAcceptedQtyInput] = useState<number>(selectedDeal?.items[0]?.quantity || 100);
  const [damagedQtyInput, setDamagedQtyInput] = useState<number>(0);
  const [shortageQtyInput, setShortageQtyInput] = useState<number>(0);

  // Weighbridge & Thaan Modals State
  const [weighbridgeModalOpen, setWeighbridgeModalOpen] = useState(false);
  const [grossWeightInput, setGrossWeightInput] = useState<number>(34250);
  const [tareWeightInput, setTareWeightInput] = useState<number>(12450);
  const [thaanModalOpen, setThaanModalOpen] = useState(false);

  // Invoice Modal State
  const [invoiceModalDeal, setInvoiceModalDeal] = useState<DealCard | null>(null);

  // Synchronize inputs when selected deal changes
  const handleSelectDeal = (deal: DealCard) => {
    setSelectedDealId(deal.id);
    setFreightInput(deal.margin.freightCost);
    setHamaliInput(deal.margin.hamaliCost);
    setCdInput(deal.margin.cashDiscount);
    setDalaliInput(deal.margin.dalaliBrokerage);
    setAcceptedQtyInput(deal.items[0]?.quantity || 100);
    setDamagedQtyInput(deal.delivery.damagedQty || 0);
    setShortageQtyInput(deal.delivery.shortageQty || 0);
  };

  // Re-calculate Net Profit in real-time
  const totalRevenue = selectedDeal ? selectedDeal.margin.grossRevenue : 0;
  const landedCost = selectedDeal ? selectedDeal.margin.landedCost : 0;
  const computedNetProfit = totalRevenue - (landedCost + freightInput + hamaliInput + cdInput + dalaliInput);
  const computedMarginPercent = totalRevenue > 0 ? (computedNetProfit / totalRevenue) * 100 : 0;

  const profitBand = computedMarginPercent >= 5 ? 'HEALTHY' : computedMarginPercent > 0 ? 'THIN' : 'LOSS';

  // Save recalculated margins into deal record
  const handleSaveMarginChanges = () => {
    if (selectedDeal) {
      onUpdateDealMargin(selectedDeal.id, {
        freightCost: freightInput,
        hamaliCost: hamaliInput,
        cashDiscount: cdInput,
        dalaliBrokerage: dalaliInput,
        netProfit: computedNetProfit,
        netMarginPercent: computedMarginPercent,
        profitBand,
      });
      alert('संशोधित मुनाफा व खर्चे सौदे में सुरक्षित हो गए!');
    }
  };

  // Advance to next stage with celebration if settled
  const handleAdvanceStage = (deal: DealCard) => {
    const currentIndex = STAGES.findIndex(s => s.key === deal.stage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1].key;
      onUpdateDealStage(deal.id, nextStage);
      if (nextStage === 'SETTLED') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Pipeline Stage Bar */}
      <div className="surface-card p-2.5 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[760px] gap-2">
          {STAGES.map((s, idx) => {
            const count = deals.filter(d => d.tradeMode === tradeMode && d.stage === s.key).length;
            const isActive = stageFilter === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStageFilter(isActive ? 'ALL' : s.key)}
                className={`flex-1 p-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                    : 'surface-subtle hover:bg-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-medium">0{idx + 1}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                    count > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-1 truncate">{s.label}</div>
                <div className="text-[11px] text-slate-400 truncate">{s.subLabel}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Active Deal Pipeline Cards & Deal Control Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Filtered Deal Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 m-0">{activeT.activeDealsTitle}</h3>
            <span className="text-xs font-mono text-slate-400">
              {filteredDeals.length} {activeT.dealsAvailable}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredDeals.map((deal) => {
              const isSelected = deal.id === selectedDeal?.id;
              const currentStageObj = STAGES.find(s => s.key === deal.stage);
              return (
                <div
                  key={deal.id}
                  onClick={() => handleSelectDeal(deal)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'surface-card border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                      : 'surface-subtle hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400 font-semibold">{deal.dealNumber}</span>
                        <span className="text-[11px] text-slate-400">• {deal.createdAt}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100 mt-0.5">{deal.title}</h4>
                      <p className="text-xs text-slate-400">{deal.partyName} ({deal.partyCity})</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-white block">
                        ₹{deal.totalAmount.toLocaleString('en-IN')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold mt-1 ${
                        deal.stage === 'SETTLED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {currentStageObj?.label || deal.stage}
                      </span>
                    </div>
                  </div>

                  {/* Dispatch / Bilty summary strip */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-mono text-slate-300">{deal.dispatch.vehicleNo}</span>
                      <span>({deal.dispatch.biltyNo})</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {activeT.advanceAmount} ₹{deal.advanceReceived.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Selected Deal Execution Studio */}
        {selectedDeal ? (
          <div className="lg:col-span-7 surface-card p-5 space-y-6">
            
            {/* Deal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/30">
                    {selectedDeal.dealNumber}
                  </span>
                  <h3 className="text-base font-semibold text-white m-0">{selectedDeal.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>{activeT.party} <strong className="text-slate-200">{selectedDeal.partyName}</strong> ({selectedDeal.partyCity})</span>
                  <span>•</span>
                  <a href={`tel:${selectedDeal.partyPhone}`} className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono transition-colors">
                    <Phone className="w-3 h-3" />
                    <span>{selectedDeal.partyPhone}</span>
                  </a>
                </p>
              </div>

              {/* Action buttons: Invoice + Advance stage */}
              <div className="flex items-center gap-2">
                {/* Print Invoice button */}
                <button
                  type="button"
                  onClick={() => setInvoiceModalDeal(selectedDeal)}
                  className="px-3 py-2 surface-subtle hover:bg-slate-800 text-slate-200 font-medium text-xs rounded-lg tactile-btn flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeT.printInvoiceBtn}</span>
                </button>

                {/* Advance to next stage CTA */}
                {selectedDeal.stage !== 'SETTLED' && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStage(selectedDeal)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg tactile-btn flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>{activeT.advanceCTA}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Stage-Specific Dispatch & Picking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Packaging & Logistics Box */}
              <div className="p-3.5 rounded-xl surface-subtle space-y-2">
                <div className="flex items-center justify-between text-slate-400 font-semibold pb-1 border-b border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-white">
                    <Truck className="w-3.5 h-3.5 text-sky-400" />
                    {activeT.dispatchDetails}
                  </span>
                  <span className="font-mono text-[10px] text-sky-400">{selectedDeal.dispatch.biltyNo}</span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{activeT.truckNo}</span>
                    <span className="font-mono font-bold text-white">{selectedDeal.dispatch.vehicleNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{activeT.driver}</span>
                    <span>{selectedDeal.dispatch.driverName} ({selectedDeal.dispatch.driverPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{activeT.carrier}</span>
                    <span>{selectedDeal.dispatch.transporterName}</span>
                  </div>
                  {selectedDeal.dispatch.weighbridgeSlipNo ? (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-slate-500">{activeT.weighbridge}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setGrossWeightInput(selectedDeal.dispatch.weighbridgeGrossKg || 34250);
                          setTareWeightInput(selectedDeal.dispatch.weighbridgeTareKg || 12450);
                          setWeighbridgeModalOpen(true);
                        }}
                        className="font-mono text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 tactile-btn transition-colors"
                      >
                        <span>{selectedDeal.dispatch.weighbridgeSlipNo}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : tradeMode === 'TEXTILE' ? (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="text-slate-500">{activeT.rollsDetail}</span>
                      <button
                        type="button"
                        onClick={() => setThaanModalOpen(true)}
                        className="font-mono text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 tactile-btn transition-colors"
                      >
                        <span>18 Thaans (704m)</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Payment & Credit Terms Box */}
              <div className="p-3.5 rounded-xl surface-subtle space-y-2">
                <div className="flex items-center justify-between text-slate-400 font-semibold pb-1 border-b border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-white">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                    {activeT.paymentStatus}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {activeT.summaryTotal} ₹{selectedDeal.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{activeT.advanceAmount}</span>
                    <span className="font-mono font-bold text-emerald-400">₹{selectedDeal.advanceReceived.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{activeT.balanceDueLabel}</span>
                    <span className="font-mono font-bold text-amber-400">₹{selectedDeal.balanceDue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{activeT.terms}</span>
                    <span className="text-slate-300 truncate">{selectedDeal.paymentTerms}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Delivery & Shortage Inspection Tracker (If at or past delivery) */}
            <div className="p-4 rounded-xl surface-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-semibold text-white m-0">{activeT.deliveryInspectionTitle}</h4>
                </div>
                <span className="text-[11px] text-slate-400">{activeT.autoCreditNote}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">{activeT.acceptedQty}</label>
                  <input
                    type="number"
                    value={acceptedQtyInput}
                    onChange={(e) => setAcceptedQtyInput(Number(e.target.value))}
                    className="w-full bg-[#090d14] border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500/60"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-rose-400 block mb-1">{activeT.damagedQty}</label>
                  <input
                    type="number"
                    value={damagedQtyInput}
                    onChange={(e) => setDamagedQtyInput(Number(e.target.value))}
                    className="w-full bg-[#090d14] border border-rose-900/40 rounded px-2.5 py-1.5 text-rose-300 font-mono focus:outline-none focus:border-rose-500/60"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-amber-400 block mb-1">{activeT.shortageQty}</label>
                  <input
                    type="number"
                    value={shortageQtyInput}
                    onChange={(e) => setShortageQtyInput(Number(e.target.value))}
                    className="w-full bg-[#090d14] border border-amber-900/40 rounded px-2.5 py-1.5 text-amber-300 font-mono focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              {(damagedQtyInput > 0 || shortageQtyInput > 0) && (
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 flex items-center justify-between text-xs">
                  <span className="text-rose-300">
                    {activeT.creditNoteNotice} <strong className="font-mono">₹{((damagedQtyInput + shortageQtyInput) * (selectedDeal.items[0]?.rate || 100)).toLocaleString('en-IN')}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onConfirmDelivery(selectedDeal.id, acceptedQtyInput, damagedQtyInput, shortageQtyInput);
                      alert(language === 'en' ? 'Credit Note issued and adjusted in party ledger!' : language === 'kn' ? 'ಕ್ರೆಡಿಟ್ ನೋಟ್ ನೀಡಲಾಗಿದೆ ಮತ್ತು ಖಾತೆಯಲ್ಲಿ ಸರಿಹೊಂದಿಸಲಾಗಿದೆ!' : 'क्रेडिट नोट जारी किया गया और खाते से घटाया गया!');
                    }}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] transition-colors"
                  >
                    {activeT.adjustCreditNote}
                  </button>
                </div>
              )}
            </div>

            {/* True Net Deal Margin Calculator (Hidden from Godown Staff RBAC) */}
            {userRole !== 'GODOWN_DISPATCH' ? (
              <div className="p-4 rounded-xl surface-subtle border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-white m-0">{activeT.marginCalculator}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{language === 'en' ? 'Margin Band:' : language === 'kn' ? 'ಲಾಭ ಶ್ರೇಣಿ:' : 'मुनाफा दर:'}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      profitBand === 'HEALTHY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : profitBand === 'THIN'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {computedMarginPercent.toFixed(2)}% ({profitBand === 'HEALTHY' ? (language === 'en' ? 'Healthy' : language === 'kn' ? 'ಉತ್ತಮ' : 'स्वस्थ') : profitBand === 'THIN' ? (language === 'en' ? 'Thin' : language === 'kn' ? 'ಕಡಿಮೆ' : 'कम') : (language === 'en' ? 'Loss' : language === 'kn' ? 'ನಷ್ಟ' : 'घाटा')})
                    </span>
                  </div>
                </div>

                {/* Real Costs Deduction Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{activeT.freightCost}</label>
                    <input
                      type="number"
                      value={freightInput}
                      onChange={(e) => setFreightInput(Number(e.target.value))}
                      className="w-full bg-[#090d14] border border-slate-800 rounded px-2 py-1 text-white font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{activeT.hamaliCost}</label>
                    <input
                      type="number"
                      value={hamaliInput}
                      onChange={(e) => setHamaliInput(Number(e.target.value))}
                      className="w-full bg-[#090d14] border border-slate-800 rounded px-2 py-1 text-white font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{activeT.cashDiscount}</label>
                    <input
                      type="number"
                      value={cdInput}
                      onChange={(e) => setCdInput(Number(e.target.value))}
                      className="w-full bg-[#090d14] border border-slate-800 rounded px-2 py-1 text-white font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">{activeT.dalaliBrokerage}</label>
                    <input
                      type="number"
                      value={dalaliInput}
                      onChange={(e) => setDalaliInput(Number(e.target.value))}
                      className="w-full bg-[#090d14] border border-slate-800 rounded px-2 py-1 text-white font-mono focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                </div>

                {/* Net Rupee Profit Calculation Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
                  <div className="text-slate-400 font-mono text-[11px]">
                    {activeT.grossRevenue} (₹{totalRevenue.toLocaleString('en-IN')}) - {activeT.landedCost} (₹{landedCost.toLocaleString('en-IN')})
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-medium">{activeT.netProfit}:</span>
                      <span className={`text-base font-bold font-mono ${
                        computedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        ₹{computedNetProfit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveMarginChanges}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded tactile-btn shadow-sm"
                    >
                      {activeT.updateMarginBtn}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500 italic">
                🔒 {language === 'en' ? 'Proprietor & Finance Control: Profit margins and COGS are hidden from warehouse dispatch personnel (RBAC Protection).' : language === 'kn' ? 'ಮಾಲೀಕ ಮತ್ತು ಹಣಕಾಸು ನಿಯಂತ್ರಣ: ಗೋದಾಮು ಸಿಬ್ಬಂದಿಯಿಂದ ಲಾಭದ ಮಾಹಿತಿಯನ್ನು ಮರೆಮಾಡಲಾಗಿದೆ.' : 'मुनीम व सेठ-जी नियंत्रण: वित्तीय मुनाफा दर गोदाम स्टाफ से गोपनीय रखी गई है (RBAC Masked)।'}
              </div>
            )}

          </div>
        ) : (
          <div className="lg:col-span-7 flex items-center justify-center p-12 text-slate-500">
            कृपया देखने हेतु बाईं ओर से कोई सौदा चुनें।
          </div>
        )}

      </div>

      {/* Dharam Kanta Weighbridge Slip Modal */}
      {weighbridgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white m-0">श्री राम कंप्यूटरीकृत धर्म कांटा</h3>
                  <p className="text-xs text-slate-400">किशनगढ़ औद्योगिक बाईपास, अजमेर रोड (राज.)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWeighbridgeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Weighbridge Slip Core Details */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
                <span>पर्ची संख्या (Slip No): <strong className="font-mono text-amber-400">{selectedDeal.dispatch.weighbridgeSlipNo || 'WB-2026-9921'}</strong></span>
                <span className="font-mono text-slate-400">04-10-2026 14:22:10</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block">गाड़ी नंबर:</span>
                  <span className="font-mono font-bold text-white text-sm">{selectedDeal.dispatch.vehicleNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">चालक:</span>
                  <span className="text-white font-medium">{selectedDeal.dispatch.driverName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">माल विवरण:</span>
                  <span className="text-white font-medium">{selectedDeal.items[0]?.name || 'UltraTech Cement'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">पार्टी (ग्राहक):</span>
                  <span className="text-white font-medium">{selectedDeal.partyName}</span>
                </div>
              </div>

              {/* Gross, Tare & Net Weights Calculator */}
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">सकल वजन (Gross Kg):</label>
                    <input
                      type="number"
                      value={grossWeightInput}
                      onChange={(e) => setGrossWeightInput(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 font-mono text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">खाली वजन (Tare Kg):</label>
                    <input
                      type="number"
                      value={tareWeightInput}
                      onChange={(e) => setTareWeightInput(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 font-mono text-white text-sm"
                    />
                  </div>
                </div>

                {/* Net Results Banner */}
                {(() => {
                  const netKg = grossWeightInput - tareWeightInput;
                  const netTonnes = netKg / 1000;
                  const bags = Math.round(netKg / 50);
                  const isNormal = netKg > 0;
                  return (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-amber-300 font-semibold block">शुद्ध वजन (Net Weight):</span>
                        <span className="text-lg font-black font-mono text-white">
                          {isNormal ? netKg.toLocaleString('en-IN') : 0} kg
                        </span>
                        <span className="text-xs text-amber-400 font-mono ml-2">
                          ({isNormal ? netTonnes.toFixed(2) : 0} MT)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">50kg बोरी समकक्ष:</span>
                        <span className="text-base font-bold font-mono text-emerald-400">
                          {isNormal ? bags : 0} बोरी
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Certified Stamp */}
              <div className="flex items-center justify-between pt-2 text-[11px] text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>कांटा ऑपरेटर द्वारा डिजिटल हस्ताक्षरित व प्रमाणित</span>
                </span>
                <span className="font-mono text-slate-500">Seal #KD-88</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWeighbridgeModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                बंद करें
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('कांटा रसीद प्रिंटर / व्हाट्सएप के लिए तैयार है!');
                  setWeighbridgeModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>पर्ची प्रिंट / शेयर करें</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Textile Thaan & Lot Cut-Length Breakdown Modal */}
      {thaanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white m-0">थान व लॉट कट-लेंथ ट्रैकर (Textile Thaan Register)</h3>
                  <p className="text-xs text-slate-400">भीलवाड़ा टेक्सटाइल डाइंग लॉट व पन्ना लॉकिंग</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setThaanModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lot Summary Card */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">लॉट संख्या:</span>
                <span className="font-mono font-bold text-amber-400">Lot #104</span>
              </div>
              <div>
                <span className="text-slate-500 block">शेड व रंग:</span>
                <span className="text-white font-medium">Shade 14-B (गुलाबी)</span>
              </div>
              <div>
                <span className="text-slate-500 block">पन्ना (Width):</span>
                <span className="text-white font-mono">44 Inches</span>
              </div>
              <div>
                <span className="text-slate-500 block">कुल थान:</span>
                <span className="font-mono font-bold text-emerald-400">18 थान (704.5m)</span>
              </div>
            </div>

            {/* Individual Thaans Breakdown Grid */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">थान सूची (Individual Roll Lengths):</span>
                <span className="text-[11px] text-slate-400">4 थान इस सौदे हेतु आरक्षित</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 text-xs">
                {[
                  { id: 'T-01', length: 34.2, status: 'RESERVED' },
                  { id: 'T-02', length: 38.5, status: 'RESERVED' },
                  { id: 'T-03', length: 41.0, status: 'RESERVED' },
                  { id: 'T-04', length: 36.8, status: 'RESERVED' },
                  { id: 'T-05', length: 39.5, status: 'AVAILABLE' },
                  { id: 'T-06', length: 42.0, status: 'AVAILABLE' },
                  { id: 'T-07', length: 37.4, status: 'AVAILABLE' },
                  { id: 'T-08', length: 40.1, status: 'AVAILABLE' },
                  { id: 'T-09', length: 38.8, status: 'AVAILABLE' },
                  { id: 'T-10', length: 44.2, status: 'AVAILABLE' },
                  { id: 'T-11', length: 35.6, status: 'AVAILABLE' },
                  { id: 'T-12', length: 41.5, status: 'AVAILABLE' },
                ].map(roll => (
                  <div
                    key={roll.id}
                    className={`p-2 rounded-lg border flex items-center justify-between font-mono ${
                      roll.status === 'RESERVED'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{roll.id}</span>
                    <span className="font-bold">{roll.length}m</span>
                    {roll.status === 'RESERVED' && (
                      <Lock className="w-3 h-3 text-amber-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quality & Batch Integrity Guarantee */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>डाइंग लॉट मैचिंग सक्रिय: ग्राहक को जाने वाले सभी 4 थान एक ही डाइंग लॉट (#104) से हैं, रंग में कोई फर्क नहीं आएगा।</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setThaanModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                बंद करें
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={!!invoiceModalDeal}
        deal={invoiceModalDeal}
        onClose={() => setInvoiceModalDeal(null)}
      />

    </div>
  );
};
