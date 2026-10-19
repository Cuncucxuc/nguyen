import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Armchair,
  Popcorn,
  Mail,
  Home,
  Ticket,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { Movie, Showtime, Seat, SelectedCombo } from '../types';
import { getSeatLabel, formatCurrency } from '../utils';

interface BookingResultState {
  bookingId?: string;
  movie?: Movie;
  showtime?: Showtime;
  seats?: Seat[];
  combos?: SelectedCombo[];
  totalAmount?: number;
  paymentMethod?: string;
  discountCode?: string;
  discountAmount?: number;
  createdAt?: string;
}

export const PaymentResultPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [animateSuccess, setAnimateSuccess] = useState<boolean>(false);

  const state = (location.state as BookingResultState) || {};

  // Default fallback data if page was accessed directly
  const bookingId = state.bookingId || 'BK' + Math.floor(100000 + Math.random() * 900000);
  const movieTitle = state.movie?.title || 'Lật Mặt 7: Một Điều Ước';
  const moviePoster = state.movie?.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
  const cinemaName = state.showtime?.cinemaName || 'CGV Vincom Landmark 81';
  const roomName = state.showtime?.roomName || 'Cinema 01 (2D Phụ Đề)';
  const showDate = state.showtime?.date || 'Hôm nay';
  const showTime = state.showtime?.startTime || '19:00';
  const seats = state.seats && state.seats.length > 0
    ? state.seats
    : [
        { id: '1', row: 'F', col: 5, type: 'standard' as const, status: 'booked' as const, price: 90000 },
        { id: '2', row: 'F', col: 6, type: 'standard' as const, status: 'booked' as const, price: 90000 },
      ];
  const combos = state.combos || [];
  const totalAmount = state.totalAmount || 180000;
  const paymentMethod = state.paymentMethod || 'VNPay';
  const customerEmail = user?.email || 'khachhang@cinema.vn';

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateSuccess(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-10 px-4 sm:px-6 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Confetti Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
        {[...Array(24)].map((_, i) => {
          const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
          const color = colors[i % colors.length];
          const left = `${(i * 4.2) % 100}%`;
          const delay = `${(i * 0.15).toFixed(1)}s`;
          const size = `${(i % 3) * 3 + 6}px`;

          return (
            <div
              key={i}
              className="absolute rounded-full opacity-80 animate-confettiFall"
              style={{
                backgroundColor: color,
                left,
                top: '-20px',
                width: size,
                height: size,
                animationDelay: delay,
                animationDuration: `${2.5 + (i % 3)}s`,
                animationIterationCount: 'infinite',
              }}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(360deg);
            opacity: 0.2;
          }
        }
      `}</style>

      <div className="max-w-2xl w-full mx-auto relative z-10 space-y-8 animate-fadeIn">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div
            className={`w-20 h-20 mx-auto rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-green-500 transition-all duration-700 transform ${
              animateSuccess ? 'scale-100 opacity-100 shadow-[0_0_30px_rgba(16,185,129,0.5)]' : 'scale-50 opacity-0'
            }`}
          >
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Đặt Vé Thành Công!
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi. Mã vé điện tử của bạn đã sẵn sàng sử dụng.
          </p>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-xs text-gray-300">
            <Mail className="w-3.5 h-3.5 text-red-500" />
            <span>Vé đã được gửi đến: <strong className="text-white">{customerEmail}</strong></span>
          </div>
        </div>

        {/* Cinematic Ticket Stub Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-sm sm:text-base tracking-wide uppercase">
                Vé Xem Phim Điện Tử
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-red-200 block uppercase">Mã Đặt Vé</span>
              <span className="font-mono font-black text-white text-base tracking-wider">
                #{bookingId}
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-5 sm:p-7 space-y-6">
            {/* Movie Info */}
            <div className="flex gap-4 items-center">
              <img
                src={moviePoster}
                alt={movieTitle}
                className="w-16 h-24 object-cover rounded-xl border border-gray-800 shadow shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {state.movie?.ageRating || 'T16'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white truncate mt-1">
                  {movieTitle}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Định dạng: <span className="text-yellow-400 font-semibold">{state.showtime?.roomType || '2D Digital'}</span>
                </p>
              </div>
            </div>

            {/* Grid of Key Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-800/50 rounded-2xl p-4 border border-gray-800">
              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Ngày chiếu</span>
                <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{showDate}</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Giờ chiếu</span>
                <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{showTime}</span>
                </p>
              </div>

              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Ghế ngồi</span>
                <p className="text-xs sm:text-sm font-bold text-red-400 flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{seats.map(getSeatLabel).join(', ')}</span>
                </p>
              </div>

              <div className="space-y-0.5 col-span-2 sm:col-span-2">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Rạp chiếu & Phòng</span>
                <p className="text-xs sm:text-sm font-medium text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{cinemaName} • {roomName}</span>
                </p>
              </div>

              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Thanh toán</span>
                <p className="text-xs sm:text-sm font-medium text-gray-200 uppercase">
                  {paymentMethod}
                </p>
              </div>
            </div>

            {/* Combos if any */}
            {combos.length > 0 && (
              <div className="text-xs space-y-1.5 bg-gray-800/30 p-3 rounded-xl border border-gray-800/80">
                <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                  <Popcorn className="w-3.5 h-3.5 text-yellow-400" />
                  Bắp nước kèm theo:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {combos.map(({ combo, quantity }) => (
                    <span
                      key={combo.id}
                      className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md text-xs border border-gray-700"
                    >
                      {quantity}x {combo.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Tear Perforation / Divider */}
            <div className="relative my-4">
              <div className="border-t-2 border-dashed border-gray-800" />
              <div className="absolute -left-9 sm:-left-11 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0f0f0f]" />
              <div className="absolute -right-9 sm:-right-11 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0f0f0f]" />
            </div>

            {/* QR Code and Total Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-2">
              {/* QR Code Card */}
              <div className="flex items-center gap-4 bg-white text-gray-900 p-3 rounded-2xl shadow-inner w-full sm:w-auto justify-center sm:justify-start">
                <div className="p-1 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                  <QRCodeSVG value={`CINEVIET:${bookingId}`} size={72} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">
                    Mã check-in vào rạp
                  </span>
                  <span className="font-mono font-extrabold text-sm text-gray-900 block mt-0.5">
                    {bookingId}
                  </span>
                  <span className="text-[10px] text-gray-600 block mt-1">
                    Quét tại quầy / máy in tự động
                  </span>
                </div>
              </div>

              {/* Total Price display */}
              <div className="text-center sm:text-right">
                <span className="text-xs text-gray-400 uppercase font-semibold block">
                  Tổng thanh toán
                </span>
                <span className="text-2xl sm:text-3xl font-black text-red-500">
                  {formatCurrency(totalAmount)}
                </span>
                <span className="text-[11px] text-green-400 block mt-0.5 font-medium">
                  ✓ Đã thanh toán thành công
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link
            to="/ve-cua-toi"
            className="flex-1 py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
          >
            <Ticket className="w-5 h-5" />
            <span>Xem Vé Của Tôi</span>
          </Link>

          <Link
            to="/"
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gray-900 hover:bg-gray-800 text-gray-200 font-bold text-sm sm:text-base border border-gray-800 hover:border-gray-700 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>Về Trang Chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
