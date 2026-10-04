import React, { useState } from 'react';
import { TradeMode, TextileItem, BuildingMaterialItem, TextileThaan } from '../types';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingDown,
  X,
  Layers,
  HardHat,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';

interface InventoryModuleProps {
  tradeMode: TradeMode;
  textileInventory: TextileItem[];
  buildingInventory: BuildingMaterialItem[];
  onAddTextileItem: (item: TextileItem) => void;
  onAddBuildingItem: (item: BuildingMaterialItem) => void;
}

const EMPTY_TEXTILE: Omit<TextileItem, 'id'> = {
  designNo: '',
  fabricName: '',
  widthInches: 58,
  shadeName: '',
  shadeCode: '#D97706',
  costRatePerMeter: 0,
  wholesaleRatePerMeter: 0,
  totalMeters: 0,
  thaanList: [],
  deadStockDays: 0,
};

const EMPTY_BUILDING: Omit<BuildingMaterialItem, 'id'> = {
  itemCode: '',
  name: '',
  gradeOrSpec: '',
  baseUnit: 'BAGS',
  stockOnHand: 0,
  reorderLevel: 0,
  costRate: 0,
  wholesaleRate: 0,
  deadStockDays: 0,
};

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  tradeMode,
  textileInventory,
  buildingInventory,
  onAddTextileItem,
  onAddBuildingItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TextileItem | BuildingMaterialItem | null>(null);

  // Textile add form state
  const [tForm, setTForm] = useState(EMPTY_TEXTILE);
  // Building add form state
  const [bForm, setBForm] = useState(EMPTY_BUILDING);
  // Thaan entry for textile
  const [newThaanMeters, setNewThaanMeters] = useState<number>(50);

  // ─── Filter by search ───────────────────────────────
  const filteredTextile = textileInventory.filter((t) =>
    t.fabricName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.designNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shadeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBuilding = buildingInventory.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.gradeOrSpec.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Summary stats ───────────────────────────────────
  const totalTextileMeters = textileInventory.reduce((s, t) => s + t.totalMeters, 0);
  const totalTextileCapital = textileInventory.reduce((s, t) => s + t.totalMeters * t.costRatePerMeter, 0);
  const lowStockBuilding = buildingInventory.filter((b) => b.stockOnHand <= b.reorderLevel);
  const totalBuildingCapital = buildingInventory.reduce((s, b) => s + b.stockOnHand * b.costRate, 0);
  const deadStockCount = tradeMode === 'TEXTILE'
    ? textileInventory.filter((t) => t.deadStockDays >= 60).length
    : buildingInventory.filter((b) => b.deadStockDays >= 60).length;

  // ─── Handle Textile Add ─────────────────────────────
  const handleAddTextile = () => {
    if (!tForm.fabricName || tForm.costRatePerMeter <= 0) {
      alert('कृपया कपड़े का नाम और लागत दर अवश्य भरें।');
      return;
    }
    const thaanList: TextileThaan[] = Array.from({ length: Math.ceil(tForm.totalMeters / newThaanMeters) }, (_, i) => ({
      id: `thaan-${Date.now()}-${i}`,
      lotNo: tForm.designNo || `LOT-${Date.now()}`,
      meters: newThaanMeters,
      isReserved: false,
      shadeCode: tForm.shadeCode,
      grade: 'Fresh-A' as const,
    }));

    const newItem: TextileItem = {
      ...tForm,
      id: `tex-${Date.now()}`,
      thaanList,
    };
    onAddTextileItem(newItem);
    setTForm(EMPTY_TEXTILE);
    setAddModalOpen(false);
    alert(`${newItem.fabricName} सफलतापूर्वक इन्वेंट्री में जोड़ा गया!`);
  };

  // ─── Handle Building Add ────────────────────────────
  const handleAddBuilding = () => {
    if (!bForm.name || bForm.costRate <= 0) {
      alert('कृपया माल का नाम और लागत दर अवश्य भरें।');
      return;
    }
    const newItem: BuildingMaterialItem = {
      ...bForm,
      id: `bld-${Date.now()}`,
    };
    onAddBuildingItem(newItem);
    setBForm(EMPTY_BUILDING);
    setAddModalOpen(false);
    alert(`${newItem.name} सफलतापूर्वक इन्वेंट्री में जोड़ा गया!`);
  };

  return (
    <div className="space-y-6">

      {/* ── Header Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tradeMode === 'TEXTILE' ? (
          <>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs text-slate-400 font-semibold">कुल थान / मीटर</div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                {totalTextileMeters.toLocaleString('en-IN')}m
              </div>
              <p className="text-[11px] text-slate-500">{textileInventory.length} डिज़ाइन</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs text-slate-400 font-semibold">स्टॉक पूंजी मूल्य</div>
              <div className="text-2xl font-black font-mono text-white mt-1">
                ₹{(totalTextileCapital / 100000).toFixed(1)}L
              </div>
              <p className="text-[11px] text-slate-500">लागत भाव पर</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs text-amber-300 font-semibold">रुका हुआ माल</div>
              <div className="text-2xl font-black font-mono text-amber-300 mt-1">{deadStockCount}</div>
              <p className="text-[11px] text-slate-500">60+ दिन अटका</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-600" />
            </div>
            <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs text-emerald-400 font-semibold">आरक्षित थान</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                {textileInventory.reduce((s, t) => s + t.thaanList.filter(th => th.isReserved).length, 0)}
              </div>
              <p className="text-[11px] text-slate-500">सौदों में बुक</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs text-slate-400 font-semibold">कुल SKU</div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-1">{buildingInventory.length}</div>
              <p className="text-[11px] text-slate-500">निर्माण सामग्री</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs text-slate-400 font-semibold">स्टॉक पूंजी</div>
              <div className="text-2xl font-black font-mono text-white mt-1">
                ₹{(totalBuildingCapital / 100000).toFixed(1)}L
              </div>
              <p className="text-[11px] text-slate-500">गोदाम मूल्य</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500" />
            </div>
            <div className="bg-slate-900/90 border border-red-900/40 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs text-red-400 font-semibold">कम स्टॉक अलर्ट</div>
              <div className="text-2xl font-black font-mono text-red-400 mt-1">{lowStockBuilding.length}</div>
              <p className="text-[11px] text-slate-500">रीऑर्डर लेवल से नीचे</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500" />
            </div>
            <div className="bg-slate-900/90 border border-amber-900/30 rounded-xl p-4 relative overflow-hidden">
              <div className="text-xs text-amber-300 font-semibold">रुका माल</div>
              <div className="text-2xl font-black font-mono text-amber-300 mt-1">{deadStockCount}</div>
              <p className="text-[11px] text-slate-500">60+ दिन अटका</p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-600" />
            </div>
          </>
        )}
      </div>

      {/* ── Search & Add Row ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={tradeMode === 'TEXTILE' ? 'डिज़ाइन, कपड़ा, या शेड खोजें...' : 'माल, ग्रेड, या कोड खोजें...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70"
          />
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg tactile-btn shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{tradeMode === 'TEXTILE' ? 'नया लॉट जोड़ें' : 'नया आइटम जोड़ें'}</span>
        </button>
      </div>

      {/* ── Inventory Grid ── */}
      {tradeMode === 'TEXTILE' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTextile.map((item) => {
            const reservedThaanCount = item.thaanList.filter((t) => t.isReserved).length;
            const availableThaanCount = item.thaanList.length - reservedThaanCount;
            const grossMargin = ((item.wholesaleRatePerMeter - item.costRatePerMeter) / item.wholesaleRatePerMeter) * 100;
            const isDeadStock = item.deadStockDays >= 60;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-amber-500/50 ${
                  isDeadStock
                    ? 'bg-amber-950/10 border-amber-900/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-slate-700 flex-shrink-0"
                        style={{ backgroundColor: item.shadeCode }}
                      />
                      <span className="font-bold text-white text-sm truncate">{item.fabricName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.designNo} • {item.shadeName} • {item.widthInches}"</p>
                  </div>
                  {isDeadStock && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex-shrink-0">
                      रुका माल
                    </span>
                  )}
                </div>

                {/* Meters & Thaan breakdown */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-950 rounded-lg p-1.5">
                    <div className="text-base font-black font-mono text-white">{item.totalMeters.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-400">कुल मीटर</div>
                  </div>
                  <div className="bg-emerald-950/30 rounded-lg p-1.5 border border-emerald-900/30">
                    <div className="text-base font-black font-mono text-emerald-400">{availableThaanCount}</div>
                    <div className="text-[10px] text-emerald-400/70">उपलब्ध थान</div>
                  </div>
                  <div className="bg-red-950/20 rounded-lg p-1.5 border border-red-900/20">
                    <div className="text-base font-black font-mono text-red-400">{reservedThaanCount}</div>
                    <div className="text-[10px] text-red-400/70">आरक्षित थान</div>
                  </div>
                </div>

                {/* Rate & Margin */}
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">लागत: </span>
                    <span className="font-mono text-slate-300">₹{item.costRatePerMeter}/m</span>
                    <span className="text-slate-600 mx-1">→</span>
                    <span className="font-mono font-bold text-amber-400">₹{item.wholesaleRatePerMeter}/m</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                    grossMargin >= 15
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : grossMargin >= 8
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}>
                    +{grossMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Building Materials Table ── */
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60">
                <th className="text-left px-4 py-3 text-slate-400 font-semibold">माल व ग्रेड</th>
                <th className="text-right px-4 py-3 text-slate-400 font-semibold">स्टॉक</th>
                <th className="text-right px-4 py-3 text-slate-400 font-semibold">रीऑर्डर</th>
                <th className="text-right px-4 py-3 text-slate-400 font-semibold">लागत दर</th>
                <th className="text-right px-4 py-3 text-slate-400 font-semibold">थोक दर</th>
                <th className="text-right px-4 py-3 text-slate-400 font-semibold">मार्जिन</th>
                <th className="text-center px-4 py-3 text-slate-400 font-semibold">स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredBuilding.map((item) => {
                const margin = ((item.wholesaleRate - item.costRate) / item.wholesaleRate) * 100;
                const isLowStock = item.stockOnHand <= item.reorderLevel;
                const isDeadStock = item.deadStockDays >= 60;

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`cursor-pointer transition-colors hover:bg-slate-800/40 ${
                      isLowStock ? 'bg-red-950/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.itemCode} • {item.gradeOrSpec}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono font-bold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                        {item.stockOnHand.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-500 ml-1">{item.baseUnit}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-slate-400">{item.reorderLevel}</span>
                      <span className="text-slate-600 ml-1">{item.baseUnit}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">₹{item.costRate.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">₹{item.wholesaleRate.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono font-bold ${
                        margin >= 10 ? 'text-emerald-400' : margin >= 5 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        +{margin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isDeadStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          रुका
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 flex items-center gap-1 justify-center">
                          <AlertTriangle className="w-3 h-3" /> कम
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 justify-center">
                          <CheckCircle2 className="w-3 h-3" /> ठीक
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Item Detail Modal ── */}
      {selectedItem && 'fabricName' in selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: selectedItem.shadeCode }} />
                <h3 className="text-base font-bold text-white m-0">{selectedItem.fabricName}</h3>
              </div>
              <button type="button" onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-500">डिज़ाइन नं:</span><p className="font-mono text-white">{selectedItem.designNo}</p></div>
              <div><span className="text-slate-500">चौड़ाई (पन्ना):</span><p className="font-mono text-white">{selectedItem.widthInches}"</p></div>
              <div><span className="text-slate-500">लागत दर:</span><p className="font-mono text-amber-400">₹{selectedItem.costRatePerMeter}/m</p></div>
              <div><span className="text-slate-500">थोक दर:</span><p className="font-mono text-amber-400">₹{selectedItem.wholesaleRatePerMeter}/m</p></div>
              <div><span className="text-slate-500">कुल मीटर:</span><p className="font-mono text-white">{selectedItem.totalMeters} m</p></div>
              <div><span className="text-slate-500">रुका दिन:</span><p className={`font-mono ${selectedItem.deadStockDays >= 60 ? 'text-amber-400' : 'text-slate-300'}`}>{selectedItem.deadStockDays} दिन</p></div>
            </div>
            <div className="pt-3 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 mb-2">थान सूची (Thaan List)</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedItem.thaanList.map((thaan) => (
                  <div key={thaan.id} className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                    thaan.isReserved ? 'bg-red-950/20 border border-red-900/30' : 'bg-slate-950 border border-slate-800'
                  }`}>
                    <span className="font-mono text-slate-300">
                      {thaan.meters}m · {thaan.grade} · {thaan.shadeCode}
                    </span>
                    <span className={`flex items-center gap-1 font-semibold ${thaan.isReserved ? 'text-red-400' : 'text-emerald-400'}`}>
                      {thaan.isReserved ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {thaan.isReserved ? 'आरक्षित' : 'उपलब्ध'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Building item detail modal ── */}
      {selectedItem && 'gradeOrSpec' in selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white m-0">{selectedItem.name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-500">आइटम कोड:</span><p className="font-mono text-white">{selectedItem.itemCode}</p></div>
              <div><span className="text-slate-500">ग्रेड / स्पेक:</span><p className="text-white">{selectedItem.gradeOrSpec}</p></div>
              <div><span className="text-slate-500">यूनिट:</span><p className="font-mono text-white">{selectedItem.baseUnit}</p></div>
              <div><span className="text-slate-500">स्टॉक:</span><p className={`font-mono font-bold ${selectedItem.stockOnHand <= selectedItem.reorderLevel ? 'text-red-400' : 'text-emerald-400'}`}>{selectedItem.stockOnHand}</p></div>
              <div><span className="text-slate-500">रीऑर्डर स्तर:</span><p className="font-mono text-slate-300">{selectedItem.reorderLevel}</p></div>
              <div><span className="text-slate-500">रुका दिन:</span><p className={`font-mono ${selectedItem.deadStockDays >= 60 ? 'text-amber-400' : 'text-slate-300'}`}>{selectedItem.deadStockDays} दिन</p></div>
              <div><span className="text-slate-500">लागत दर:</span><p className="font-mono text-slate-300">₹{selectedItem.costRate.toLocaleString('en-IN')}</p></div>
              <div><span className="text-slate-500">थोक दर:</span><p className="font-mono font-bold text-amber-400">₹{selectedItem.wholesaleRate.toLocaleString('en-IN')}</p></div>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">स्टॉक मूल्य (लागत):</span>
                <span className="font-mono font-bold text-white">
                  ₹{(selectedItem.stockOnHand * selectedItem.costRate).toLocaleString('en-IN')}
                </span>
              </div>
              {selectedItem.stockOnHand <= selectedItem.reorderLevel && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-red-950/30 border border-red-900/40 rounded-lg text-[11px] text-red-300">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>स्टॉक रीऑर्डर स्तर से नीचे है — तुरंत ऑर्डर करें!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Item Modal ── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {tradeMode === 'TEXTILE' ? (
                  <Layers className="w-5 h-5 text-amber-400" />
                ) : (
                  <HardHat className="w-5 h-5 text-amber-400" />
                )}
                <h3 className="text-base font-bold text-white m-0">
                  {tradeMode === 'TEXTILE' ? 'नया कपड़ा लॉट जोड़ें' : 'नया निर्माण सामग्री आइटम जोड़ें'}
                </h3>
              </div>
              <button type="button" onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              {tradeMode === 'TEXTILE' ? (
                /* Textile form */
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'कपड़े का नाम (Fabric Name)', key: 'fabricName', type: 'text', placeholder: '60x60 Cotton Cambric' },
                    { label: 'डिज़ाइन नं (Design No)', key: 'designNo', type: 'text', placeholder: 'DSG-201-BLUE' },
                    { label: 'शेड / रंग (Shade Name)', key: 'shadeName', type: 'text', placeholder: 'Royal Blue' },
                    { label: 'चौड़ाई इंच (Width in Panna)', key: 'widthInches', type: 'number', placeholder: '58' },
                    { label: 'लागत दर ₹/मीटर (Cost Rate)', key: 'costRatePerMeter', type: 'number', placeholder: '142' },
                    { label: 'थोक दर ₹/मीटर (Wholesale Rate)', key: 'wholesaleRatePerMeter', type: 'number', placeholder: '175' },
                    { label: 'कुल मीटर (Total Meters)', key: 'totalMeters', type: 'number', placeholder: '500' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-400 font-semibold">{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={(tForm as unknown as Record<string, number | string>)[key] || ''}
                        onChange={(e) =>
                          setTForm((prev) => ({
                            ...prev,
                            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
                          }))
                        }
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/70"
                      />
                    </div>
                  ))}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400 font-semibold">प्रति थान मीटर (Meters/Thaan)</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={newThaanMeters}
                      onChange={(e) => setNewThaanMeters(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/70"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400 font-semibold">शेड रंग कोड (Shade Color HEX)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={tForm.shadeCode}
                        onChange={(e) => setTForm((prev) => ({ ...prev, shadeCode: e.target.value }))}
                        className="w-10 h-9 rounded border border-slate-700 bg-slate-950 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-300">{tForm.shadeCode}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Building form */
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'माल का नाम (Item Name)', key: 'name', type: 'text', placeholder: 'UltraTech OPC Cement' },
                    { label: 'आइटम कोड (Item Code)', key: 'itemCode', type: 'text', placeholder: 'CEM-OPC-43' },
                    { label: 'ग्रेड / स्पेसिफिकेशन', key: 'gradeOrSpec', type: 'text', placeholder: 'Grade 43 OPC' },
                    { label: 'स्टॉक मात्रा (Stock On Hand)', key: 'stockOnHand', type: 'number', placeholder: '500' },
                    { label: 'रीऑर्डर स्तर (Reorder Level)', key: 'reorderLevel', type: 'number', placeholder: '100' },
                    { label: 'लागत दर ₹ (Cost Rate)', key: 'costRate', type: 'number', placeholder: '290' },
                    { label: 'थोक दर ₹ (Wholesale Rate)', key: 'wholesaleRate', type: 'number', placeholder: '320' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-400 font-semibold">{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={(bForm as unknown as Record<string, number | string>)[key] || ''}
                        onChange={(e) =>
                          setBForm((prev) => ({
                            ...prev,
                            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
                          }))
                        }
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/70"
                      />
                    </div>
                  ))}
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] text-slate-400 font-semibold">यूनिट (Base Unit)</label>
                    <select
                      value={bForm.baseUnit}
                      onChange={(e) => setBForm((prev) => ({ ...prev, baseUnit: e.target.value as BuildingMaterialItem['baseUnit'] }))}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/70"
                    >
                      <option value="BAGS">बोरी (Bags)</option>
                      <option value="TONNES">टन (Tonnes)</option>
                      <option value="SQ_FT">वर्ग फुट (Sq Ft)</option>
                      <option value="BUNDLES">बंडल (Bundles)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Calculated summary */}
              {tradeMode === 'TEXTILE' && tForm.totalMeters > 0 && tForm.costRatePerMeter > 0 && (
                <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-amber-400 mb-1">📦 लॉट सारांश</div>
                  <div className="flex justify-between"><span className="text-slate-400">अनुमानित थान:</span><span className="font-mono text-white">{Math.ceil(tForm.totalMeters / (newThaanMeters || 50))} थान</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">स्टॉक पूंजी मूल्य:</span><span className="font-mono text-white">₹{(tForm.totalMeters * tForm.costRatePerMeter).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">ग्रॉस मार्जिन:</span><span className="font-mono text-emerald-400">{tForm.wholesaleRatePerMeter > 0 ? (((tForm.wholesaleRatePerMeter - tForm.costRatePerMeter) / tForm.wholesaleRatePerMeter) * 100).toFixed(1) : 0}%</span></div>
                </div>
              )}
              {tradeMode === 'BUILDING_MATERIALS' && bForm.stockOnHand > 0 && bForm.costRate > 0 && (
                <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-amber-400 mb-1">📦 आइटम सारांश</div>
                  <div className="flex justify-between"><span className="text-slate-400">स्टॉक मूल्य:</span><span className="font-mono text-white">₹{(bForm.stockOnHand * bForm.costRate).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">ग्रॉस मार्जिन:</span><span className="font-mono text-emerald-400">{bForm.wholesaleRate > 0 ? (((bForm.wholesaleRate - bForm.costRate) / bForm.wholesaleRate) * 100).toFixed(1) : 0}%</span></div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={tradeMode === 'TEXTILE' ? handleAddTextile : handleAddBuilding}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg tactile-btn flex items-center gap-1.5"
              >
                <Package className="w-4 h-4" />
                <span>इन्वेंट्री में जोड़ें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Low stock alert banner (Building only) */}
      {tradeMode === 'BUILDING_MATERIALS' && lowStockBuilding.length > 0 && (
        <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start gap-3">
          <TrendingDown className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">⚠️ {lowStockBuilding.length} आइटम रीऑर्डर स्तर से नीचे हैं:</p>
            <p className="text-xs text-red-300/80 mt-1">
              {lowStockBuilding.map((b) => `${b.name} (${b.stockOnHand} ${b.baseUnit})`).join(' • ')}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
