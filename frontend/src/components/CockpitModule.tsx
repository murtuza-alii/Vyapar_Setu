import React, { useState, useRef } from 'react';
import { Party, TradeMode, UserRole, VoiceParsedTransaction, TextileItem, BuildingMaterialItem, Language } from '../types';
import { Translations, TRANSLATIONS } from '../i18n/translations';
import { 
  AlertTriangle, 
  Send, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft,
  PackageX,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

interface CockpitModuleProps {
  tradeMode: TradeMode;
  userRole: UserRole;
  parties: Party[];
  textileInventory: TextileItem[];
  buildingInventory: BuildingMaterialItem[];
  onCommitVoiceTransaction: (tx: VoiceParsedTransaction) => void;
  onUpdatePartyBalance: (partyId: string, amountPaid: number) => void;
  language?: Language;
  t?: Translations;
}

export const CockpitModule: React.FC<CockpitModuleProps> = ({
  tradeMode,
  userRole: _userRole,
  parties,
  textileInventory,
  buildingInventory,
  onCommitVoiceTransaction,
  onUpdatePartyBalance: _onUpdatePartyBalance,
  language = 'en',
  t,
}) => {
  const activeT = t || TRANSLATIONS[language];

  // Aging Bucket Filter: 'ALL' | '0_15' | '15_30' | '30_PLUS'
  const [selectedBucket, setSelectedBucket] = useState<'ALL' | '0_15' | '15_30' | '30_PLUS'>('30_PLUS');
  
  // WhatsApp Reminder Modal State
  const [activeReminderParty, setActiveReminderParty] = useState<Party | null>(null);
  const [copiedReminder, setCopiedReminder] = useState(false);

  // Voice/Text Input State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceInputText, setVoiceInputText] = useState('');
  const [parsedDraft, setParsedDraft] = useState<VoiceParsedTransaction | null>(null);
  const recognitionRef = useRef<any>(null);

  // Toggle Live Speech Recognition or fallback
  const toggleListening = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Simulate real speech prompt when browser lacks direct mic API
      handleParseSpeech(samplePrompts[0]);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setVoiceInputText(transcript);
        if (event.results[0] && event.results[0].isFinal) {
          handleParseSpeech(transcript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
      handleParseSpeech(samplePrompts[0]);
    }
  };

  // Calculate Aging Totals
  const totalReceivables = parties.reduce((sum, p) => (p.currentBalance > 0 ? sum + p.currentBalance : sum), 0);
  const bucket0_15Total = parties.reduce((sum, p) => sum + p.aging.days0_15, 0);
  const bucket15_30Total = parties.reduce((sum, p) => sum + p.aging.days15_30, 0);
  const bucket30PlusTotal = parties.reduce((sum, p) => sum + p.aging.days30_plus, 0);

  // Filter parties by selected aging bucket
  const filteredParties = parties.filter((p) => {
    if (p.currentBalance <= 0) return false;
    if (selectedBucket === 'ALL') return true;
    if (selectedBucket === '0_15') return p.aging.days0_15 > 0;
    if (selectedBucket === '15_30') return p.aging.days15_30 > 0;
    if (selectedBucket === '30_PLUS') return p.aging.days30_plus > 0;
    return true;
  });

  // Identify Dead Stock (>60 days)
  const deadStockItems = tradeMode === 'TEXTILE'
    ? textileInventory.filter(t => t.deadStockDays >= 60)
    : buildingInventory.filter(b => b.deadStockDays >= 60);

  const totalDeadStockCapital = tradeMode === 'TEXTILE'
    ? deadStockItems.reduce((sum, t) => sum + (t as TextileItem).totalMeters * (t as TextileItem).costRatePerMeter, 0)
    : deadStockItems.reduce((sum, b) => sum + (b as BuildingMaterialItem).stockOnHand * (b as BuildingMaterialItem).costRate, 0);

  // Sample quick dictation prompts based on active language
  const samplePrompts = language === 'kn'
    ? (tradeMode === 'TEXTILE'
        ? [
            "ಶರ್ಮಾ ಕ್ಲಾತ್ ಸ್ಟೋರ್‌ಗೆ 50 ಮೀಟರ್ ರೇಷ್ಮೆ 260 ರೂ ದರದಲ್ಲಿ ಮಾರಾಟ, 5000 ನಗದು ಮುಂಗಡ, ಉಳಿದದ್ದು ಸಾಲ",
            "ಮಹಾಲಕ್ಷ್ಮಿ ಕ್ಲಾತ್ ಎಂಪೋರಿಯಂನಿಂದ 25,000 ರೂ UPI ಮುಂಗಡ ಸ್ವೀಕರಿಸಲಾಗಿದೆ ಲಾಟ್ 104 ಸೌದಾಗೆ",
            "ಮಾರ್ವಾರ್ ಫ್ಯಾಬ್ರಿಕ್ ಹಬ್‌ಗೆ ಸೋಮನಾಥ್ ಟ್ರಾನ್ಸ್‌ಪೋರ್ಟ್ ಮೂಲಕ 40 ಥಾನ್ ಬಟ್ಟೆ ರವಾನಿಸಲಾಗಿದೆ",
          ]
        : [
            "ಹಾಡೋತಿ ಇನ್‌ಫ್ರಾಗೆ 20 ಟನ್ 43-ಗ್ರೇಡ್ ಸಿಮೆಂಟ್ ಕಳುಹಿಸಲಾಗಿದೆ 320 ರೂ ದರದಲ್ಲಿ, ಲಾರಿ RJ-14-GA-4521, 50000 ಮುಂಗಡ",
            "ಕಿಶನ್‌ಗಢ ಮಾರ್ಬಲ್‌ನಿಂದ 1,00,000 ರೂ RTGS ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
            "ಶ್ರೀ ರಾಮ್ ಬಿಲ್ಡರ್ಸ್‌ಗೆ 5 ಟನ್ 12mm TMT ಸರಳು 56800 ದರದಲ್ಲಿ ರವಾನಿಸಲಾಗಿದೆ",
          ])
    : language === 'hi'
    ? (tradeMode === 'TEXTILE'
        ? [
            "Sharma Cloth Store ko 50 meter Chanderi Silk diya 260 rupaye dar se, 5000 cash baki udhari",
            "Mahalaxmi Cloth Emporium se 25,000 rupaye UPI advance mila Lot 104 sauda ke liye",
            "Marwar Fabric Hub ko 40 thaan Cotton Cambric bheja Somnath transport se",
          ]
        : [
            "Hadoti Infra ko 20 tonne 43-Grade cement bheja 320 rupaye bori, truck RJ-14-GA-4521, 50000 advance",
            "Kishangarh Marble se 1,00,000 rupaye RTGS payment mila balance clear",
            "Shree Ram Builders ko 5 tonne 12mm TMT sariya bheja 56800 dar se",
          ])
    : (tradeMode === 'TEXTILE'
        ? [
            "Sold 50 meters Chanderi Silk to Sharma Cloth Store at Rs 260, received 5000 cash balance on credit",
            "Received 25,000 UPI advance from Mahalaxmi Cloth Emporium for Lot 104 deal",
            "Dispatched 40 thaan Cotton Cambric to Marwar Fabric Hub via Somnath transport",
          ]
        : [
            "Dispatched 20 tonne 43-Grade cement to Hadoti Infra at Rs 320 per bag, truck RJ-14-GA-4521, 50000 advance",
            "Received 1,00,000 RTGS payment from Kishangarh Marble balance clear",
            "Dispatched 5 tonne 12mm TMT sariya to Shree Ram Builders at Rs 56800 rate",
          ]);

  // NLP Voice Parser Simulator
  const handleParseSpeech = (text: string) => {
    setVoiceInputText(text);
    setIsRecording(false);

    // Heuristic entity extraction for trade syntax
    let partyName = 'Mahalaxmi Cloth Emporium';
    let txType: 'SALE' | 'PURCHASE' | 'PAYMENT_RECEIVED' = 'SALE';
    let itemName = tradeMode === 'TEXTILE' ? '60x60 Cotton Cambric' : 'UltraTech 43-Grade Cement';
    let lotOrGrade = tradeMode === 'TEXTILE' ? 'Lot #104' : 'Grade 43 OPC';
    let qty = 50;
    let unit = tradeMode === 'TEXTILE' ? 'Meters' : 'Bags';
    let rate = tradeMode === 'TEXTILE' ? 260 : 320;
    let cashPaid = 5000;

    const lower = text.toLowerCase();

    if (lower.includes('sharma') || lower.includes('ಶರ್ಮಾ') || lower.includes('mahalaxmi') || lower.includes('ಮಹಾಲಕ್ಷ್ಮಿ')) partyName = 'Mahalaxmi Textiles & Retail';
    else if (lower.includes('modern') || lower.includes('ಮಾಡರ್ನ್') || lower.includes('marwar') || lower.includes('ಮಾರ್ವಾರ್')) partyName = 'Modern Fabrics & Garments';
    else if (lower.includes('national') || lower.includes('ನ್ಯಾಷನಲ್') || lower.includes('builders') || lower.includes('ಬಿಲ್ಲರ್ಸ್')) partyName = 'National Builders & Hardware Stores';
    else if (lower.includes('deccan') || lower.includes('ಡೆಕ್ಕನ್') || lower.includes('infra') || lower.includes('ಇನ್‌ಫ್ರಾ')) partyName = 'Deccan Infrastructure & Cement Co.';
    else if (lower.includes('surat') || lower.includes('ಸೂರತ್') || lower.includes('distributors')) partyName = 'Surat Wholesale Fabric Distributors';

    if (lower.includes('mila') || lower.includes('payment') || lower.includes('advance') || lower.includes('ಪಡೆದ') || lower.includes('ಮುಂಗಡ') || lower.includes('received')) {
      txType = 'PAYMENT_RECEIVED';
      cashPaid = 25000;
      qty = 1;
      rate = 25000;
    } else {
      if (lower.includes('chanderi') || lower.includes('ರೇಷ್ಮೆ') || lower.includes('silk')) {
        itemName = 'Chanderi Zari Silk';
        rate = 260;
        qty = 50;
        unit = 'Meters';
      } else if (lower.includes('cement') || lower.includes('ಸಿಮೆಂಟ್')) {
        itemName = 'UltraTech OPC 43-Grade Cement';
        rate = 320;
        qty = 400;
        unit = 'Bags';
      } else if (lower.includes('tmt') || lower.includes('sariya') || lower.includes('ಸರಳು')) {
        itemName = 'Jindal Panther Fe-550D TMT';
        rate = 56800;
        qty = 5;
        unit = 'Tonnes';
      }
    }

    const total = qty * rate;
    const balanceDue = total - cashPaid;

    const draft: VoiceParsedTransaction = {
      partyName,
      transactionType: txType,
      tradeMode,
      itemName,
      lotOrGrade,
      quantity: qty,
      unit,
      rate,
      totalAmount: total,
      cashPaidOrReceived: cashPaid,
      balanceDue: Math.max(0, balanceDue),
      logisticsNote: lower.includes('transport') || lower.includes('truck') || lower.includes('ಲಾರಿ') ? 'National Logistics Express (KA-01-FA-4521)' : undefined,
      rawTranscript: text,
      confidence: 0.94,
    };

    setParsedDraft(draft);
  };

  const handleConfirmDraft = () => {
    if (parsedDraft) {
      onCommitVoiceTransaction(parsedDraft);
      setParsedDraft(null);
      setVoiceInputText('');
    }
  };

  // Multilingual WhatsApp Message Generator
  const generateWhatsAppMessage = (party: Party) => {
    const totalDue = party.currentBalance;
    const criticalAmount = party.aging.days30_plus;

    if (language === 'kn') {
      return `🙏 *ನಮಸ್ಕಾರ ${party.name} ರವರಿಗೆ*,\n\nಅಪೆಕ್ಸ್ ಟ್ರೇಡಿಂಗ್ & ಡಿಸ್ಟ್ರಿಬ್ಯೂಷನ್ ಕಡೆಯಿಂದ ಸಾದರ ನಮಸ್ಕಾರಗಳು.\nನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಒಟ್ಟು ಬಾಕಿ ಮೊತ್ತ *₹${totalDue.toLocaleString('en-IN')}* ಆಗಿದೆ.\n${criticalAmount > 0 ? `⚠️ ಇದರಲ್ಲಿ *₹${criticalAmount.toLocaleString('en-IN')}* ಮೊತ್ತವು 30 ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಅವಧಿ ಮೀರಿದೆ (Overdue).\n` : ''}\nದಯವಿಟ್ಟು ಶೀಘ್ರವಾಗಿ ಪಾವತಿ ಮಾಡಿ ಸಹಕರಿಸಿ:\n📲 *UPI ID*: payments@apextrading\n🔗 *Payment Link*: upi://pay?pa=payments@apextrading&pn=ApexTrading&am=${totalDue}&cu=INR\n\n_ವ್ಯಾಪಾರ ಸೇತು B2B ಸಗಟು ಕಾಕ್‌ಪಿಟ್ ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ_`;
    }

    if (language === 'en') {
      return `🙏 *Hello ${party.name}*,\n\nGreetings from Apex Trading & Distribution Co.\nYour current outstanding balance is *₹${totalDue.toLocaleString('en-IN')}*.\n${criticalAmount > 0 ? `⚠️ Of which *₹${criticalAmount.toLocaleString('en-IN')}* is overdue past 30 days.\n` : ''}\nKindly clear the pending balance at your earliest convenience:\n📲 *UPI ID*: payments@apextrading\n🔗 *Payment Link*: upi://pay?pa=payments@apextrading&pn=ApexTrading&am=${totalDue}&cu=INR\n\n_Generated via Vyapar Setu Wholesale Cockpit_`;
    }

    return `🙏 *नमस्ते ${party.name} जी*,\n\nएपेक्स ट्रेडिंग एंड डिस्ट्रीब्यूशन कंपनी की ओर से सादर नमस्कार।\nआपके खाते में आज की कुल बकाया राशि *₹${totalDue.toLocaleString('en-IN')}* है।\n${criticalAmount > 0 ? `⚠️ जिसमें से *₹${criticalAmount.toLocaleString('en-IN')}* की राशि 30 दिनों से अधिक समय से अति-देय (Overdue) है।\n` : ''}\nकृपया शीघ्र भुगतान कर सहयोग प्रदान करें:\n📲 *UPI ID*: payments@apextrading\n🔗 *Payment Link*: upi://pay?pa=payments@apextrading&pn=ApexTrading&am=${totalDue}&cu=INR\n\n_व्यापार सेतु B2B थोक कॉकपिट द्वारा प्रेषित_`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Dues & Morning Briefing Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Receivables */}
        <div className="surface-card p-4.5 space-y-1 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{activeT.totalReceivables}</span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-1">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">₹{totalReceivables.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[11px] text-slate-400/80 m-0">{activeT.totalReceivablesSub}</p>
        </div>

        {/* 30+ Days Critical Overdue */}
        <div className="bg-[#14121a] border border-red-900/30 rounded-xl p-4.5 space-y-1 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-400">{activeT.criticalOverdue}</span>
            <div className="p-1.5 rounded-md bg-red-500/10 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-1">
            <span className="text-2xl font-bold font-mono tracking-tight text-red-400">₹{bucket30PlusTotal.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[11px] text-red-400/70 m-0">{activeT.criticalOverdueSub}</p>
        </div>

        {/* Today's Payables Outflow */}
        <div className="surface-card p-4.5 space-y-1 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{activeT.todaysPayables}</span>
            <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-1">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">₹1,10,000</span>
          </div>
          <p className="text-[11px] text-slate-400/80 m-0">{activeT.todaysPayablesSub}</p>
        </div>

        {/* Dead Stock & Blocked Capital Alert */}
        <div className="surface-card p-4.5 space-y-1 relative group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{activeT.deadStockCapital}</span>
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400/90">
              <PackageX className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="pt-1">
            <span className="text-2xl font-bold font-mono tracking-tight text-amber-300">₹{totalDeadStockCapital.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[11px] text-slate-400/80 m-0">{activeT.deadStockCapitalSub}</p>
        </div>

      </div>

      {/* Main Grid: Udhari Radar & Multimodal Quick-Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Udhari Radar with WhatsApp Reminders */}
        <div className="lg:col-span-7 surface-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white m-0">{activeT.receivablesRadar}</h2>
                <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono font-medium">
                  ₹{totalReceivables.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activeT.receivablesRadarSub}</p>
            </div>

            {/* Aging Bucket Selector Chips */}
            <div className="inline-flex rounded-lg bg-[#090d14] p-0.5 border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedBucket('30_PLUS')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedBucket === '30_PLUS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeT.days30Plus} (₹{(bucket30PlusTotal / 1000).toFixed(0)}k)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBucket('15_30')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedBucket === '15_30' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeT.days15To30} (₹{(bucket15_30Total / 1000).toFixed(0)}k)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBucket('0_15')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedBucket === '0_15' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeT.days0To15} (₹{(bucket0_15Total / 1000).toFixed(0)}k)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBucket('ALL')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedBucket === 'ALL' ? 'bg-slate-800 text-slate-200 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeT.allBucket}
              </button>
            </div>
          </div>

          {/* Party List Cards */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredParties.map((party) => {
              const isCritical = party.aging.days30_plus > 0;
              return (
                <div
                  key={party.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCritical
                      ? 'bg-[#141018] border-rose-900/40 hover:border-rose-700/60'
                      : 'surface-subtle hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{party.name}</span>
                        {isCritical && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {activeT.criticalBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-2 m-0">
                        <span>{party.city}</span>
                        <span className="text-slate-600">•</span>
                        <span className="font-mono text-slate-400 text-[11px]">{party.phone}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-amber-400">
                        ₹{party.currentBalance.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[11px] text-slate-500 block font-mono">
                        {activeT.lastPayment} {party.lastPaymentDate}
                      </span>
                    </div>
                  </div>

                  {/* Aging Breakdown Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3.5 text-[11px]">
                      <span className="text-slate-400">
                        0-15d: <span className="font-mono text-slate-300">₹{party.aging.days0_15.toLocaleString('en-IN')}</span>
                      </span>
                      <span className="text-slate-400">
                        15-30d: <span className="font-mono text-amber-300">₹{party.aging.days15_30.toLocaleString('en-IN')}</span>
                      </span>
                      {party.aging.days30_plus > 0 && (
                        <span className="text-red-400 font-medium">
                          30d+: <span className="font-mono">₹{party.aging.days30_plus.toLocaleString('en-IN')}</span>
                        </span>
                      )}
                    </div>

                    {/* Action: Send WhatsApp Reminder */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReminderParty(party);
                        setCopiedReminder(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium text-xs tactile-btn"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{activeT.sendWhatsApp}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Vernacular Voice/Text Logger & Dead Stock */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Voice & Hinglish Quick-Log Box */}
          <div className="surface-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 m-0">{activeT.quickDictateTitle}</h3>
                  <p className="text-xs text-slate-400">{activeT.quickDictateSub}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
                {activeT.aiParserActive}
              </span>
            </div>

            {/* Quick-Prompt Sample Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">{activeT.quickSamplesLabel}</span>
              <div className="space-y-1.5">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleParseSpeech(prompt)}
                    className="w-full text-left text-xs surface-subtle hover:bg-slate-800/70 p-2.5 rounded-lg text-slate-300 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{prompt}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Record Button with Web Speech indicator */}
            <div className="relative space-y-2">
              <div className="relative">
                <textarea
                  aria-label="Voice input or text for transaction"
                  value={voiceInputText}
                  onChange={(e) => setVoiceInputText(e.target.value)}
                  placeholder={activeT.dictatePlaceholder}
                  className="w-full bg-[#090d14] border border-slate-800 rounded-lg p-3 pr-12 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 min-h-[75px]"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isRecording ? activeT.stopListening : activeT.startSpeaking}
                  className={`absolute right-2.5 top-2.5 p-2 rounded-lg transition-all ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30' 
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-400'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              {/* Live Waveform Indicator when recording */}
              {isRecording && (
                <div className="flex items-center gap-2 p-2 bg-rose-950/20 border border-rose-800/40 rounded-lg text-xs text-rose-300 animate-pulse">
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-5 bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-4 bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    <span className="w-1 h-6 bg-rose-400 animate-bounce" style={{ animationDelay: '450ms' }}></span>
                  </div>
                  <span className="font-medium">{activeT.listeningNotice}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => handleParseSpeech(voiceInputText || samplePrompts[0])}
                  disabled={!voiceInputText && isRecording}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg tactile-btn flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeT.parseAndDraft}</span>
                </button>
                <span className="text-[11px] text-slate-500 font-mono">{activeT.twoStepInvariant}</span>
              </div>
            </div>

            {/* Structured Draft Confirmation Card */}
            {parsedDraft && (
              <div className="mt-4 p-4 rounded-xl bg-[#090d14] border border-amber-500/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{activeT.verifyDraft}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {activeT.confidence} {(parsedDraft.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider">{activeT.party}</span>
                    <p className="font-semibold text-slate-100 truncate mt-0.5">{parsedDraft.partyName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider">{activeT.type}</span>
                    <p className="font-semibold text-emerald-400 mt-0.5">{parsedDraft.transactionType}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider">{activeT.itemLot}</span>
                    <p className="text-slate-200 mt-0.5">{parsedDraft.itemName} ({parsedDraft.lotOrGrade})</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider">{activeT.qtyRate}</span>
                    <p className="font-mono text-slate-200 mt-0.5">{parsedDraft.quantity} {parsedDraft.unit} @ ₹{parsedDraft.rate}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider">{activeT.cashPaid}</span>
                    <p className="font-mono font-semibold text-emerald-400 mt-0.5">₹{parsedDraft.cashPaidOrReceived.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-wider">{activeT.balanceDue}</span>
                    <p className="font-mono font-semibold text-amber-400 mt-0.5">₹{parsedDraft.balanceDue.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {parsedDraft.logisticsNote && (
                  <p className="text-[11px] text-sky-400 bg-sky-950/20 p-2 rounded-lg border border-sky-900/30">
                    🚚 {parsedDraft.logisticsNote}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={handleConfirmDraft}
                    className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg tactile-btn flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>{activeT.commitToKhata}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setParsedDraft(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
                  >
                    {activeT.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dead Stock & Blocked Inventory Card */}
          <div className="surface-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageX className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white m-0">{activeT.deadStockTitle}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">₹{totalDeadStockCapital.toLocaleString('en-IN')}</span>
            </div>
            
            <p className="text-xs text-slate-400">{activeT.deadStockSub}</p>

            <div className="space-y-2">
              {deadStockItems.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg surface-subtle flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">
                      {'fabricName' in item ? item.fabricName : item.name}
                    </span>
                    <span className="text-[11px] text-amber-400 font-mono">
                      {item.deadStockDays} {activeT.deadStockDays}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Broadcasted clearance offer at 10% discount!`)}
                    className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-medium transition-colors"
                  >
                    {activeT.broadcastDiscount}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* WhatsApp Reminder Preview Modal */}
      {activeReminderParty && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white m-0">{activeT.reminderPreview}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReminderParty(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{activeT.recipient} <strong className="text-white">{activeReminderParty.name}</strong></span>
                <span className="font-mono text-emerald-400">{activeReminderParty.phone}</span>
              </div>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {generateWhatsAppMessage(activeReminderParty)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generateWhatsAppMessage(activeReminderParty));
                  setCopiedReminder(true);
                  setTimeout(() => setCopiedReminder(false), 2000);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedReminder ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedReminder ? activeT.copied : activeT.copyMessage}</span>
              </button>
              
              <a
                href={`https://wa.me/${activeReminderParty.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(generateWhatsAppMessage(activeReminderParty))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
              >
                <Send className="w-4 h-4" />
                <span>{activeT.sendViaWhatsApp}</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
