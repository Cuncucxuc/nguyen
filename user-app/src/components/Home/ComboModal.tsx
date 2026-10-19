import React, { useState } from 'react';
import { X, Popcorn, Sparkles, Check, ArrowRight } from 'lucide-react';
import { combos } from '../../data/mockData';
import { formatCurrency } from '../../utils';

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCombo?: (comboId: string) => void;
}

export const ComboModal: React.FC<ComboModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'solo' | 'couple' | 'party'>('all');

  if (!isOpen) return null;

  const filteredCombos = combos.filter((combo) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'solo') return combo.name.toLowerCase().includes('solo') || combo.name.toLowerCase().includes('bắp');
    if (selectedCategory === 'couple') return combo.name.toLowerCase().includes('couple');
    if (selectedCategory === 'party') return combo.name.toLowerCase().includes('gia đình') || combo.name.toLowerCase().includes('party');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Popcorn className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Thực Đơn Combo Bắp Nước</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tiết Kiệm 30%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Đặt trước trực tuyến để nhận ưu đãi giảm giá và không cần xếp hàng tại quầy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 border-b border-gray-800 bg-gray-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Tất Cả ({combos.length})
          </button>
          <button
            onClick={() => setSelectedCategory('solo')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'solo'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Dành Cho 1 Người
          </button>
          <button
            onClick={() => setSelectedCategory('couple')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'couple'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Combo Đôi (2 Người)
          </button>
          <button
            onClick={() => setSelectedCategory('party')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'party'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Nhóm & Gia Đình
          </button>
        </div>

        {/* Combo Cards Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh] grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCombos.map((combo) => {
            const originalPrice = Math.round(combo.price * 1.4);

            return (
              <div
                key={combo.id}
                className="bg-gray-800/60 hover:bg-gray-800 border border-gray-700/60 hover:border-amber-500/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gray-900 border border-gray-700 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                        {combo.image ? (
                          <img
                            src={combo.image}
                            alt={combo.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to emoji if image fails
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>🍿</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                          {combo.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-base font-black text-amber-400">
                            {formatCurrency(combo.price)}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {formatCurrency(originalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-red-400 bg-red-600/10 border border-red-600/20 px-2 py-0.5 rounded">
                      -30%
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    {combo.description}
                  </p>

                  <div className="space-y-1 mb-3 bg-gray-900/40 p-2.5 rounded-lg border border-gray-800/80">
                    <span className="text-[11px] font-semibold text-gray-400 block mb-1">Bao gồm:</span>
                    {combo.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-700/40">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Bắp thơm giòn chế biến nóng
                  </span>
                  <a
                    href="#movies"
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>Chọn phim & đặt</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-950/80 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            💡 <strong className="text-white">Mẹo:</strong> Bạn có thể thêm bắp nước trực tiếp tại <span className="text-amber-400 font-semibold">Bước 3</span> trong quy trình đặt vé xem phim.
          </p>
          <a
            href="#movies"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-center transition-all shadow-md shadow-amber-500/20"
          >
            ĐẶT VÉ NGAY
          </a>
        </div>
      </div>
    </div>
  );
};

export default ComboModal;
