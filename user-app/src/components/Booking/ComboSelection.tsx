import React, { useMemo, useState } from 'react';
import { Plus, Minus, Popcorn, ShoppingBag, ArrowRight } from 'lucide-react';
import { Combo, SelectedCombo } from '../../types';
import { combos as allCombos } from '../../data/mockData';
import { formatCurrency } from '../../utils';

interface ComboSelectionProps {
  selectedCombos: SelectedCombo[];
  onComboChange: (combos: SelectedCombo[]) => void;
  onSkip?: () => void;
}

export const ComboSelection: React.FC<ComboSelectionProps> = ({
  selectedCombos,
  onComboChange,
  onSkip,
}) => {
  // Helper to get quantity of a combo
  const getQuantity = (comboId: string): number => {
    const found = selectedCombos.find((sc) => sc.combo.id === comboId);
    return found ? found.quantity : 0;
  };

  // Change quantity of combo
  const updateQuantity = (combo: Combo, delta: number) => {
    const currentQty = getQuantity(combo.id);
    const newQty = Math.max(0, Math.min(5, currentQty + delta));

    if (newQty === 0) {
      // Remove combo
      onComboChange(selectedCombos.filter((sc) => sc.combo.id !== combo.id));
    } else {
      const exists = selectedCombos.some((sc) => sc.combo.id === combo.id);
      if (exists) {
        onComboChange(
          selectedCombos.map((sc) =>
            sc.combo.id === combo.id ? { ...sc, quantity: newQty } : sc
          )
        );
      } else {
        onComboChange([...selectedCombos, { combo, quantity: newQty }]);
      }
    }
  };

  // Calculate total combo cost
  const totalComboPrice = useMemo(() => {
    return selectedCombos.reduce(
      (sum, sc) => sum + sc.combo.price * sc.quantity,
      0
    );
  }, [selectedCombos]);

  const totalComboCount = useMemo(() => {
    return selectedCombos.reduce((sum, sc) => sum + sc.quantity, 0);
  }, [selectedCombos]);

  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Popcorn className="w-6 h-6 text-red-600" />
            Chọn Bắp Nước & Combo
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Thưởng thức thêm bắp ngọt, snack và nước giải khát cùng trải nghiệm điện ảnh trọn vẹn
          </p>
        </div>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-gray-400 hover:text-white underline underline-offset-4 transition self-start sm:self-auto cursor-pointer flex items-center gap-1"
          >
            <span>Bỏ qua bắp nước</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid of Combo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allCombos.map((combo) => {
          const qty = getQuantity(combo.id);
          const isSelected = qty > 0;

          return (
            <div
              key={combo.id}
              className={`bg-gray-900 rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-red-500/80 ring-1 ring-red-500/50 shadow-lg shadow-red-950/40'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div>
                {/* Visual / Image Header */}
                <div className="bg-gray-800 rounded-xl h-36 relative overflow-hidden select-none mb-4 group/img">
                  {combo.image && !imgError[combo.id] ? (
                    <img
                      src={combo.image}
                      alt={combo.name}
                      onError={() => setImgError((prev) => ({ ...prev, [combo.id]: true }))}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900/30 via-gray-800 to-gray-900 flex items-center justify-center text-4xl">
                      <span>🍿🥤</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent pointer-events-none" />

                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                      <span>Đã chọn: {qty}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="font-bold text-base text-white line-clamp-1">
                  {combo.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 min-h-[32px]">
                  {combo.description}
                </p>

                {/* Items bullet list */}
                {combo.items && combo.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-800/80">
                    <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
                      Bao gồm:
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {combo.items.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-400 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Price and Counter footer */}
              <div className="mt-5 pt-3 border-t border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Đơn giá</span>
                  <span className="text-base sm:text-lg font-black text-red-500">
                    {formatCurrency(combo.price)}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-2 bg-gray-800 rounded-xl p-1 border border-gray-700">
                  <button
                    type="button"
                    disabled={qty === 0}
                    onClick={() => updateQuantity(combo, -1)}
                    className="w-8 h-8 rounded-lg bg-gray-700/80 hover:bg-gray-600 disabled:opacity-30 disabled:hover:bg-gray-700/80 text-white flex items-center justify-center transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    title="Giảm số lượng"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-7 text-center font-bold text-sm text-white select-none">
                    {qty}
                  </span>

                  <button
                    type="button"
                    disabled={qty >= 5}
                    onClick={() => updateQuantity(combo, 1)}
                    className="w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:hover:bg-red-600 text-white flex items-center justify-center transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    title="Tăng số lượng (tối đa 5)"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block">
              {totalComboCount > 0
                ? `Đã chọn ${totalComboCount} món combo bắp nước`
                : 'Chưa chọn combo bắp nước nào'}
            </span>
            <span className="text-xs text-gray-400">
              Bạn có thể điều chỉnh hoặc bỏ qua bước này nếu không có nhu cầu
            </span>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-gray-800 pt-3 sm:pt-0">
          <span className="text-xs text-gray-400">Tiền bắp nước:</span>
          <span className="text-xl sm:text-2xl font-black text-red-500">
            {formatCurrency(totalComboPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComboSelection;
