import React from 'react';
import { TradeMode, UserRole, Language } from '../types';
import { Translations } from '../i18n/translations';
import { Wallet, RefreshCw, Layers, HardHat, UserCheck, RotateCcw, Languages } from 'lucide-react';

interface HeaderProps {
  tradeMode: TradeMode;
  setTradeMode: (mode: TradeMode) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  cashInHand: number;
  bankBalance: number;
  onResetDemoData: () => void;
  t: Translations;
}

export const Header: React.FC<HeaderProps> = ({
  tradeMode,
  setTradeMode,
  userRole,
  setUserRole,
  language,
  setLanguage,
  cashInHand,
  bankBalance,
  onResetDemoData,
  t,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Market Location */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-900/30">
              {language === 'kn' ? 'ವ್ಯಾ' : language === 'hi' ? 'व्या' : 'VS'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white m-0">
                  {t.brandTitle}{' '}
                  <span className="text-xs text-amber-400 font-mono font-medium tracking-normal border border-amber-500/30 px-2 py-0.5 rounded-full bg-amber-500/10">
                    {t.brandSubtitle}
                  </span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  {t.mandiLive}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{t.firmName}</span>
                <span className="text-slate-600">•</span>
                <span>{t.firmLocation}</span>
              </p>
            </div>
          </div>

          {/* Controls: Language Toggle, Trade Mode, Role & Galla */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* 3-Way Language Toggle (English [Main], हिन्दी, ಕನ್ನಡ) */}
            <div className="inline-flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800">
              <span className="pl-1.5 pr-1 text-slate-400">
                <Languages className="w-3.5 h-3.5 text-amber-400" />
              </span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to English (Main)"
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  language === 'hi'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="हिन्दी में बदलें"
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  language === 'kn'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ"
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setTradeMode('TEXTILE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tradeMode === 'TEXTILE'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.textileMode}</span>
              </button>
              <button
                type="button"
                onClick={() => setTradeMode('BUILDING_MATERIALS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  tradeMode === 'BUILDING_MATERIALS'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>{t.buildingMode}</span>
              </button>
            </div>

            {/* RBAC Role Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px] font-medium">{t.roleLabel}</span>
              <select
                aria-label="User role selector"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="OWNER" className="bg-slate-900 text-white">{t.roleOwner}</option>
                <option value="MUNIM" className="bg-slate-900 text-white">{t.roleMunim}</option>
                <option value="GODOWN_DISPATCH" className="bg-slate-900 text-white">{t.roleGodown}</option>
              </select>
            </div>

            {/* Liquid Galla (Cash) & Bank Radar */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 text-[11px]">{t.cashInHand}:</span>
                <span className="font-mono font-bold text-emerald-400">₹{cashInHand.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-3 w-px bg-slate-700"></div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px]">{t.bankBalance}:</span>
                <span className="font-mono font-bold text-sky-400">₹{bankBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Sync Badge */}
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md" title="Offline SQLite / Cloud Sync Ready">
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" style={{ animationDuration: '6s' }} />
              <span className="font-mono font-medium">Sync OK</span>
            </div>

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={onResetDemoData}
              title={t.resetDemoData}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-md transition-colors tactile-btn"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">{t.resetDemoData}</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
