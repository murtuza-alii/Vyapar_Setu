import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Language, TradeMode } from '../types';
import { Translations } from '../i18n/translations';
import { 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  Truck, 
  ShieldCheck, 
  TrendingUp, 
  Scale, 
  Users,
  Compass
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface EditorialHeroAndBentoProps {
  tradeMode: TradeMode;
  language: Language;
  t: Translations;
  onExploreCockpit: () => void;
  onOpenControlTower: () => void;
}

export const EditorialHeroAndBento: React.FC<EditorialHeroAndBentoProps> = ({
  tradeMode,
  language,
  t,
  onExploreCockpit,
  onOpenControlTower,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const bentoGridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Entrance timeline for Hero: wide headline stagger and smooth reveals
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (headlineRef.current) {
        tl.from(headlineRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
        });
      }

      if (subtextRef.current) {
        tl.from(
          subtextRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
          },
          '-=0.5'
        );
      }

      if (ctaGroupRef.current) {
        tl.from(
          ctaGroupRef.current.children,
          {
            scale: 0.95,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.4'
        );
      }

      // 2. Bento cards scroll trigger entrance
      if (bentoGridRef.current) {
        const cards = bentoGridRef.current.querySelectorAll('.bento-cell');
        gsap.from(cards, {
          scrollTrigger: {
            trigger: bentoGridRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          y: 35,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
        });
      }

      // 3. Infinite marquee subtle translation
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          xPercent: -50,
          ease: 'none',
          duration: 28,
          repeat: -1,
        });
      }
    },
    { scope: containerRef, dependencies: [tradeMode, language] }
  );

  const heroKeywords = [
    language === 'en' ? 'Wholesale Liquidity Engine' : language === 'kn' ? 'ಸಗಟು ವ್ಯಾಪಾರ ಎಂಜಿನ್' : 'थोक नकदी व व्यापार इंजन',
    language === 'en' ? 'Mandi Logistics Radar' : language === 'kn' ? 'ಮಂಡಿ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ರಾಡಾರ್' : 'मंडी लॉजिस्टिक्स रडार',
    language === 'en' ? 'Zero-Default Credit Khata' : language === 'kn' ? 'ಡೀಫಾಲ್ಟ್-ಮುಕ್ತ ಕ್ರೆಡಿಟ್ ಖಾತೆ' : 'शून्य-डिफ़ॉल्ट साख बहीखाता',
    language === 'en' ? 'Syndicate Buying Power' : language === 'kn' ? 'ಸಮೂಹ ಖರೀದಿ ಶಕ್ತಿ' : 'सामूहिक खरीद शक्ति',
    language === 'en' ? 'Weighbridge & Thaan Certified' : language === 'kn' ? 'ತೂಕ ಮತ್ತು ರೋಲ್ ಪ್ರಮಾಣೀಕೃತ' : 'धर्मकांटा व थान प्रमाणित',
  ];

  return (
    <div ref={containerRef} className="space-y-16 lg:space-y-24 mb-10">
      
      {/* =========================================================================
          ATTENTION: CINEMATIC ULTRA-WIDE HERO (2-Line Iron Rule, Max-W-6xl)
          ========================================================================= */}
      <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-20 text-center overflow-hidden">
        {/* Ambient radial lighting glow */}
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[450px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" 
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          
          {/* Main H1 - Strictly Flows in 2 Lines on Desktop */}
          <h1 
            ref={headlineRef}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]"
          >
            <span className="block">
              {language === 'en' 
                ? 'The Wholesale Operating System'
                : language === 'kn'
                ? 'ಸಮಗ್ರ ಸಗಟು ವ್ಯಾಪಾರ ವ್ಯವಸ್ಥೆ'
                : 'भारत के थोक व्यापारियों का संपूर्ण'}
            </span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              {language === 'en' 
                ? 'For Real-World Indian Commerce.' 
                : language === 'kn'
                ? 'ವಿಶ್ವಾಸಾರ್ಹ ಡಿಜಿಟಲ್ ಕಂಟ್ರೋಲ್ ಟವರ್.' 
                : 'डिजिटल कंट्रोल टॉवर व मुनीम.'}
            </span>
          </h1>

          {/* Editorial Subtitle */}
          <p 
            ref={subtextRef}
            className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed"
          >
            {language === 'en'
              ? 'One unified command centre for daily khata, contract deal towers, live mandi dispatch tracking, and syndicate group purchasing across Indian trade corridors.'
              : language === 'kn'
              ? 'ದೈನಂದಿನ ಖಾತೆ, ಒಪ್ಪಂದದ ಸೌದಾ ಟವರ್, ಲೈವ್ ಮಂಡಿ ಸಾಗಣೆ ಮತ್ತು ಸಮೂಹ ಖರೀದಿಯನ್ನು ಒಂದೇ ಪರದೆಯಲ್ಲಿ ನಿರ್ವಹಿಸಿ.'
              : 'दैनिक बहीखाता, सौदा कंट्रोल टॉवर, धर्मकांटा बिल्टी ट्रैकिंग और सामूहिक मंडी खरीद—सब एक स्क्रीन पर निर्बाध.'}
          </p>

          {/* High-Contrast Action CTAs */}
          <div 
            ref={ctaGroupRef}
            className="pt-3 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4"
          >
            <button
              type="button"
              onClick={onExploreCockpit}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tactile-btn shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>{t.tabCockpit}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              type="button"
              onClick={onOpenControlTower}
              className="px-6 py-3 rounded-xl surface-card hover:bg-slate-800/80 text-white font-semibold text-sm tactile-btn border border-slate-700/80 flex items-center gap-2 transition-all"
            >
              <Truck className="w-4 h-4 text-sky-400" />
              <span>{t.tabControlTower}</span>
            </button>
          </div>

        </div>

        {/* Ambient Partner / Mandi Ticker Marquee */}
        <div className="mt-14 w-full overflow-hidden border-y border-slate-800/80 py-3 bg-[#0d121d]/50 backdrop-blur-md">
          <div 
            ref={marqueeRef}
            className="flex items-center space-x-8 whitespace-nowrap will-change-transform text-xs font-mono text-slate-400 uppercase tracking-wider"
          >
            {[...heroKeywords, ...heroKeywords, ...heroKeywords, ...heroKeywords].map((kw, idx) => (
              <span key={idx} className="flex items-center space-x-3">
                <span className="text-amber-400 font-bold">◆</span>
                <span className="text-slate-200">{kw}</span>
              </span>
            ))}
          </div>
        </div>

      </section>

      {/* =========================================================================
          INTEREST: GAPLESS DENSE BENTO GRID (grid-flow-dense, zero empty cells)
          ========================================================================= */}
      <section className="space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-400">
              {language === 'en' ? 'Architecture' : language === 'kn' ? 'ವಾಸ್ತುಶಿಲ್ಪ' : 'सिस्टम आर्किटेक्चर'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 m-0">
              {language === 'en' ? 'Built for Ground Realities' : language === 'kn' ? 'ಮಂಡಿಯ ನೈಜ ಅಗತ್ಯತೆಗಳಿಗಾಗಿ' : 'मंडी की वास्तविक जरूरतों के अनुकूल'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            {language === 'en' 
              ? 'Engineered to handle volatile weights, transporter shortages, dalali brokerage deductions, and shared credit.' 
              : language === 'kn'
              ? 'ದಿನಂಪ್ರತಿ ಸಾರಿಗೆ, ತೂಕದ ವ್ಯತ್ಯಾಸಗಳು ಮತ್ತು ಸಾಲ ನಿರ್ವಹಣೆಗೆ ನಿಖರ ವ್ಯವಸ್ಥೆ.'
              : 'वजन अंतर, ट्रांसपोटर बिल्टी, दलाली कटौती और उधार समाधान हेतु प्रमाणित ढांचा.'}
          </p>
        </div>

        {/* Dense 12-Column Gapless Bento Grid */}
        <div 
          ref={bentoGridRef}
          className="grid grid-cols-1 md:grid-cols-12 gap-5 grid-flow-dense"
        >
          
          {/* Card 1: Live Cockpit & Voice Log (Col-span 7) */}
          <div className="bento-cell md:col-span-7 surface-card p-6 flex flex-col justify-between space-y-4 group overflow-hidden relative">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  NLP Voice Parser
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {language === 'en' ? 'Natural Trade Voice Entry' : language === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ವಹಿವಾಟು ದಾಖಲು' : 'स्थानीय भाषा बोलकर सौदा प्रविष्टि'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                {language === 'en'
                  ? 'Speak rapid mandi terms in Hindi, Kannada, or English. The engine parses party names, lot codes, advance tokens, and pending credit into verified 2-step drafts.'
                  : language === 'kn'
                  ? 'ಕನ್ನಡ, ಹಿಂದಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಧ್ವನಿ ನೀಡಿ. ಸೌದಾ ಮತ್ತು ಮುಂಗಡ ಮೊತ್ತವನ್ನು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ವಿಶ್ಲೇಷಿಸಿ ಖಾತೆಗೆ ದಾಖಲಿಸಿ.'
                  : 'व्यापारी बोलकर सौदा दर्ज करें। सिस्टम अपने आप पार्टी का नाम, लॉट संख्या और टोकन अग्रिम पहचान कर कच्चा मसौदा तैयार करता है।'}
              </p>
            </div>

            <div className="surface-subtle p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
              <span className="text-slate-400">Sharma Cloth ko 50m Chanderi Silk diya, ₹5,000 mila...</span>
              <span className="text-amber-400 font-bold shrink-0">94% Confidence</span>
            </div>
          </div>

          {/* Card 2: Control Tower Logistics & Margins (Col-span 5) */}
          <div className="bento-cell md:col-span-5 surface-card p-6 flex flex-col justify-between space-y-4 group overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Truck className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                  Live Dispatch Track
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {language === 'en' ? 'True Margin Control Tower' : language === 'kn' ? 'ನೈಜ ಲಾಭ ಕಂಟ್ರೋಲ್ ಟವರ್' : 'सच्चा शुद्ध मुनाफा कैलकुलेटर'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'Calculates real net cash margin after deductibles: Hamali loading, freight bilty, cash discount (CD), and mandi dalali brokerage.'
                  : language === 'kn'
                  ? 'ಹಮಾಲಿ, ಬಾಡಿಗೆ ಮತ್ತು ನಗದು ರಿಯಾಯಿತಿ ಕಡಿತದ ನಂತರ ನಿವ್ವಳ ಲಾಭದ ನಿಖರ ಲೆಕ್ಕಾಚಾರ.'
                  : 'हमाली, भाड़ा, नकद छूट और दलाली काटने के बाद असली शुद्ध मुनाफे का सटीक विश्लेषण।'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
              <span className="text-slate-400">Net Margin Band</span>
              <span className="text-emerald-400 font-bold text-sm">~12.76% (Healthy)</span>
            </div>
          </div>

          {/* Card 3: Mandi Weighbridge & Thaan Certification (Col-span 4) */}
          <div className="bento-cell md:col-span-4 surface-card p-6 flex flex-col justify-between space-y-4 group overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Scale className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono text-emerald-400">Certified Slip</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {tradeMode === 'TEXTILE' 
                  ? (language === 'en' ? 'Thaan Piece Tracking' : language === 'kn' ? 'ಥಾನ್ ತುಂಡುಗಳ ಟ್ರ್ಯಾಕಿಂಗ್' : 'थान व कट पीस ट्रैकिंग')
                  : (language === 'en' ? 'Weighbridge Gross/Tare' : language === 'kn' ? 'ಧರ್ಮಕಾಂಟಾ ತೂಕ ದಾಖಲೆ' : 'धर्मकांटा सकल व खाली वजन')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {tradeMode === 'TEXTILE'
                  ? 'Serialised rolls by lot, meters, and width to eradicate shortage disputes with cloth processors.'
                  : 'Tare weight automatic subtraction (34,250 kg - 12,450 kg = 21,800 kg net MT & 436 bags).'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              Slip #WB-7782 • Zero Discrepancy
            </div>
          </div>

          {/* Card 4: Collaborative Group Purchasing Syndicate (Col-span 4) */}
          <div className="bento-cell md:col-span-4 surface-card p-6 flex flex-col justify-between space-y-4 group overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Users className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono text-indigo-400">Tier Discounts</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {language === 'en' ? 'Group Buying Syndicate' : language === 'kn' ? 'ಸಮೂಹ ಖರೀದಿ ಸಿಂಡಿಕೇಟ್' : 'सामूहिक खरीद पूल'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'Combine procurement volumes with neighbouring merchants to unlock manufacturer factory-gate pricing.'
                  : language === 'kn'
                  ? 'ನೆರೆಯ ವ್ಯಾಪಾರಿಗಳೊಂದಿಗೆ ಆದೇಶಗಳನ್ನು ಒಗ್ಗೂಡಿಸಿ ಕಾರ್ಖಾನೆ ದರದಲ್ಲಿ ಸರಕು ಪಡೆಯಿರಿ.'
                  : 'आस-पास के व्यापारियों के साथ मिलकर बड़ा ऑर्डर दें और डायरेक्ट फैक्ट्री डिस्काउंट पाएं।'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs font-mono text-emerald-400 flex items-center justify-between">
              <span>Savings Unlocked</span>
              <span className="font-bold">₹18/bag (₹10,800 Saved)</span>
            </div>
          </div>

          {/* Card 5: Trade Credibility Passport (Col-span 4) */}
          <div className="bento-cell md:col-span-4 surface-card p-6 flex flex-col justify-between space-y-4 group overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono text-amber-400">Trust Tier A+</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {language === 'en' ? 'Trade Passport' : language === 'kn' ? 'ವ್ಯಾಪಾರ ವಿಶ್ವಾಸಾರ್ಹತೆ ಪಾಸ್‌ಪೋರ್ಟ್' : 'व्यापार साख पासपोर्ट'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'en'
                  ? 'Cryptographically verified on-time settlement history, enabling uncollateralised mandi credit lines.'
                  : language === 'kn'
                  ? 'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಪಾವತಿಸಿದ ದಾಖಲೆಗಳೊಂದಿಗೆ ಮಂಡಿಯಲ್ಲಿ ವಿಶ್ವಾಸಾರ್ಹ ಸಾಲ ಸೌಲಭ್ಯ ಪಡೆಯಿರಿ.'
                  : 'समय पर भुगतान के प्रमाणित रिकॉर्ड से बिना बंधक के मंडी में तुरंत साख सीमा प्राप्त करें।'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
              <span>Trust Rating</span>
              <span className="text-amber-400 font-bold">96/100 (Flawless)</span>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};
