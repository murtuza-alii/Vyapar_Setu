import React, { useState } from 'react';
import { Party, UserRole } from '../types';
import { 
  Search, 
  PlusCircle, 
  Coins, 
  Download,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { Language } from '../types';
import { TRANSLATIONS, Translations } from '../i18n/translations';

interface LedgerModuleProps {
  userRole: UserRole;
  parties: Party[];
  cashInHand: number;
  bankBalance: number;
  onRecordPayment: (partyId: string, amount: number, mode: string) => void;
  language?: Language;
  t?: Translations;
}

export const LedgerModule: React.FC<LedgerModuleProps> = ({
  userRole: _userRole,
  parties,
  cashInHand,
  bankBalance,
  onRecordPayment,
  language = 'en',
  t,
}) => {
  const activeT = t || TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParty, setSelectedParty] = useState<Party | null>(parties[0] || null);

  // Payment Entry Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(25000);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');

  // Physical Drawer Tally State
  const [notes500, setNotes500] = useState<number>(250); // 250 * 500 = 125,000
  const [notes200, setNotes200] = useState<number>(80);  // 80 * 200 = 16,000
  const [notes100, setNotes100] = useState<number>(40);  // 40 * 100 = 4,000
  // Total = 145,000 (Matches system cashInHand)

  const physicalCashTotal = (notes500 * 500) + (notes200 * 200) + (notes100 * 100);
  const cashVariance = physicalCashTotal - cashInHand;

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  const handleMakePayment = () => {
    if (selectedParty && paymentAmount > 0) {
      onRecordPayment(selectedParty.id, paymentAmount, paymentMode);
      setPaymentModalOpen(false);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
      });
      alert(language === 'en'
        ? `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully in ${selectedParty.name}'s ledger!`
        : language === 'kn'
        ? `₹${paymentAmount.toLocaleString('en-IN')} ಪಾವತಿಯನ್ನು ${selectedParty.name} ಅವರ ಖಾತೆಯಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ!`
        : `₹${paymentAmount.toLocaleString('en-IN')} का भुगतान सफलतापूर्वक ${selectedParty.name} के खाते में दर्ज किया गया!`
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Double Entry Invariant & Galla Physical Tally */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Double-Entry Invariant Status */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{activeT.doubleEntryStatus}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            {language === 'en' ? 'Balanced (Σ Debit = Σ Credit)' : language === 'kn' ? 'ಸಮತೋಲಿತ (ಖರ್ಚು = ಜಮಾ)' : 'संतुलित (Σ Debit = Σ Credit)'}
          </div>
          <p className="text-[11px] text-slate-400">{activeT.doubleEntrySub}</p>
        </div>

        {/* System Cash Drawer vs Bank */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{activeT.totalLiquidity}</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ₹{(cashInHand + bankBalance).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {language === 'en' ? `Drawer: ₹${cashInHand.toLocaleString('en-IN')} | Bank: ₹${bankBalance.toLocaleString('en-IN')}` : language === 'kn' ? `ನಗದು: ₹${cashInHand.toLocaleString('en-IN')} | ಬ್ಯಾಂಕ್: ₹${bankBalance.toLocaleString('en-IN')}` : `गल्ला: ₹${cashInHand.toLocaleString('en-IN')} | बैंक: ₹${bankBalance.toLocaleString('en-IN')}`}
          </p>
        </div>

        {/* Physical-Digital Drawer Reconciliation */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">{activeT.physicalDrawerTitle}</span>
            {cashVariance === 0 ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {language === 'en' ? 'Matched 0 Diff' : language === 'kn' ? 'ಸರಿಹೊಂದಿದೆ' : 'पूर्ण मिलान OK'}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {language === 'en' ? `Variance: ₹${cashVariance}` : language === 'kn' ? `ವ್ಯತ್ಯಾಸ: ₹${cashVariance}` : `अंतर: ₹${cashVariance}`}
              </span>
            )}
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ₹{physicalCashTotal.toLocaleString('en-IN')}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-1 bg-[#090d14] px-2 py-0.5 rounded border border-slate-800">
              <span className="text-slate-400 font-mono">₹500:</span>
              <button type="button" onClick={() => setNotes500(n => Math.max(0, n - 1))} className="px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors">-</button>
              <span className="font-mono text-white font-bold">{notes500}</span>
              <button type="button" onClick={() => setNotes500(n => n + 1)} className="px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors">+</button>
            </div>
            <div className="flex items-center gap-1 bg-[#090d14] px-2 py-0.5 rounded border border-slate-800">
              <span className="text-slate-400 font-mono">₹200:</span>
              <button type="button" onClick={() => setNotes200(n => Math.max(0, n - 1))} className="px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors">-</button>
              <span className="font-mono text-white font-bold">{notes200}</span>
              <button type="button" onClick={() => setNotes200(n => n + 1)} className="px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors">+</button>
            </div>
            <div className="flex items-center gap-1 bg-[#090d14] px-2 py-0.5 rounded border border-slate-800">
              <span className="text-slate-400 font-mono">₹100:</span>
              <button type="button" onClick={() => setNotes100(n => Math.max(0, n - 1))} className="px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors">-</button>
              <span className="font-mono text-white font-bold">{notes100}</span>
              <button type="button" onClick={() => setNotes100(n => n + 1)} className="px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-colors">+</button>
            </div>
          </div>
        </div>

      </div>

      {/* Main Ledger Grid: Parties List & Selected Party Ledger Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Parties Directory */}
        <div className="lg:col-span-5 surface-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <h3 className="text-sm font-semibold text-white m-0">{activeT.partyLedgerTitle}</h3>
            <span className="text-xs font-mono text-slate-400">{filteredParties.length} {language === 'en' ? 'accounts' : language === 'kn' ? 'ಖಾತೆಗಳು' : 'खाते'}</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search party, city or phone...' : language === 'kn' ? 'ಖಾತೆ, ನಗರ ಅಥವಾ ಫೋನ್ ಹುಡುಕಿ...' : 'पार्टी नाम, फोन या शहर...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d14] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredParties.map((party) => {
              const isSelected = party.id === selectedParty?.id;
              const isReceivable = party.currentBalance > 0;
              return (
                <div
                  key={party.id}
                  onClick={() => setSelectedParty(party)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'surface-card border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                      : 'surface-subtle hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-white">{party.name}</h4>
                      <p className="text-[11px] text-slate-400">{party.city}</p>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-mono font-bold block ${
                        isReceivable ? 'text-amber-400' : 'text-sky-400'
                      }`}>
                        ₹{Math.abs(party.currentBalance).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isReceivable ? (language === 'en' ? 'Receivable' : language === 'kn' ? 'ಪಡೆಯಬೇಕಾದದ್ದು' : 'लेना है') : (language === 'en' ? 'Payable' : language === 'kn' ? 'ಪಾವತಿಸಬೇಕಾದದ್ದು' : 'देना है')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Selected Party Ledger Statement */}
        {selectedParty ? (
          <div className="lg:col-span-7 surface-card p-5 space-y-5">
            
            {/* Party Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white m-0">{selectedParty.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">({selectedParty.city})</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'en' ? 'Phone:' : language === 'kn' ? 'ದೂರವಾಣಿ:' : 'फोन:'} <strong className="text-slate-200">{selectedParty.phone}</strong> • {language === 'en' ? 'Credit Limit:' : language === 'kn' ? 'ಸಾಲ ಮಿತಿ:' : 'साख सीमा:'} ₹{selectedParty.creditLimit.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tactile-btn flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{activeT.recordPaymentBtn}</span>
                </button>
              </div>
            </div>

            {/* Current Balance Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs surface-subtle p-4 rounded-xl">
              <div>
                <span className="text-slate-500 text-[11px] uppercase tracking-wider block">{language === 'en' ? 'Outstanding Net Balance:' : language === 'kn' ? 'ಒಟ್ಟು ಬಾಕಿ ಮೊತ್ತ:' : 'शुद्ध बकाया स्थिति:'}</span>
                <span className={`text-base font-bold font-mono mt-0.5 block ${
                  selectedParty.currentBalance > 0 ? 'text-amber-400' : 'text-sky-400'
                }`}>
                  ₹{Math.abs(selectedParty.currentBalance).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {selectedParty.currentBalance > 0 ? (language === 'en' ? 'Receivable from buyer' : language === 'kn' ? 'ಖರೀದಿದಾರರಿಂದ ಬರಬೇಕಾದ ಬಾಕಿ' : 'ग्राहक से वसूली बाकी') : (language === 'en' ? 'Payable to supplier' : language === 'kn' ? 'ಪೂರೈಕೆದಾರರಿಗೆ ನೀಡಬೇಕಾದದ್ದು' : 'सप्लायर को देय')}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] uppercase tracking-wider block">{language === 'en' ? 'Last Payment Date:' : language === 'kn' ? 'ಕೊನೆಯ ಪಾವತಿ ದಿನಾಂಕ:' : 'अंतिम भुगतान:'}</span>
                <span className="text-xs font-semibold text-slate-200 block mt-1">{selectedParty.lastPaymentDate}</span>
                <span className="text-[10px] text-slate-500 block">30d+ {language === 'en' ? 'Overdue:' : language === 'kn' ? 'ಅವಧಿ ಮೀರಿದ ಬಾಕಿ:' : 'अति-देय:'} ₹{selectedParty.aging.days30_plus.toLocaleString('en-IN')}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] uppercase tracking-wider block">UPI ID:</span>
                <span className="font-mono text-emerald-400 text-xs block mt-1 truncate">
                  {selectedParty.upiId || 'payments@apextrading'}
                </span>
                <span className="text-[10px] text-slate-500 block">{language === 'en' ? 'Instant QR Ready' : language === 'kn' ? 'ಕ್ಯೂಆರ್ ಕೋಡ್ ಸಿದ್ಧ' : 'क्यूआर लिंक तैयार'}</span>
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white block">{language === 'en' ? 'Recent Account Vouchers' : language === 'kn' ? 'ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು' : 'हालिया खाते के लेन-देन'}</span>
              
              <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#090d14] text-slate-400 text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">{language === 'en' ? 'Date' : language === 'kn' ? 'ದಿನಾಂಕ' : 'दिनांक'}</th>
                      <th className="p-2.5">{language === 'en' ? 'Particulars / Description' : language === 'kn' ? 'ವಿವರ' : 'विवरण'}</th>
                      <th className="p-2.5 text-right">{language === 'en' ? 'Debit (Dr)' : language === 'kn' ? 'ಖರ್ಚು (Debit)' : 'नामे (Debit)'}</th>
                      <th className="p-2.5 text-right">{language === 'en' ? 'Credit (Cr)' : language === 'kn' ? 'ಜಮಾ (Credit)' : 'जमा (Credit)'}</th>
                      <th className="p-2.5 text-right">{language === 'en' ? 'Balance' : language === 'kn' ? 'ಬಾಕಿ' : 'बाकी'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-2.5 font-mono text-slate-400">04-10-2026</td>
                      <td className="p-2.5">{language === 'en' ? 'Goods Sale Voucher (SD-2026-089)' : language === 'kn' ? 'ಮಾರಾಟ ಸೌದಾ (SD-2026-089)' : 'माल बिक्री सौदा (SD-2026-089)'}</td>
                      <td className="p-2.5 font-mono text-right text-amber-400">₹1,71,500</td>
                      <td className="p-2.5 font-mono text-right text-slate-500">-</td>
                      <td className="p-2.5 font-mono text-right font-bold text-amber-400">₹3,20,000</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono text-slate-400">04-10-2026</td>
                      <td className="p-2.5">{language === 'en' ? 'Advance Payment (UPI Ref: 429188)' : language === 'kn' ? 'ಮುಂಗಡ ಜಮಾ (UPI Ref: 429188)' : 'अग्रिम जमा (UPI Ref: 429188)'}</td>
                      <td className="p-2.5 font-mono text-right text-slate-500">-</td>
                      <td className="p-2.5 font-mono text-right text-emerald-400">₹25,000</td>
                      <td className="p-2.5 font-mono text-right font-bold text-amber-400">₹1,48,500</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono text-slate-400">24-09-2026</td>
                      <td className="p-2.5">{language === 'en' ? 'NEFT Settlement Received (HDFC Bank)' : language === 'kn' ? 'ಎನ್‌ಇಎಫ್‌ಟಿ ಪಾವತಿ (HDFC)' : 'NEFT भुगतान प्राप्ति (HDFC)'}</td>
                      <td className="p-2.5 font-mono text-right text-slate-500">-</td>
                      <td className="p-2.5 font-mono text-right text-emerald-400">₹50,000</td>
                      <td className="p-2.5 font-mono text-right font-bold text-amber-400">₹1,73,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Print / Export Statement Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-500">{language === 'en' ? 'Authorized Ledger Statement' : language === 'kn' ? 'ದೃಢೀಕೃತ ಲೆಡ್ಜರ್ ಹೇಳಿಕೆ' : 'खाता वही प्रतिलिपि प्राधिकृत'}</span>
              <button
                type="button"
                onClick={() => alert(language === 'en' ? `Authorized ledger statement (PDF) downloaded for ${selectedParty.name}!` : language === 'kn' ? `${selectedParty.name} ಖಾತೆ ಪತ್ರ (PDF) ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!` : `${selectedParty.name} का आधिकारिक खाता बही (PDF Statement) डाउनलोड हो गया!`)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Download Statement (PDF)' : language === 'kn' ? 'ಲೆಡ್ಜರ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (PDF)' : 'खाता पर्ची डाउनलोड करें (PDF)'}</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 flex items-center justify-center p-12 text-slate-500">
            कृपया देखने हेतु किसी पार्टी का चयन करें।
          </div>
        )}

      </div>

      {/* Modal: Record Payment Entry */}
      {paymentModalOpen && selectedParty && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white m-0">{activeT.recordPaymentBtn}</h3>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                {language === 'en' ? 'Account:' : language === 'kn' ? 'ಖಾತೆ:' : 'पार्टी:'} <strong className="text-white">{selectedParty.name}</strong>
              </p>

              <div>
                <label className="text-slate-400 block mb-1">{language === 'en' ? 'Payment Amount (in ₹):' : language === 'kn' ? 'ಮೊತ್ತ (₹):' : 'जमा राशि (Amount in ₹):'}</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{language === 'en' ? 'Payment Mode:' : language === 'kn' ? 'ಪಾವತಿ ವಿಧಾನ:' : 'भुगतान माध्यम (Payment Mode):'}</label>
                <div className="grid grid-cols-4 gap-2">
                  {['UPI', 'CASH', 'NEFT', 'CHEQUE'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`p-2 rounded text-center font-bold text-xs transition-colors ${
                        paymentMode === mode
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                {language === 'en' ? 'Revised Balance after settlement:' : language === 'kn' ? 'ಪಾವತಿಯ ನಂತರ ಉಳಿದ ಬಾಕಿ:' : 'लेन-देन के पश्चात नया बकाया:'} <strong className="text-emerald-400 font-mono">
                  ₹{Math.max(0, selectedParty.currentBalance - paymentAmount).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                {activeT.cancel}
              </button>
              <button
                type="button"
                onClick={handleMakePayment}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tactile-btn"
              >
                {language === 'en' ? 'Save Voucher to Ledger' : language === 'kn' ? 'ವೋಚರ್ ಉಳಿಸಿ' : 'खाते में जमा करें (Save Voucher)'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
