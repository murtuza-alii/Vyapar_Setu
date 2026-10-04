import React, { useState, useEffect, useCallback } from 'react';
import { X, IndianRupee, TrendingUp } from 'lucide-react';
import {
  TradeMode,
  Party,
  DealCard,
  DealItem,
  DispatchDetails,
  DeliveryCheck,
} from '../types';

import { Language } from '../types';
import { TRANSLATIONS, Translations } from '../i18n/translations';

// ─── Props ──────────────────────────────────────────────────────────────────

interface NewDealModalProps {
  isOpen: boolean;
  tradeMode: TradeMode;
  parties: Party[];
  onClose: () => void;
  onCreateDeal: (deal: DealCard) => void;
  language?: Language;
  t?: Translations;
}

// ─── Unit Options ────────────────────────────────────────────────────────────

const TEXTILE_UNITS = ['Meters', 'Thaan'] as const;
const BUILDING_UNITS = ['Bags', 'Tonnes', 'Bundles'] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function NewDealModal({
  isOpen,
  tradeMode,
  parties,
  onClose,
  onCreateDeal,
  language = 'en',
  t,
}: NewDealModalProps) {
  const activeT = t || TRANSLATIONS[language];
  // ── Form state ──
  const [partyId, setPartyId] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [lotGrade, setLotGrade] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>(tradeMode === 'TEXTILE' ? 'Meters' : 'Bags');
  const [rate, setRate] = useState<string>('');
  const [advance, setAdvance] = useState<string>('0');
  const [paymentTerms, setPaymentTerms] = useState<string>('30 Days Net');
  const [vehicleNo, setVehicleNo] = useState<string>('');
  const [transporter, setTransporter] = useState<string>('National Roadways Express');
  const [freightTerms, setFreightTerms] = useState<'PAID' | 'TO_PAY'>('PAID');
  const [errors, setErrors] = useState<string[]>([]);

  // Reset unit when tradeMode changes
  useEffect(() => {
    setUnit(tradeMode === 'TEXTILE' ? 'Meters' : 'Bags');
  }, [tradeMode]);

  // ── Derived calculations ──
  const qty = parseFloat(quantity) || 0;
  const rateNum = parseFloat(rate) || 0;
  const advanceNum = parseFloat(advance) || 0;

  const totalAmount = qty * rateNum;
  const balanceDue = totalAmount - advanceNum;
  const landedCost = totalAmount * 0.82;
  const freight = tradeMode === 'TEXTILE' ? 2400 : 5000;
  const hamali = 500;
  const revenue = totalAmount;
  const netMargin =
    revenue > 0
      ? ((revenue - (landedCost + freight + hamali)) / revenue) * 100
      : 0;

  // ── Validation ──
  const isValid = partyId !== '' && qty > 0 && rateNum > 0;

  // ── Close on Escape ──
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // ── Submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];
    if (!partyId) validationErrors.push(language === 'en' ? 'Select a buyer / party' : language === 'kn' ? 'ಖಾತೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'पार्टी चुनें (Select a party)');
    if (qty <= 0) validationErrors.push(language === 'en' ? 'Quantity must be greater than 0' : language === 'kn' ? 'ಪ್ರಮಾಣ 0 ಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬೇಕು' : 'मात्रा सही दर्ज करें (Qty > 0)');
    if (rateNum <= 0) validationErrors.push(language === 'en' ? 'Rate must be greater than 0' : language === 'kn' ? 'ದರ 0 ಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬೇಕು' : 'रेट सही दर्ज करें (Rate > 0)');
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    const selectedParty = parties.find((p) => p.id === partyId)!;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const itemId = `item-${Date.now()}`;

    const dealItem: DealItem = {
      id: itemId,
      name: itemName || (tradeMode === 'TEXTILE' ? 'Fabric' : 'Material'),
      details: `${lotGrade}, ${qty} ${unit}`,
      quantity: qty,
      unit,
      rate: rateNum,
      landedCost: rateNum * 0.82,
      subtotal: totalAmount,
    };

    const dispatch: DispatchDetails = {
      vehicleNo: vehicleNo || 'TBD',
      driverName: '',
      driverPhone: '',
      transporterName: transporter,
      biltyNo: `BIL-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      freightTerms,
      freightAmount: freight,
    };

    const delivery: DeliveryCheck = {
      deliveredQty: 0,
      acceptedQty: 0,
      damagedQty: 0,
      shortageQty: 0,
      creditNoteIssued: 0,
      isConfirmed: false,
    };

    const profitBand =
      netMargin >= 10 ? 'HEALTHY' : netMargin >= 5 ? 'THIN' : 'LOSS';

    const newDeal: DealCard = {
      id: `deal-${Date.now()}`,
      dealNumber: `SD-2026-${randomSuffix}`,
      title: `${qty} ${unit} ${itemName || 'Item'} (${lotGrade || 'N/A'})`,
      tradeMode,
      partyId: selectedParty.id,
      partyName: selectedParty.name,
      partyCity: selectedParty.city,
      partyPhone: selectedParty.phone,
      createdAt: new Date()
        .toLocaleString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        .replace(',', ''),
      stage: 'SAUDA_CONFIRMED',
      items: [dealItem],
      totalAmount,
      advanceReceived: advanceNum,
      balanceDue,
      paymentTerms,
      dispatch,
      delivery,
      margin: {
        grossRevenue: totalAmount,
        landedCost,
        freightCost: freight,
        hamaliCost: hamali,
        cashDiscount: 0,
        dalaliBrokerage: 0,
        netProfit: revenue - (landedCost + freight + hamali),
        netMarginPercent: parseFloat(netMargin.toFixed(2)),
        profitBand,
      },
      notes: '',
    };

    onCreateDeal(newDeal);

    // Reset form
    setPartyId('');
    setItemName('');
    setLotGrade('');
    setQuantity('');
    setUnit(tradeMode === 'TEXTILE' ? 'Meters' : 'Bags');
    setRate('');
    setAdvance('0');
    setPaymentTerms('30 Days Net');
    setVehicleNo('');
    setTransporter('Somnath Golden Roadways');
    setFreightTerms('PAID');
    onClose();
  };

  if (!isOpen) return null;

  const unitOptions = tradeMode === 'TEXTILE' ? TEXTILE_UNITS : BUILDING_UNITS;

  // Shared input classes
  const inputCls =
    'w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors';
  const labelCls = 'block text-xs font-semibold text-slate-400 mb-1';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-amber-400">{activeT.createDealTitle}</h2>
            <p className="text-xs text-slate-400">
              {activeT.createDealSubtitle} —{' '}
              {tradeMode === 'TEXTILE' ? activeT.textileMode : activeT.buildingMode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tactile-btn p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <form id="new-deal-form" onSubmit={handleSubmit} noValidate>
            {/* Validation errors */}
            {errors.length > 0 && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/40 p-3 space-y-1">
                {errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-400 font-medium">
                    • {err}
                  </p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              {/* Party selection — full width */}
              <div className="md:col-span-2">
                <label className={labelCls}>
                  {activeT.selectParty}
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <select
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  className={inputCls}
                  required
                >
                  <option value="">{language === 'en' ? '— Select Party / Buyer —' : language === 'kn' ? '— ಗ್ರಾಹಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ —' : '— पार्टी चुनें —'}</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Name */}
              <div>
                <label className={labelCls}>
                  {activeT.itemName}
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={
                    tradeMode === 'TEXTILE' ? 'e.g. 60x60 Cotton Cambric' : 'e.g. UltraTech OPC 43'
                  }
                  className={inputCls}
                />
              </div>

              {/* Lot / Grade */}
              <div>
                <label className={labelCls}>
                  {activeT.lotGrade}
                </label>
                <input
                  type="text"
                  value={lotGrade}
                  onChange={(e) => setLotGrade(e.target.value)}
                  placeholder={
                    tradeMode === 'TEXTILE' ? 'e.g. Lot #104' : 'e.g. Grade 43 OPC'
                  }
                  className={inputCls}
                />
              </div>

              {/* Quantity */}
              <div>
                <label className={labelCls}>
                  {activeT.quantity}
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="any"
                  className={inputCls}
                  required
                />
              </div>

              {/* Unit */}
              <div>
                <label className={labelCls}>
                  {activeT.unit}
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={inputCls}
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rate */}
              <div>
                <label className={labelCls}>
                  {activeT.rate}
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="any"
                    className={`${inputCls} pl-7`}
                    required
                  />
                </div>
              </div>

              {/* Advance Received */}
              <div>
                <label className={labelCls}>
                  {activeT.advanceAmount}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    value={advance}
                    onChange={(e) => setAdvance(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="any"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <label className={labelCls}>
                  {activeT.paymentTermsLabel}
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="30 Days Net"
                  className={inputCls}
                />
              </div>

              {/* Vehicle No */}
              <div>
                <label className={labelCls}>
                  {activeT.truckNo}
                </label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. KA-01-FA-4521"
                  className={inputCls}
                />
              </div>

              {/* Transporter */}
              <div>
                <label className={labelCls}>
                  {activeT.carrier}
                </label>
                <input
                  type="text"
                  value={transporter}
                  onChange={(e) => setTransporter(e.target.value)}
                  placeholder="National Express Cargo"
                  className={inputCls}
                />
              </div>

              {/* Freight Terms — full width */}
              <div className="md:col-span-2">
                <label className={labelCls}>
                  {activeT.freightTermsLabel}
                </label>
                <div className="flex gap-4 mt-1">
                  {(['PAID', 'TO_PAY'] as const).map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="freightTerms"
                        value={opt}
                        checked={freightTerms === opt}
                        onChange={() => setFreightTerms(opt)}
                        className="accent-amber-500"
                      />
                      <span
                        className={`text-sm font-semibold transition-colors ${
                          freightTerms === opt ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {opt === 'PAID' ? activeT.paid : activeT.toPay}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Calculated Summary Box ── */}
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {language === 'en' ? 'Deal Summary (Auto-Calculated)' : language === 'kn' ? 'ಸೌದಾ ಸಾರಾಂಶ (ಸ್ವಯಂಚಾಲಿತ)' : 'सौदा सारांश'}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SummaryRow
                  label={activeT.summaryTotal}
                  value={`₹${totalAmount.toLocaleString('en-IN')}`}
                  highlight={totalAmount > 0}
                  color="text-amber-400"
                />
                <SummaryRow
                  label={activeT.summaryBalance}
                  value={`₹${balanceDue.toLocaleString('en-IN')}`}
                  highlight={balanceDue > 0}
                  color="text-red-400"
                />
                <SummaryRow
                  label={activeT.summaryLanded}
                  value={`₹${Math.round(landedCost).toLocaleString('en-IN')}`}
                  color="text-slate-300"
                />
                <SummaryRow
                  label={activeT.summaryFreight}
                  value={`₹${freight.toLocaleString('en-IN')}`}
                  color="text-slate-300"
                />
                <SummaryRow
                  label={activeT.summaryHandling}
                  value="₹500"
                  color="text-slate-300"
                />
                <SummaryRow
                  label={activeT.summaryMargin}
                  value={`${netMargin.toFixed(1)}%`}
                  highlight={netMargin > 0}
                  color={
                    netMargin >= 10
                      ? 'text-emerald-400'
                      : netMargin >= 5
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }
                />
              </div>
              {totalAmount > 0 && (
                <p className="mt-2 text-[10px] text-slate-500">
                  {language === 'en' ? '* Net Margin = (Revenue − Landed Cost − Freight − Hamali) / Revenue × 100.' : language === 'kn' ? '* ನಿವ್ವಳ ಲಾಭ = (ಆದಾಯ − ವೆಚ್ಚ − ಸಾಗಣೆ − ಹಮಾಲಿ) / ಆದಾಯ × 100.' : '* Net Margin = (Revenue − Landed Cost − Freight − Hamali) / Revenue × 100.'}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* ── Footer Buttons ── */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="tactile-btn px-4 py-2 rounded-md text-sm font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {activeT.cancelBtn}
          </button>
          <button
            type="submit"
            form="new-deal-form"
            disabled={!isValid}
            className={`tactile-btn flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold transition-colors ${
              isValid
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-emerald-900/40 text-emerald-700 cursor-not-allowed'
            }`}
          >
            <IndianRupee className="w-4 h-4" />
            {activeT.createDealSubmit}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component: Summary Row ───────────────────────────────────────────────

interface SummaryRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}

function SummaryRow({ label, value, highlight = false, color = 'text-slate-300' }: SummaryRowProps) {
  return (
    <div className="bg-slate-900 rounded-lg px-3 py-2 border border-slate-800">
      <p className="text-[10px] text-slate-500 leading-tight mb-0.5">{label}</p>
      <p className={`font-mono text-sm font-bold ${highlight ? color : 'text-slate-400'}`}>
        {value}
      </p>
    </div>
  );
}
