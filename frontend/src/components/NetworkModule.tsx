import React, { useState } from 'react';
import { PeerMerchant, GroupBuyingPool, TradePassport, TradeMode } from '../types';
import { 
  Users, 
  ShoppingBag, 
  Award, 
  Search, 
  QrCode, 
  Clock, 
  ArrowRight, 
  Download, 
  Sparkles,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { Language } from '../types';
import { TRANSLATIONS, Translations } from '../i18n/translations';

interface NetworkModuleProps {
  tradeMode: TradeMode;
  peerMerchants: PeerMerchant[];
  groupPools: GroupBuyingPool[];
  tradePassport: TradePassport;
  onJoinPool: (poolId: string, quantity: number) => void;
  language?: Language;
  t?: Translations;
}

export const NetworkModule: React.FC<NetworkModuleProps> = ({
  tradeMode: _tradeMode,
  peerMerchants,
  groupPools,
  tradePassport,
  onJoinPool,
  language = 'en',
  t,
}) => {
  const activeT = t || TRANSLATIONS[language];

  // Sub-tabs: 'PEER_SHARING' | 'GROUP_BUYING' | 'TRADE_PASSPORT'
  const [activeTab, setActiveTab] = useState<'PEER_SHARING' | 'GROUP_BUYING' | 'TRADE_PASSPORT'>('GROUP_BUYING');

  // Pledge modal state
  const [pledgingPool, setPledgingPool] = useState<GroupBuyingPool | null>(null);
  const [pledgeQuantity, setPledgeQuantity] = useState<number>(500);

  // Peer search query
  const [peerSearchQuery, setPeerSearchQuery] = useState('');

  const filteredPeers = peerMerchants.filter(p => 
    p.businessName.toLowerCase().includes(peerSearchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(peerSearchQuery.toLowerCase()) ||
    p.mandiArea.toLowerCase().includes(peerSearchQuery.toLowerCase())
  );

  const handleConfirmPledge = () => {
    if (pledgingPool) {
      onJoinPool(pledgingPool.id, pledgeQuantity);
      setPledgingPool(null);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      alert(language === 'en'
        ? `Successfully pledged ${pledgeQuantity} ${pledgingPool.unit}! When pool reaches 100%, you will receive ₹${(pledgingPool.currentTierPrice - pledgingPool.nextTierPrice) * pledgeQuantity} in tier discount savings.`
        : language === 'kn'
        ? `${pledgeQuantity} ${pledgingPool.unit} ಪ್ರಮಾಣದ ಮುಂಗಡ ಆದೇಶ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!`
        : `सफलतापूर्वक ${pledgeQuantity} ${pledgingPool.unit} का कमिटमेंट दर्ज किया गया! जब 10,000 की लिमिट पूरी होगी, आपको ₹${(pledgingPool.currentTierPrice - pledgingPool.nextTierPrice) * pledgeQuantity} की अतिरिक्त छूट मिलेगी।`
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-Navigation Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('GROUP_BUYING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'GROUP_BUYING'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{activeT.groupBuyingTab}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('PEER_SHARING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'PEER_SHARING'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{activeT.peerSourcingTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TRADE_PASSPORT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TRADE_PASSPORT'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{activeT.tradePassportTab}</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          {language === 'en' ? 'Pan-India B2B Wholesale Trading Syndicate Active' : language === 'kn' ? 'ಅಖಿಲ ಭಾರತ ಬಿ2ಬಿ ಸಗಟು ಸಿಂಡಿಕೇಟ್ ಸಕ್ರಿಯವಾಗಿದೆ' : 'अखिल भारतीय B2B थोक सिंडिकेट नेटवर्क एक्टिव'}
        </div>
      </div>

      {/* Tab 1: Group Buying */}
      {activeTab === 'GROUP_BUYING' && (
        <div className="space-y-6">
          <div className="surface-card p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-semibold text-white m-0">{activeT.samoohikKharid}</h3>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {activeT.samoohikKharidSub}
                </p>
              </div>

              <div className="flex items-center gap-3 surface-subtle px-4 py-2.5 rounded-xl">
                <Percent className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[11px] text-slate-400 block">{language === 'en' ? 'Average Wholesale Savings:' : language === 'kn' ? 'ಸರಾಸರಿ ಉಳಿತಾಯ:' : 'औसत मंडी बचत:'}</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">₹12 - ₹25 {language === 'en' ? 'per Bag / Meter' : language === 'kn' ? 'ಪ್ರತಿ ಚೀಲ / ಮೀಟರ್' : 'प्रति बोरी / मीटर'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Group Buying Pool Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupPools.map((pool) => {
              const progressPercent = Math.min(100, (pool.pledgedVolume / pool.targetVolume) * 100);
              const remainingUnits = pool.targetVolume - pool.pledgedVolume;
              const savingsPerUnit = pool.currentTierPrice - pool.nextTierPrice;

              return (
                <div key={pool.id} className="surface-card p-5 space-y-4 relative overflow-hidden">
                  
                  {/* Pool Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                        {pool.manufacturer}
                      </span>
                      <h4 className="text-base font-semibold text-white mt-1.5">{pool.title}</h4>
                      <p className="text-xs text-slate-400">{pool.commodityName}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-amber-400 surface-subtle px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pool.daysRemaining} {language === 'en' ? 'days left' : language === 'kn' ? 'ದಿನಗಳು ಬಾಕಿ' : 'दिन शेष'}</span>
                    </div>
                  </div>

                  {/* Volume Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        {language === 'en' ? 'Pledged Volume:' : language === 'kn' ? 'ಬದ್ಧತೆಯ ಪ್ರಮಾಣ:' : 'प्रतिबद्ध मात्रा:'} <strong className="text-white font-mono font-medium">{pool.pledgedVolume.toLocaleString('en-IN')}</strong> / {pool.targetVolume.toLocaleString('en-IN')} {pool.unit}
                      </span>
                      <span className="font-mono font-bold text-amber-400">{progressPercent.toFixed(1)}%</span>
                    </div>
                    
                    <div className="h-2 w-full bg-[#090d14] rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>

                    <p className="text-[11px] text-emerald-400 flex items-center justify-between pt-0.5">
                      <span>🎯 {language === 'en' ? `${remainingUnits.toLocaleString('en-IN')} ${pool.unit} needed to unlock next tier` : language === 'kn' ? `ಮುಂದಿನ ಹಂತ ಅನ್‌ಲಾಕ್ ಮಾಡಲು ${remainingUnits.toLocaleString('en-IN')} ${pool.unit} ಬಾಕಿ` : `अगला टियर अनलॉक करने हेतु ${remainingUnits.toLocaleString('en-IN')} ${pool.unit} शेष`}</span>
                      <span className="font-semibold">{language === 'en' ? 'Savings:' : language === 'kn' ? 'ಉಳಿತಾಯ:' : 'ಬಚತ್:'} ₹{savingsPerUnit}/{pool.unit}</span>
                    </p>
                  </div>

                  {/* Pricing Tiers Comparison */}
                  <div className="grid grid-cols-2 gap-3 text-xs surface-subtle p-3 rounded-xl">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase tracking-wider block">{language === 'en' ? 'Current Pool Price:' : language === 'kn' ? 'ಪ್ರಸ್ತುತ ಪೂಲ್ ದರ:' : 'वर्तमान पूल दर:'}</span>
                      <span className="text-sm font-semibold font-mono text-slate-200 mt-0.5 block">₹{pool.currentTierPrice}/{pool.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase tracking-wider block">{language === 'en' ? 'Target Price (at 100%):' : language === 'kn' ? 'ಗುರಿ ದರ (100% ನಲ್ಲಿ):' : 'टारगेट टियर दर (100% पर):'}</span>
                      <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">₹{pool.nextTierPrice}/{pool.unit}</span>
                    </div>
                  </div>

                  {/* Pool Join Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-xs text-slate-400">
                      {pool.participantsCount} {language === 'en' ? 'merchants pledged' : language === 'kn' ? 'ವ್ಯಾಪಾರಿಗಳು ಸೇರಿದ್ದಾರೆ' : 'स्थानीय व्यापारी शामिल'}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setPledgingPool(pool);
                        setPledgeQuantity(500);
                      }}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tactile-btn flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <span>{activeT.joinPoolBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Peer Sourcing */}
      {activeTab === 'PEER_SHARING' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white m-0">{activeT.peerDirectory}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeT.peerDirectorySub}</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search peer merchant, hub or city...' : language === 'kn' ? 'ವ್ಯಾಪಾರಿ ಅಥವಾ ನಗರ ಹುಡುಕಿ...' : 'पार्टनर या मंडी खोजें...'}
                value={peerSearchQuery}
                onChange={(e) => setPeerSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
              />
            </div>
          </div>

          {/* Peer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredPeers.map((peer) => (
              <div key={peer.id} className="surface-card p-4 space-y-3 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-snug">{peer.businessName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{peer.ownerName} • {peer.city}</p>
                    <span className="text-[11px] text-slate-500 font-mono">{peer.mandiArea}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {peer.reputationScore}/100
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-[11px] text-slate-400 block">{activeT.availableStock}</span>
                  <div className="space-y-1">
                    {peer.availableStockPreview.map((item, i) => (
                      <span key={i} className="inline-block bg-[#090d14] border border-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300 mr-1 mb-1">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <span className="text-[11px] text-emerald-400 font-medium">● {language === 'en' ? 'Verified Online' : language === 'kn' ? 'ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾರೆ' : 'ऑनलाइन तैयार'}</span>
                  <button
                    type="button"
                    onClick={() => alert(language === 'en' ? `Stock allocation inquiry sent to ${peer.businessName}!` : language === 'kn' ? `${peer.businessName} ಅವರಿಗೆ ವಿಚಾರಣೆ ಕಳುಹಿಸಲಾಗಿದೆ!` : `${peer.businessName} को स्टॉक ट्रांसफर का अनुरोध भेज दिया गया है!`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs tactile-btn transition-colors"
                  >
                    {language === 'en' ? 'Request Sourcing' : language === 'kn' ? 'ಸರಕು ವರ್ಗಾವಣೆ ವಿನಂತಿ' : 'स्टॉक ट्रांसफर मांगें'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Trade Reputation Passport */}
      {activeTab === 'TRADE_PASSPORT' && (
        <div className="max-w-3xl mx-auto surface-card border-amber-500/30 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          
          {/* Passport Watermark & Emblem */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
                {language === 'en' ? 'Vyapar Setu • Official B2B Trade Credibility Passport' : language === 'kn' ? 'ವ್ಯಾಪಾರ ಸೇತು • ಅಧಿಕೃತ ವ್ಯಾಪಾರ ವಿಶ್ವಾಸಾರ್ಹತೆ ಪಾಸ್‌ಪೋರ್ಟ್' : 'व्यापार सेतु • आधिकारिक व्यापार साख पासपोर्ट'}
              </span>
              <h3 className="text-xl font-bold text-white m-0">{tradePassport.merchantName}</h3>
              <p className="text-xs text-slate-400">
                GSTIN: <span className="font-mono text-slate-300">{tradePassport.gstin}</span> • {language === 'en' ? 'Est.' : language === 'kn' ? 'ಸ್ಥಾಪನೆ:' : 'स्थापना:'} {tradePassport.establishedYear}
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div className="inline-block p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-3xl font-black font-mono text-amber-400 block leading-none">
                  {tradePassport.overallScore}
                </span>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  {language === 'en' ? `Tier ${tradePassport.tierGrade} (Verified Trust)` : language === 'kn' ? `ಶ್ರೇಣಿ ${tradePassport.tierGrade} (ಪರಿಶೀಲಿತ)` : `श्रेणी ${tradePassport.tierGrade} (विश्वसनीय)`}
                </span>
              </div>
            </div>
          </div>

          {/* 5-Dimensional Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            
            <div className="p-3.5 rounded-xl surface-subtle space-y-1">
              <span className="text-slate-500 text-[11px] uppercase tracking-wider">{language === 'en' ? 'On-Time Settlement Ratio:' : language === 'kn' ? 'ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಪಾವತಿ:' : 'समय पर भुगतान अनुपात:'}</span>
              <p className="text-lg font-bold font-mono text-emerald-400">
                {tradePassport.metrics.onTimeSettlementRatio}%
              </p>
              <span className="text-[10px] text-slate-500">{language === 'en' ? 'Zero Default Track' : language === 'kn' ? 'ಯಾವುದೇ ಡೀಫಾಲ್ಟ್ ಇಲ್ಲ' : 'शून्य डिफ़ॉल्ट रिकॉर्ड'}</span>
            </div>

            <div className="p-3.5 rounded-xl surface-subtle space-y-1">
              <span className="text-slate-500 text-[11px] uppercase tracking-wider">{language === 'en' ? 'Trade Dispute Rate:' : language === 'kn' ? 'ವಿವಾದ ದರ:' : 'विवाद दर (Dispute Rate):'}</span>
              <p className="text-lg font-bold font-mono text-emerald-400">
                {tradePassport.metrics.disputeRate}%
              </p>
              <span className="text-[10px] text-slate-500">{language === 'en' ? '100% Amicable Resolution' : language === 'kn' ? '100% ಸೌಹಾರ್ದಯುತ ಇತ್ಯರ್ಥ' : '100% सुगम सुलझाव'}</span>
            </div>

            <div className="p-3.5 rounded-xl surface-subtle space-y-1">
              <span className="text-slate-500 text-[11px] uppercase tracking-wider">{language === 'en' ? 'Verified Trade Volume:' : language === 'kn' ? 'ಪರಿಶೀಲಿತ ವ್ಯಾಪಾರ ವಹಿವಾಟು:' : 'सत्यापित सौदा वॉल्यूम:'}</span>
              <p className="text-lg font-bold font-mono text-amber-400">
                ₹{tradePassport.metrics.completedDealsVolumeCr} Cr
              </p>
              <span className="text-[10px] text-slate-500">{language === 'en' ? 'Trailing 12 Months' : language === 'kn' ? 'ಕಳೆದ 12 ತಿಂಗಳು' : 'पिछले 12 माह'}</span>
            </div>

            <div className="p-3.5 rounded-xl surface-subtle space-y-1">
              <span className="text-slate-500 text-[11px] uppercase tracking-wider">{language === 'en' ? 'Wholesale Standing:' : language === 'kn' ? 'ವ್ಯಾಪಾರ ಅನುಭವ:' : 'मंडी साख अनुभव:'}</span>
              <p className="text-lg font-bold font-mono text-white">
                {tradePassport.metrics.yearsInCircle} {language === 'en' ? 'Years' : language === 'kn' ? 'ವರ್ಷಗಳು' : 'वर्ष'}
              </p>
              <span className="text-[10px] text-slate-500">{language === 'en' ? 'Apex Wholesale Federation' : language === 'kn' ? 'ಸಗಟು ವ್ಯಾಪಾರ ಒಕ್ಕೂಟ' : 'कपड़ा व निर्माण महासंघ'}</span>
            </div>

            <div className="p-3.5 rounded-xl surface-subtle space-y-1">
              <span className="text-slate-500 text-[11px] uppercase tracking-wider">{language === 'en' ? 'Default Events:' : language === 'kn' ? 'ಡೀಫಾಲ್ಟ್ ಘಟನೆಗಳು:' : 'डिफ़ॉल्ट घटनाएं:'}</span>
              <p className="text-lg font-bold font-mono text-emerald-400">
                0
              </p>
              <span className="text-[10px] text-slate-500">{language === 'en' ? 'Flawless History' : language === 'kn' ? 'ಪರಿಶುದ್ಧ ಇತಿಹಾಸ' : 'क्लीन ट्रैक रिकॉर्ड'}</span>
            </div>

            <div className="p-3.5 rounded-xl surface-subtle space-y-1">
              <span className="text-slate-500 text-[11px] uppercase tracking-wider">{language === 'en' ? 'Last Verified Audit:' : language === 'kn' ? 'ಕೊನೆಯ ಲೆಕ್ಕ ಪರಿಶೋಧನೆ:' : 'अंतिम स्वतंत्र ऑडिट:'}</span>
              <p className="text-sm font-bold font-mono text-slate-300">
                {tradePassport.lastAuditedDate}
              </p>
              <span className="text-[10px] text-emerald-400">{language === 'en' ? 'Verified Credential' : language === 'kn' ? 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'सत्यापित मुहर'}</span>
            </div>

          </div>

          {/* Cryptographic Hash & QR Verification */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white text-slate-950">
                <QrCode className="w-12 h-12" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">{language === 'en' ? 'Scan & Verify QR Code' : language === 'kn' ? 'ಪರಿಶೀಲನಾ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : 'स्कैन सत्यापन QR कोड'}</span>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  {language === 'en' ? 'Shareable credential for commercial banks, NBFCs, and premier mills for enhanced credit limits.' : language === 'kn' ? 'ಬ್ಯಾಂಕುಗಳು ಮತ್ತು ಕಾರ್ಖಾನೆಗಳಿಗೆ ಸಾಲ ಮಿತಿ ಪಡೆಯಲು ಈ ಪಾಸ್‌ಪೋರ್ಟ್ ಬಳಸಬಹುದು.' : 'यह पासपोर्ट बैंक, NBFC या नई टेक्सटाइल मिलों को बेहतर साख व ब्याज दरों हेतु प्रस्तुत किया जा सकता है।'}
                </p>
                <code className="text-[10px] text-slate-500 block truncate max-w-xs font-mono">
                  {tradePassport.verificationHash}
                </code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert(language === 'en' ? 'Official B2B Trade Credibility Dossier (PDF) generated and downloaded!' : language === 'kn' ? 'ಅಧಿಕೃತ ವ್ಯಾಪಾರ ಸಾಲ ಪತ್ರ (PDF) ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ!' : 'बैंक व मिल हेतु आधिकारिक साख पत्र (PDF Dossier) डाउनलोड हो गया!')}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'en' ? 'Download Passport (PDF)' : language === 'kn' ? 'ಪಾಸ್‌ಪೋರ್ಟ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (PDF)' : 'साख पत्र डाउनलोड करें (PDF)'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Modal: Commit Order into Group Buying Pool */}
      {pledgingPool && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white m-0">{language === 'en' ? 'Pledge Order Volume' : language === 'kn' ? 'ಆದೇಶದ ಪ್ರಮಾಣವನ್ನು ದಾಖಲಿಸಿ' : 'सामूहिक खरीद कमिटमेंट'}</h3>
              <button
                type="button"
                onClick={() => setPledgingPool(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                {language === 'en' ? 'Add your firm volume to' : language === 'kn' ? 'ನಿಮ್ಮ ಸಂಸ್ಥೆಯ ಆದೇಶವನ್ನು ಸೇರಿಸಿ:' : 'अपनी फर्म का ऑर्डर जोड़ें:'} <strong>{pledgingPool.title}</strong>:
              </p>

              <div>
                <label className="text-slate-400 block mb-1">
                  {language === 'en' ? `Enter Quantity (${pledgingPool.unit}):` : language === 'kn' ? `ಪ್ರಮಾಣವನ್ನು ನಮೂದಿಸಿ (${pledgingPool.unit}):` : `मात्रा दर्ज करें (${pledgingPool.unit}):`}
                </label>
                <input
                  type="number"
                  value={pledgeQuantity}
                  onChange={(e) => setPledgeQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'en' ? 'Current Tier Price:' : language === 'kn' ? 'ಪ್ರಸ್ತುತ ದರ:' : 'अनुमानित दर:'}</span>
                  <span className="font-mono text-white">₹{pledgingPool.currentTierPrice}/{pledgingPool.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'en' ? 'Unlocked Target Price:' : language === 'kn' ? 'ಅನ್‌ಲಾಕ್ ಆದಾಗ ದರ:' : 'टारगेट अनलॉक पर दर:'}</span>
                  <span className="font-mono text-emerald-400 font-bold">₹{pledgingPool.nextTierPrice}/{pledgingPool.unit}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">{language === 'en' ? 'Estimated Total Savings:' : language === 'kn' ? 'ಒಟ್ಟು ಉಳಿತಾಯ:' : 'कुल संभावित बचत:'}</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ₹{((pledgingPool.currentTierPrice - pledgingPool.nextTierPrice) * pledgeQuantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                {language === 'en' ? '* Note: Invoicing is generated directly from the manufacturer to your business name with doorstep delivery.' : language === 'kn' ? '* ಗಮನಿಸಿ: ಸರಬರಾಜು ನೇರವಾಗಿ ಉತ್ಪಾದಕರಿಂದ ನಿಮ್ಮ ಗೋದಾಮಿಗೆ ಆಗುತ್ತದೆ.' : '* नोट: बिलिंग सीधे मिल से आपकी फर्म के नाम होगी और माल आपके चुने हुए गोदाम पर उतरेगा।'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPledgingPool(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                {activeT.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmPledge}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tactile-btn"
              >
                {language === 'en' ? 'Confirm Volume Pledge' : language === 'kn' ? 'ಆದೇಶ ಖಚಿತಪಡಿಸಿ' : 'कमिटमेंट पक्का करें'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
