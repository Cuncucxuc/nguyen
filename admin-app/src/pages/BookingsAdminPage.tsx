import React, { useEffect, useState, useMemo } from 'react';
import {
  Ticket,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Calendar,
  CreditCard,
  User,
  X,
  Filter,
} from 'lucide-react';
import { subscribeBookings, updateBookingStatus } from '../firebase/adminService';
import { Booking } from '../types';
import { formatCurrency, formatDateTime } from '../utils';

export const BookingsAdminPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeBookings((data) => {
      setBookings(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        b.id.toLowerCase().includes(q) ||
        (b.orderId && b.orderId.toLowerCase().includes(q)) ||
        b.movieTitle.toLowerCase().includes(q) ||
        b.cinemaName.toLowerCase().includes(q) ||
        (b.userEmail && b.userEmail.toLowerCase().includes(q)) ||
        b.seatLabels?.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [bookings, statusFilter, searchQuery]);

  const handleUpdateStatus = async (id: string, newStatus: Booking['status']) => {
    await updateBookingStatus(id, newStatus);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#23293b] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Quản Lý Đơn Đặt Vé</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 font-bold border border-blue-600/30">
              {bookings.length} đơn vé
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Tra cứu thông tin khách hàng, rạp chiếu, chỗ ngồi và trạng thái thanh toán
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#181d2a] border border-[#23293b] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        {/* Status Tabs */}
        <div className="flex items-center bg-[#121620] p-1 rounded-xl border border-[#23293b] w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'all' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tất Cả ({bookings.length})
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'confirmed' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Đã Xác Nhận ({bookings.filter((b) => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'cancelled' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Đã Hủy ({bookings.filter((b) => b.status === 'cancelled').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã đơn, phim, ghế, email..."
            className="w-full pl-10 pr-4 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#121620] text-xs uppercase font-bold text-gray-400 border-b border-[#23293b]">
              <tr>
                <th className="px-5 py-3.5">Mã Đơn / Khách Hàng</th>
                <th className="px-4 py-3.5">Phim Chiếu Rạp</th>
                <th className="px-4 py-3.5">Rạp & Suất Chiếu</th>
                <th className="px-4 py-3.5">Ghế & Bắp Nước</th>
                <th className="px-4 py-3.5">Tổng Tiền</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23293b]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    Không tìm thấy đơn vé nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#121620]/60 transition">
                    {/* Code & User */}
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-red-400 text-xs">{b.id}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[150px]">
                        {b.userEmail || b.userName || 'Khách vãng lai'}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {formatDateTime(b.createdAt)}
                      </div>
                    </td>

                    {/* Movie */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-xs truncate max-w-[160px]">{b.movieTitle}</div>
                    </td>

                    {/* Cinema & Showtime */}
                    <td className="px-4 py-3.5 text-xs">
                      <div className="text-gray-300 truncate max-w-[150px]">{b.cinemaName}</div>
                      <div className="text-gray-500 mt-0.5 font-medium">
                        {b.roomName && `${b.roomName} • `}{b.startTime} • {b.date}
                      </div>
                    </td>

                    {/* Seats & Combos */}
                    <td className="px-4 py-3.5 text-xs">
                      <div className="flex flex-wrap gap-1">
                        {b.seatLabels?.map((lbl) => (
                          <span
                            key={lbl}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 text-red-300 border border-red-800"
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>
                      {b.combos && b.combos.length > 0 && (
                        <div className="text-[10px] text-amber-400 mt-1 truncate max-w-[140px]">
                          + {b.combos.map((c) => `${c.quantity}x ${c.name}`).join(', ')}
                        </div>
                      )}
                    </td>

                    {/* Total Price & Payment */}
                    <td className="px-4 py-3.5 text-xs">
                      <div className="font-black text-white">{formatCurrency(b.totalPrice)}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{b.paymentMethod || 'VNPay'}</div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-xs">
                      {b.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Thành công
                        </span>
                      ) : b.status === 'cancelled' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" /> Đã hủy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Chờ xử lý
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition"
                        title="Xem chi tiết đơn vé"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chi Tiết Đơn Đặt Vé */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#23293b]">
              <div>
                <span className="text-xs text-red-400 font-mono font-bold block">
                  MÃ VÉ: {selectedBooking.id}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Chi Tiết Đơn Đặt Vé
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#121620] p-3.5 rounded-xl border border-[#23293b] space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Phim:</span>
                  <span className="font-bold text-white text-right">{selectedBooking.movieTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cụm rạp:</span>
                  <span className="text-gray-200">{selectedBooking.cinemaName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phòng chiếu:</span>
                  <span className="text-gray-200">{selectedBooking.roomName || 'Phòng 01'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Suất chiếu:</span>
                  <span className="text-white font-medium">{selectedBooking.startTime} • {selectedBooking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ghế ngồi:</span>
                  <span className="font-mono font-bold text-red-400">
                    {selectedBooking.seatLabels?.join(', ') || 'N/A'}
                  </span>
                </div>
              </div>

              {selectedBooking.combos && selectedBooking.combos.length > 0 && (
                <div className="bg-[#121620] p-3 rounded-xl border border-[#23293b] space-y-1">
                  <span className="text-gray-400 font-bold block mb-1">Combo bắp nước đã đặt:</span>
                  {selectedBooking.combos.map((c, i) => (
                    <div key={i} className="flex justify-between text-gray-300">
                      <span>{c.quantity}x {c.name}</span>
                      <span>{formatCurrency(c.price * c.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-[#121620] p-3.5 rounded-xl border border-[#23293b] space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Phương thức:</span>
                  <span className="text-white font-medium">{selectedBooking.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#23293b]">
                  <span className="text-gray-300 font-bold">Tổng thanh toán:</span>
                  <span className="text-base font-black text-red-500">
                    {formatCurrency(selectedBooking.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#23293b] gap-2">
              <span className="text-xs text-gray-400">Đổi trạng thái:</span>
              <div className="flex items-center gap-2">
                {selectedBooking.status !== 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Xác Nhận Vé
                  </button>
                )}
                {selectedBooking.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                  >
                    Hủy Vé
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
