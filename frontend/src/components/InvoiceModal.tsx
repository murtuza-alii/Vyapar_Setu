import React from 'react';
import { DealCard } from '../types';
import { X, Printer, Share2 } from 'lucide-react';

// ─────────────────────────────────────────────
// Hardcoded firm / seller details (mock)
// ─────────────────────────────────────────────
const FIRM = {
  nameHindi: 'एपेक्स ट्रेडिंग एंड डिस्ट्रीब्यूशन',
  nameEnglish: 'Apex Trading & Distribution Co.',
  address: 'Central Wholesale Trade Complex, Mumbai • Bengaluru • Delhi • Pan-India',
  gstin: '29ABCDE1234F1Z5',
  phone: '+91 98800 12345',
  upi: 'payments@apextrading',
} as const;

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface InvoiceModalProps {
  isOpen: boolean;
  deal: DealCard | null;
  onClose: () => void;
}

// ─────────────────────────────────────────────
// Helper: build WhatsApp share text
// ─────────────────────────────────────────────
function buildWhatsAppText(deal: DealCard): string {
  const lines: string[] = [
    `🧾 *Invoice / बिल - ${FIRM.nameEnglish}*`,
    `Invoice No: *${deal.dealNumber}*   Date: ${deal.createdAt}`,
    `GSTIN: ${FIRM.gstin}`,
    ``,
    `*Bill To:*`,
    `${deal.partyName}, ${deal.partyCity}`,
    `📞 ${deal.partyPhone}`,
    ``,
    `*Items:*`,
    ...deal.items.map(
      (item) =>
        `• ${item.name} | ${item.quantity} ${item.unit} @ ₹${item.rate.toLocaleString('en-IN')} = ₹${item.subtotal.toLocaleString('en-IN')}`
    ),
    ``,
    `*Total Amount:* ₹${deal.totalAmount.toLocaleString('en-IN')}`,
    `*Advance Received:* ₹${deal.advanceReceived.toLocaleString('en-IN')}`,
    `*Balance Due:* ₹${deal.balanceDue.toLocaleString('en-IN')}`,
    `*Payment Terms:* ${deal.paymentTerms}`,
    ``,
    deal.dispatch
      ? `*Dispatch:* ${deal.dispatch.vehicleNo} | ${deal.dispatch.transporterName} | Bilty: ${deal.dispatch.biltyNo}`
      : '',
    ``,
    `_Vyapar Setu Pan-India B2B Wholesale Operating System_`,
  ];
  return lines.filter((l) => l !== undefined).join('\n');
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, deal, onClose }) => {
  if (!isOpen || !deal) return null;

  const subtotal = deal.items.reduce((sum, item) => sum + item.subtotal, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppText(deal));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Print-only CSS: hide modal chrome and show just the invoice */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area,
          #invoice-print-area * { visibility: visible; }
          #invoice-print-area {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 24px;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ── Modal overlay ── */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto animate-in fade-in duration-200 no-print">
        {/* ── Dialog shell ── */}
        <div className="relative bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl my-6">

          {/* ── Action bar (hidden on print) ── */}
          <div className="no-print flex items-center justify-between gap-3 px-5 py-3 bg-slate-100 rounded-t-2xl border-b border-slate-200">
            <span className="text-sm font-bold text-slate-700">Invoice / बिल प्रिव्यू</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share via WhatsApp
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save as PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Printable Invoice body ── */}
          <div id="invoice-print-area" className="p-6 sm:p-8 space-y-6 text-sm bg-white rounded-b-2xl">

            {/* ════ HEADER ════ */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b-2 border-slate-300">
              {/* Firm details */}
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{FIRM.nameHindi}</h1>
                <p className="text-base font-bold text-slate-700">{FIRM.nameEnglish}</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">{FIRM.address}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span><span className="font-semibold">GSTIN:</span> {FIRM.gstin}</span>
                  <span><span className="font-semibold">Ph:</span> {FIRM.phone}</span>
                  <span><span className="font-semibold">UPI:</span> {FIRM.upi}</span>
                </div>
              </div>

              {/* Invoice meta */}
              <div className="text-right sm:text-right space-y-1">
                <div className="inline-block bg-amber-50 border border-amber-300 rounded-lg px-4 py-2">
                  <p className="text-[11px] text-amber-700 font-semibold uppercase tracking-wide">Tax Invoice / बिल</p>
                  <p className="text-lg font-black text-amber-800 font-mono">{deal.dealNumber}</p>
                </div>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Date:</span> {deal.createdAt}
                </p>
              </div>
            </div>

            {/* ════ BILL TO ════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Bill To / खरीदार</p>
                <p className="font-bold text-slate-900 text-base">{deal.partyName}</p>
                <p className="text-xs text-slate-600">{deal.partyCity}</p>
                <p className="text-xs text-slate-600 font-mono">{deal.partyPhone}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Seller / विक्रेता</p>
                <p className="font-bold text-slate-900 text-base">{FIRM.nameHindi}</p>
                <p className="text-xs text-slate-600">{FIRM.nameEnglish}</p>
                <p className="text-xs text-slate-600 font-mono">{FIRM.phone}</p>
              </div>
            </div>

            {/* ════ ITEMS TABLE ════ */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="border border-slate-700 px-3 py-2 text-left font-bold">#</th>
                    <th className="border border-slate-700 px-3 py-2 text-left font-bold">Item / विवरण</th>
                    <th className="border border-slate-700 px-3 py-2 text-right font-bold">Qty</th>
                    <th className="border border-slate-700 px-3 py-2 text-center font-bold">Unit</th>
                    <th className="border border-slate-700 px-3 py-2 text-right font-bold">Rate (₹)</th>
                    <th className="border border-slate-700 px-3 py-2 text-right font-bold">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {deal.items.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-200 px-3 py-2 font-mono text-slate-500">{idx + 1}</td>
                      <td className="border border-slate-200 px-3 py-2">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        {item.details && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.details}</p>
                        )}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 text-right font-mono">{item.quantity.toLocaleString('en-IN')}</td>
                      <td className="border border-slate-200 px-3 py-2 text-center text-slate-600">{item.unit}</td>
                      <td className="border border-slate-200 px-3 py-2 text-right font-mono">{item.rate.toLocaleString('en-IN')}</td>
                      <td className="border border-slate-200 px-3 py-2 text-right font-mono font-semibold">{item.subtotal.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {/* Subtotal row */}
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={5} className="border border-slate-300 px-3 py-2 text-right text-slate-700">
                      Sub-Total / उप-योग
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right font-mono text-slate-900">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ════ PAYMENT SUMMARY ════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Payment terms */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wide mb-2">Payment Terms / भुगतान शर्तें</p>
                <p className="text-slate-700">{deal.paymentTerms}</p>
                <p className="text-[11px] text-slate-500 mt-1">UPI: <span className="font-mono text-slate-700">{FIRM.upi}</span></p>
              </div>

              {/* Amount summary */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 text-slate-600 border-b border-slate-200">Total Amount / कुल राशि</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold border-b border-slate-200">
                        ₹{deal.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-emerald-700 border-b border-slate-200">Advance Received / अग्रिम जमा</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-700 border-b border-slate-200">
                        - ₹{deal.advanceReceived.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className={deal.balanceDue > 0 ? 'bg-amber-50' : 'bg-emerald-50'}>
                      <td className={`px-3 py-2.5 font-bold text-sm ${deal.balanceDue > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                        Balance Due / बकाया राशि
                      </td>
                      <td className={`px-3 py-2.5 text-right font-mono font-black text-base ${deal.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        ₹{deal.balanceDue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ════ DISPATCH / BILTY SECTION ════ */}
            {deal.dispatch && (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <p className="text-[11px] font-bold text-sky-700 uppercase tracking-wide mb-3">
                  Dispatch Details / गाड़ी रवानगी व बिल्टी
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                  <div>
                    <p className="text-[11px] text-sky-600 font-semibold">Vehicle No / वाहन संख्या</p>
                    <p className="font-mono font-bold text-slate-900">{deal.dispatch.vehicleNo}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-sky-600 font-semibold">Driver / चालक</p>
                    <p className="font-medium text-slate-900">{deal.dispatch.driverName}</p>
                    <p className="font-mono text-[11px] text-slate-500">{deal.dispatch.driverPhone}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-sky-600 font-semibold">Transporter / ट्रांसपोर्टर</p>
                    <p className="font-medium text-slate-900">{deal.dispatch.transporterName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-sky-600 font-semibold">Bilty No / बिल्टी संख्या</p>
                    <p className="font-mono font-bold text-slate-900">{deal.dispatch.biltyNo}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-sky-600 font-semibold">Freight Terms / भाड़ा</p>
                    <p className="font-semibold text-slate-900">
                      {deal.dispatch.freightTerms === 'PAID' ? 'Freight Paid / भाड़ा भुगतान' : 'To Pay / भाड़ा बाकी'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-sky-600 font-semibold">Freight Amount / भाड़ा राशि</p>
                    <p className="font-mono font-bold text-slate-900">₹{deal.dispatch.freightAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ════ FOOTER ════ */}
            <div className="pt-4 border-t border-dashed border-slate-300 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-600">
                व्यापार सेतु डिजिटल बही-खाता द्वारा जारी
              </p>
              <p className="text-[11px] text-slate-400 italic">
                This is a computer-generated document and does not require a physical signature.
              </p>
              <p className="text-[11px] text-slate-400">
                Thank you for your business! — धन्यवाद
              </p>
            </div>

          </div>{/* end #invoice-print-area */}
        </div>{/* end dialog */}
      </div>{/* end overlay */}
    </>
  );
};
