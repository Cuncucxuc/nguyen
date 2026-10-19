import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Check,
} from 'lucide-react';
import { Movie, Showtime, Seat, SelectedCombo } from '../../types';
import { getSeatLabel, getSeatTypeName, formatCurrency } from '../../utils';

interface PaymentSummaryProps {
  movie: Movie;
  showtime: Showtime;
  selectedSeats: Seat[];
  selectedCombos: SelectedCombo[];
  onConfirm: (paymentData?: {
    paymentMethod: string;
    discountCode: string;
    discountAmount: number;
    finalTotal: number;
  }) => void;
  onBack: () => void;
}

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge?: string;
}

const PAYMENT_METHODS: PaymentOption[] = [
  {
    id: 'vnpay',
    name: 'VNPay',
    description: 'Thanh toán qua cổng VNPAY-QR hoặc thẻ ATM',
    icon: '💳',
    badge: 'Khuyên Dùng',
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    description: 'Quét mã QR qua ứng dụng MoMo siêu nhanh',
    icon: '👛',
  },
  {
    id: 'zalopay',
    name: 'Ví ZaloPay',
    description: 'Thanh toán tức thì ngay trong Zalo hoặc App ZaloPay',
    icon: '⚡',
  },
  {
    id: 'card',
    name: 'Thẻ ngân hàng',
    description: 'Thẻ Quốc tế Visa, Mastercard, JCB hoặc ATM Nội địa',
    icon: '🏦',
  },
];

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  movie,
  showtime,
  selectedSeats,
  selectedCombos,
  onConfirm,
  onBack,
}) => {
  // Countdown timer: 10 minutes (600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isTimeExpired, setIsTimeExpired] = useState<boolean>(false);

  // Discount code state
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Selected payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('vnpay');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculations
  const seatsTotal = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  const combosTotal = useMemo(() => {
    return selectedCombos.reduce(
      (sum, sc) => sum + sc.combo.price * sc.quantity,
      0
    );
  }, [selectedCombos]);

  const subtotal = seatsTotal + combosTotal;

  // Apply discount logic
  const handleApplyDiscount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDiscountError(null);

    const cleanCode = discountCode.trim().toUpperCase();
    if (!cleanCode) {
      setDiscountError('Vui lòng nhập mã giảm giá.');
      return;
    }

    if (cleanCode === 'CINEMA50') {
      const discount = Math.min(50000, subtotal);
      setAppliedDiscount({ code: cleanCode, amount: discount });
    } else if (cleanCode === 'VIP10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount({ code: cleanCode, amount: discount });
    } else if (cleanCode === 'XINCHAO') {
      const discount = Math.min(20000, subtotal);
      setAppliedDiscount({ code: cleanCode, amount: discount });
    } else {
      setDiscountError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError(null);
  };

  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleSubmit = () => {
    if (isTimeExpired) return;
    setIsProcessing(true);

    setTimeout(() => {
      onConfirm({
        paymentMethod: selectedPaymentMethod,
        discountCode: appliedDiscount?.code || '',
        discountAmount,
        finalTotal,
      });
    }, 600);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Countdown Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-red-600" />
            Xác Nhận & Thanh Toán
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Kiểm tra thông tin vé xem phim và lựa chọn hình thức thanh toán an toàn
          </p>
        </div>

        {/* 10-Minute Countdown Display */}
        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors self-start sm:self-auto ${
            timeLeft < 120
              ? 'bg-red-950/80 border-red-700 text-red-300 animate-pulse'
              : 'bg-gray-800/80 border-gray-700 text-yellow-400'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Hoàn tất trong:</span>
          <span className="font-mono text-base font-extrabold text-white">
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {isTimeExpired && (
        <div className="p-4 bg-red-950/90 border border-red-600 rounded-xl text-red-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <strong className="block text-white font-bold">Đã hết thời gian giữ vé!</strong>
            Thời gian hoàn tất thanh toán 10 phút đã hết. Vui lòng quay lại chọn lại ghế để đảm bảo ghế vẫn còn trống.
          </div>
        </div>
      )}

      {/* Main Grid: Details & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Order Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Movie & Showtime Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
            <div className="flex gap-4">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-xl border border-gray-700/60 shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {movie.ageRating || 'T16'}
                  </span>
                  <span className="bg-gray-800 text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded border border-gray-700">
                    {showtime.roomType || '2D'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {movie.duration} phút
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white truncate">
                  {movie.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                  Thể loại: {movie.genre.join(', ')}
                </p>

                {/* Showtime details pills */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                  <div className="flex items-center gap-1.5 bg-gray-800/60 px-2.5 py-1.5 rounded-lg border border-gray-700/40">
                    <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{showtime.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-800/60 px-2.5 py-1.5 rounded-lg border border-gray-700/40">
                    <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{showtime.startTime}</span>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1.5 bg-gray-800/60 px-2.5 py-1.5 rounded-lg border border-gray-700/40">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{showtime.cinemaName} • {showtime.roomName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seats & Combos Breakdown Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-gray-800">
              Chi Tiết Đơn Hàng
            </h4>

            {/* Seats detail */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                <span>Ghế ({selectedSeats.length})</span>
                <span>Thành tiền</span>
              </div>
              <div className="space-y-1.5">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between text-sm py-1 border-b border-gray-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white bg-gray-800 px-2 py-0.5 rounded text-xs border border-gray-700">
                        {getSeatLabel(seat)}
                      </span>
                      <span className="text-xs text-gray-400">
                        (Ghế {getSeatTypeName(seat.type)})
                      </span>
                    </div>
                    <span className="font-medium text-gray-200">
                      {formatCurrency(seat.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Combos detail */}
            {selectedCombos.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                  <span>Bắp Nước ({selectedCombos.reduce((a, b) => a + b.quantity, 0)})</span>
                  <span>Thành tiền</span>
                </div>
                <div className="space-y-1.5">
                  {selectedCombos.map(({ combo, quantity }) => (
                    <div
                      key={combo.id}
                      className="flex items-center justify-between text-sm py-1 border-b border-gray-800/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                          {combo.image ? (
                            <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm">🍿</span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-white text-xs sm:text-sm block">
                            {combo.name}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {quantity} x {formatCurrency(combo.price)}
                          </span>
                        </div>
                      </div>
                      <span className="font-medium text-gray-200">
                        {formatCurrency(combo.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtotal calculation */}
            <div className="pt-3 border-t border-gray-800 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Tổng tiền vé:</span>
                <span className="text-gray-200">{formatCurrency(seatsTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tổng tiền bắp nước:</span>
                <span className="text-gray-200">{formatCurrency(combosTotal)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-green-400 font-semibold">
                  <span>Giảm giá ({appliedDiscount.code}):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Discount & Payment Methods (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Discount Code Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-500" />
              Mã Giảm Giá / Voucher
            </h4>

            {appliedDiscount ? (
              <div className="p-3 bg-green-950/50 border border-green-700/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Đã áp dụng mã: {appliedDiscount.code}
                    </span>
                    <span className="text-[11px] text-green-300">
                      Tiết kiệm {formatCurrency(appliedDiscount.amount)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeDiscount}
                  className="text-xs text-red-400 hover:text-red-300 font-medium underline cursor-pointer"
                >
                  Xoá mã
                </button>
              </div>
            ) : (
              <div>
                <form onSubmit={handleApplyDiscount} className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      setDiscountError(null);
                    }}
                    placeholder="VD: CINEMA50, VIP10, XINCHAO"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 uppercase font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyDiscount()}
                    className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-4 py-2 rounded-xl border border-gray-600 hover:border-gray-500 transition cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </form>

                {discountError && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {discountError}
                  </p>
                )}

                <div className="mt-2 text-[11px] text-gray-500 flex flex-wrap gap-1.5 items-center">
                  <span>Mã gợi ý:</span>
                  <button
                    type="button"
                    onClick={() => setDiscountCode('CINEMA50')}
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    CINEMA50 (-50k)
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setDiscountCode('VIP10')}
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    VIP10 (-10%)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Phương Thức Thanh Toán
            </h4>

            <div className="space-y-2.5 pt-1">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = selectedPaymentMethod === pm.id;

                return (
                  <div
                    key={pm.id}
                    onClick={() => setSelectedPaymentMethod(pm.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'border-red-500 bg-red-600/10 ring-1 ring-red-500/60 shadow-md'
                        : 'border-gray-800 bg-gray-800/40 hover:bg-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-xl shrink-0 border border-gray-700">
                        {pm.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {pm.name}
                          </span>
                          {pm.badge && (
                            <span className="text-[10px] font-semibold bg-red-600 text-white px-1.5 py-0.5 rounded">
                              {pm.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {pm.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-red-500 bg-red-600 text-white'
                          : 'border-gray-600 bg-gray-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total & Action Buttons Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-baseline justify-between border-b border-gray-800 pb-3">
              <span className="text-sm font-semibold text-gray-300">Tổng Số Tiền:</span>
              <span className="text-2xl sm:text-3xl font-black text-red-500">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={onBack}
                disabled={isProcessing}
                className="order-2 sm:order-1 flex-1 py-3 px-4 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isProcessing || isTimeExpired || selectedSeats.length === 0}
                className="order-1 sm:order-2 flex-[2] py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/40 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xử lý thanh toán...</span>
                  </div>
                ) : (
                  <span>Xác Nhận Thanh Toán</span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span>Giao dịch bảo mật 100% bằng chứng chỉ mã hóa SSL 256-bit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
