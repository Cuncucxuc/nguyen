import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Download,
  Info,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Booking, Seat } from '../types';
import { sampleBookings } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getSeatLabel } from '../utils';
import {
  fetchUserBookings,
  cancelBookingInFirestore,
  getLocalBookings,
} from '../firebase/bookingService';

export const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Chuyển hướng về trang đăng nhập nếu chưa xác thực
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/dang-nhap');
    }
  }, [isAuthenticated, navigate]);

  // Khởi tạo danh sách vé (kết hợp LocalStorage và mockData ban đầu)
  const [bookingList, setBookingList] = useState<Booking[]>(() => {
    const local = getLocalBookings();
    return local.length > 0 ? local : (sampleBookings as Booking[]);
  });

  // Tải danh sách vé thời gian thực từ Cloud Firestore
  useEffect(() => {
    let isMounted = true;
    const loadBookings = async () => {
      try {
        const fetched = await fetchUserBookings(user);
        if (isMounted && fetched && fetched.length > 0) {
          setBookingList(fetched);
        }
      } catch (e) {
        console.warn('Lỗi khi tải vé từ Firestore:', e);
      }
    };

    if (isAuthenticated) {
      loadBookings();
    }
    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated]);

  // Tab filter: 'Tất cả' | 'Sắp xem' | 'Đã xem' | 'Đã hủy'
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  // Modal QR vé
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  // Modal Xác nhận hủy vé
  const [ticketToCancel, setTicketToCancel] = useState<Booking | null>(null);
  const [cancelToast, setCancelToast] = useState('');

  // Lọc vé theo tab
  const filteredBookings = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return bookingList.filter((b) => b.status === 'confirmed');
      case 'completed':
        return bookingList.filter((b) => b.status === 'completed');
      case 'cancelled':
        return bookingList.filter((b) => b.status === 'cancelled');
      case 'all':
      default:
        return bookingList;
    }
  }, [bookingList, activeTab]);

  // Hủy vé (đồng bộ Firestore và cập nhật giao diện)
  const confirmCancelTicket = async () => {
    if (!ticketToCancel) return;
    const ticketId = ticketToCancel.id;
    setBookingList((prev) =>
      prev.map((b) => (b.id === ticketId ? { ...b, status: 'cancelled' } : b))
    );
    cancelBookingInFirestore(ticketId).catch((err) =>
      console.warn('Lỗi hủy vé trên Firestore:', err)
    );
    setCancelToast(`Đã hủy thành công vé "${ticketToCancel.movieTitle}"!`);
    setTicketToCancel(null);
    setTimeout(() => setCancelToast(''), 4000);
  };

  // Trạng thái badge
  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Sắp chiếu / Đã xác nhận',
          classes: 'bg-green-500/15 text-green-400 border border-green-500/30',
        };
      case 'completed':
        return {
          label: 'Đã xem',
          classes: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          classes: 'bg-red-500/15 text-red-400 border border-red-500/30',
        };
      case 'pending':
      default:
        return {
          label: 'Đang xử lý',
          classes: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-7 bg-red-600 rounded-full" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">Vé Của Tôi</h1>
            </div>
            <p className="text-gray-400 text-sm mt-1.5">
              Danh sách các vé xem phim bạn đã đặt trực tuyến
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all text-sm font-semibold w-fit"
          >
            <span>Đặt vé mới</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Thông báo hủy vé thành công */}
        {cancelToast && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-3 text-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{cancelToast}</span>
          </div>
        )}

        {/* Tab Filters: Tất cả | Sắp xem | Đã xem | Đã hủy */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none border-b border-gray-800">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'upcoming', label: 'Sắp xem' },
            { key: 'completed', label: 'Đã xem' },
            { key: 'cancelled', label: 'Đã hủy' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tickets List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((ticket) => {
              const badge = getStatusBadge(ticket.status);
              const isConfirmed = ticket.status === 'confirmed';

              return (
                <div
                  key={ticket.id}
                  className="bg-gray-900/90 rounded-2xl border border-gray-800 hover:border-gray-700 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-lg transition-all duration-200"
                >
                  {/* Left: Movie Poster Thumbnail (w-24 h-36) */}
                  <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl overflow-hidden bg-gray-950 flex-shrink-0 mx-auto sm:mx-0 shadow-md border border-gray-800">
                    <img
                      src={ticket.moviePoster}
                      alt={ticket.movieTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Right Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Top Row: Title & Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-1">
                          {ticket.movieTitle}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Cinema & Room */}
                      <p className="text-sm text-gray-300 font-medium flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span>{ticket.cinemaName}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{ticket.roomName}</span>
                      </p>

                      {/* Showtime & Seats */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-gray-400 mt-2">
                        <div className="flex items-center gap-1 text-gray-300">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{ticket.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-300">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-white">
                            {ticket.startTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Ticket className="w-4 h-4 text-gray-400" />
                          <span>
                            Ghế:{' '}
                            <strong className="text-yellow-400">
                              {(
                                ticket.seatLabels ||
                                ticket.seats?.map((s: Seat) => getSeatLabel(s)) ||
                                []
                              ).join(', ')}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Combos if any */}
                      {ticket.combos && ticket.combos.length > 0 && (
                        <div className="mt-2 text-xs text-gray-400 bg-gray-950/60 p-2 rounded-lg border border-gray-800/80">
                          <span className="text-gray-300 font-medium">Bắp nước: </span>
                          {ticket.combos
                            .map((c: any) => `${c.name || c.combo?.name} (x${c.quantity})`)
                            .join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Total Price & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-800">
                      <div>
                        <span className="text-xs text-gray-400">Tổng thanh toán: </span>
                        <span className="text-base sm:text-lg font-bold text-red-500 ml-1">
                          {formatCurrency(ticket.totalPrice || 0)}
                        </span>
                        <span className="text-[11px] text-gray-500 ml-2">
                          ({ticket.paymentMethod})
                        </span>
                      </div>

                      {/* Actions for confirmed ticket */}
                      <div className="flex items-center gap-2">
                        {isConfirmed && (
                          <>
                            <button
                              onClick={() => setTicketToCancel(ticket)}
                              className="px-4 py-2 rounded-xl border border-red-600/40 hover:border-red-600 text-red-400 hover:bg-red-600/10 text-xs sm:text-sm font-semibold transition-all"
                            >
                              Hủy Vé
                            </button>
                            <button
                              onClick={() => setSelectedTicket(ticket)}
                              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all"
                            >
                              <QrCode className="w-4 h-4" />
                              <span>Xem Vé</span>
                            </button>
                          </>
                        )}

                        {ticket.status === 'completed' && (
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs sm:text-sm font-medium transition-all"
                          >
                            Xem Chi Tiết
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-900/60 rounded-3xl border border-gray-800 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center border border-red-600/20">
              <Ticket className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Bạn chưa có vé nào</h3>
              <p className="text-gray-400 text-sm max-w-sm">
                Hãy khám phá các siêu phẩm điện ảnh đang công chiếu và chọn cho mình vị trí ghế ngồi tuyệt vời nhất!
              </p>
            </div>
            <Link
              to="/"
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-600/30"
            >
              <span>Xem phim đang chiếu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* QR Code Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-red-200 font-semibold">
                  Vé Điện Tử StarCinema
                </span>
                <h3 className="text-lg font-bold line-clamp-1">{selectedTicket.movieTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-center">
              {/* QR Code Container */}
              <div className="bg-white p-5 rounded-2xl mx-auto w-52 h-52 flex flex-col items-center justify-center shadow-inner relative group border-4 border-gray-200">
                <QRCodeSVG value={`CINEVIET:${selectedTicket.id}`} size={160} />
              </div>

              {/* Booking ID */}
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                <span className="text-xs text-gray-400 uppercase tracking-widest block mb-0.5">
                  Mã Vé
                </span>
                <span className="text-xl font-mono font-bold text-yellow-400 tracking-wider">
                  {selectedTicket.id}
                </span>
              </div>

              <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                <Info className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Đưa mã này cho nhân viên soát vé tại rạp để vào phòng chiếu</span>
              </p>

              {/* Ticket Meta Details */}
              <div className="bg-gray-950/70 p-4 rounded-xl border border-gray-800/80 text-left space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rạp:</span>
                  <span className="text-white font-medium text-right">
                    {selectedTicket.cinemaName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phòng chiếu:</span>
                  <span className="text-white font-medium">{selectedTicket.roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Suất chiếu:</span>
                  <span className="text-white font-medium">
                    {selectedTicket.startTime} - {selectedTicket.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ghế ngồi:</span>
                  <span className="text-yellow-400 font-bold">
                    {(
                      selectedTicket.seatLabels ||
                      selectedTicket.seats?.map((s: Seat) => getSeatLabel(s)) ||
                      []
                    ).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-2">
                  <span className="text-gray-400">Thanh toán:</span>
                  <span className="text-red-400 font-bold">
                    {formatCurrency(selectedTicket.totalPrice || 0)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => alert('Đã lưu hình ảnh vé vào thư viện ảnh!')}
                  className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-gray-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Vé / Lưu Ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-600/30"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Hủy Vé */}
      {ticketToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto border border-red-600/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Xác Nhận Hủy Vé?</h3>
              <p className="text-gray-400 text-sm">
                Bạn có chắc chắn muốn hủy vé xem phim{' '}
                <strong className="text-white">"{ticketToCancel.movieTitle}"</strong> không?
                Số tiền{' '}
                <strong className="text-red-400">
                  {formatCurrency(ticketToCancel.totalPrice || 0)}
                </strong>{' '}
                sẽ được hoàn trả vào phương thức thanh toán ban đầu theo chính sách của rạp.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTicketToCancel(null)}
                className="flex-1 py-3 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300 font-semibold text-sm transition-all"
              >
                Không, giữ vé
              </button>
              <button
                type="button"
                onClick={confirmCancelTicket}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-600/30"
              >
                Đồng ý hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
