import React, { useState } from 'react';
import { X, Gift, Award, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  code: string;
  tag: string;
}

const AVAILABLE_REWARDS: RewardItem[] = [
  {
    id: 'reward-1',
    title: 'Mã Giảm Giá 20.000đ',
    pointsCost: 300,
    description: 'Áp dụng cho mọi hóa đơn đặt vé hoặc bắp nước trực tuyến.',
    code: 'XINCHAO',
    tag: 'Dễ đổi nhất',
  },
  {
    id: 'reward-2',
    title: 'Voucher Giảm 50.000đ',
    pointsCost: 600,
    description: 'Giảm ngay 50.000đ trên tổng hóa đơn thanh toán vé xem phim.',
    code: 'CINEMA50',
    tag: 'Phổ biến',
  },
  {
    id: 'reward-3',
    title: 'Giảm 10% Tổng Đơn Vé',
    pointsCost: 900,
    description: 'Ưu đãi giảm 10% không giới hạn số lượng ghế đặt cùng lúc.',
    code: 'VIP10',
    tag: 'Tiết kiệm cao',
  },
  {
    id: 'reward-4',
    title: '1 Phần Bắp Rang Bơ Miễn Phí',
    pointsCost: 1200,
    description: 'Đổi 1 bắp rang bơ cỡ lớn thơm giòn tại bất kỳ cụm rạp nào.',
    code: 'FREEBAP2026',
    tag: 'Quà ẩm thực',
  },
];

export const RewardsModal: React.FC<RewardsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const currentPoints = user?.points || 0;

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Tính toán hạng thành viên
  const getMembershipTier = (points: number) => {
    if (points >= 3000) return { name: 'Hạng Kim Cương', color: 'text-cyan-400', badge: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300', next: 5000 };
    if (points >= 1500) return { name: 'Hạng Vàng', color: 'text-amber-400', badge: 'bg-amber-500/20 border-amber-500/40 text-amber-300', next: 3000 };
    if (points >= 500) return { name: 'Hạng Bạc', color: 'text-gray-300', badge: 'bg-gray-400/20 border-gray-400/40 text-gray-200', next: 1500 };
    return { name: 'Hạng Đồng', color: 'text-orange-400', badge: 'bg-orange-500/20 border-orange-500/40 text-orange-300', next: 500 };
  };

  const tier = getMembershipTier(currentPoints);
  const progressPercent = Math.min(Math.round((currentPoints / tier.next) * 100), 100);

  const handleRedeem = (reward: RewardItem) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để tích lũy và đổi điểm thưởng!');
      return;
    }

    if (currentPoints < reward.pointsCost) {
      alert(`Bạn còn thiếu ${reward.pointsCost - currentPoints} điểm để đổi quà này!`);
      return;
    }

    // Trừ điểm và cấp voucher
    const newPoints = currentPoints - reward.pointsCost;
    updateProfile({ points: newPoints });

    setRedeemedCode(reward.code);
    setSuccessMessage(`Chúc mừng bạn đã đổi thành công "${reward.title}"! Sử dụng mã bên dưới khi thanh toán.`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gray-900 border border-yellow-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">Chương Trình Tích Điểm Đổi Quà</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Mỗi 10.000đ khi mua vé được tích ngay 10 điểm thưởng
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

        {/* Member Status Card */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-black border-b border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">Tài khoản thành viên:</span>
                <span className="text-sm font-bold text-white">{user?.displayName || 'Khách hàng'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${tier.badge}`}>
                  {tier.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-yellow-400">{currentPoints.toLocaleString('vi-VN')}</span>
                <span className="text-sm font-semibold text-gray-300">điểm khả dụng</span>
              </div>
            </div>

            {/* Tiến độ thăng hạng */}
            <div className="w-full sm:w-56 space-y-1.5">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Tiến độ thăng hạng</span>
                <span className="text-yellow-400 font-semibold">{currentPoints} / {tier.next} pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Success Alert if redeemed */}
          {successMessage && redeemedCode && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm space-y-2 animate-fadeIn">
              <p className="font-semibold flex items-center gap-1.5 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>{successMessage}</span>
              </p>
              <div className="flex items-center gap-2 bg-gray-900/80 p-2.5 rounded-lg border border-emerald-500/40">
                <span className="text-xs text-gray-400">Mã ưu đãi của bạn:</span>
                <span className="text-sm font-mono font-bold text-white tracking-widest">{redeemedCode}</span>
                <button
                  onClick={() => handleCopyCode(redeemedCode)}
                  className="ml-auto inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors"
                >
                  {copiedCode === redeemedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rewards List */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[48vh] space-y-3">
          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Danh Sách Quà Đổi Điểm</span>
          </h4>

          <div className="space-y-3">
            {AVAILABLE_REWARDS.map((reward) => {
              const canAfford = currentPoints >= reward.pointsCost;

              return (
                <div
                  key={reward.id}
                  className="bg-gray-800/60 hover:bg-gray-800 border border-gray-700/60 hover:border-yellow-500/30 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-base font-bold text-white">{reward.title}</h5>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                        {reward.tag}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                      {reward.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-700/50">
                    <div className="text-left sm:text-right">
                      <span className="text-sm sm:text-base font-black text-yellow-400">
                        {reward.pointsCost.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">điểm</span>
                    </div>

                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        canAfford
                          ? 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-md shadow-yellow-400/20 cursor-pointer'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {canAfford ? 'Đổi Quà Ngay' : 'Chưa đủ điểm'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-950/80 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span>Tích thêm điểm sau mỗi lần mua vé</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardsModal;
