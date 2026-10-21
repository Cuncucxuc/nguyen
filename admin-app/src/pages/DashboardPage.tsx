import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Ticket,
  Film,
  Building2,
  Calendar,
  Clock,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { subscribeBookings, subscribeMovies, subscribeCinemas } from '../firebase/adminService';
import { Movie, Booking, Cinema } from '../types';
import { formatCurrency, formatDateTime } from '../utils';

export const DashboardPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubMovies = subscribeMovies((data) => {
      setMovies(data);
      setIsLoading(false);
    });

    const unsubBookings = subscribeBookings((data) => {
      setBookings(data);
    });

    const unsubCinemas = subscribeCinemas((data) => {
      setCinemas(data);
    });

    return () => {
      unsubMovies();
      unsubBookings();
      unsubCinemas();
    };
  }, []);

  // Tính toán các chỉ số thống kê
  const stats = useMemo(() => {
    const validBookings = bookings.filter((b) => b.status !== 'cancelled');
    const totalRevenue = validBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const nowShowingCount = movies.filter((m) => m.status === 'now_showing').length;
    const comingSoonCount = movies.filter((m) => m.status === 'coming_soon').length;

    // Doanh thu vé hôm nay
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayBookings = validBookings.filter((b) => (b.createdAt || '').startsWith(todayStr));
    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return {
      totalRevenue,
      todayRevenue,
      totalBookings: bookings.length,
      confirmedBookings: validBookings.length,
      totalMovies: movies.length,
      nowShowingCount,
      comingSoonCount,
      totalCinemas: cinemas.length,
    };
  }, [movies, bookings, cinemas]);

  const recentBookings = bookings.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Top Banner Greetings */}
      <div className="bg-gradient-to-r from-red-950/40 via-[#181d2a] to-[#181d2a] border border-[#23293b] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ Thống Trực Tuyến Sẵn Sàng</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            Chào mừng trở lại, Quản Trị Viên!
          </h2>
          <p className="text-gray-400 text-sm max-w-xl">
            Tất cả dữ liệu phim, suất chiếu và đơn đặt vé trên Firebase Firestore đều được cập nhật thời gian thực.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Phim Mới</span>
          </Link>
          <Link
            to="/bookings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-sm border border-gray-700 transition"
          >
            <Ticket className="w-4 h-4" />
            <span>Xem Đơn Vé ({bookings.length})</span>
          </Link>
        </div>
      </div>

      {/* 4 Thẻ Thống Kê Chính (Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Doanh thu tổng */}
        <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Tổng Doanh Thu
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">
                +{formatCurrency(stats.todayRevenue)}
              </span>
              <span>ghi nhận trong ngày</span>
            </div>
          </div>
        </div>

        {/* Tổng số vé đặt */}
        <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Đơn Đặt Vé
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats.totalBookings} <span className="text-sm font-normal text-gray-400">đơn</span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              <span className="text-blue-400 font-semibold">{stats.confirmedBookings} đơn</span> thành công trên hệ thống
            </div>
          </div>
        </div>

        {/* Kho Phim */}
        <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Kho Phim Chiếu
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats.totalMovies} <span className="text-sm font-normal text-gray-400">bộ phim</span>
            </div>
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
              <span className="text-emerald-400 font-medium">{stats.nowShowingCount} đang chiếu</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">{stats.comingSoonCount} sắp chiếu</span>
            </div>
          </div>
        </div>

        {/* Cụm rạp */}
        <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Cụm Rạp Chiếu
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stats.totalCinemas} <span className="text-sm font-normal text-gray-400">cụm rạp</span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Khu vực TP. Hồ Chí Minh & Toàn quốc
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Đơn Đặt Vé Gần Đây & Danh Sách Phim Nổi Bật */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bảng Đơn đặt vé gần đây (2 cột) */}
        <div className="lg:col-span-2 bg-[#181d2a] border border-[#23293b] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Đơn Đặt Vé Mới Nhất</h3>
              <p className="text-xs text-gray-400">Danh sách vé được khách hàng đặt gần đây</p>
            </div>
            <Link
              to="/bookings"
              className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition"
            >
              <span>Xem tất cả</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#121620] text-xs uppercase font-bold text-gray-400 border-b border-[#23293b]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Mã Đơn / Phim</th>
                  <th className="px-4 py-3">Rạp / Suất</th>
                  <th className="px-4 py-3">Ghế Ngồi</th>
                  <th className="px-4 py-3">Tổng Tiền</th>
                  <th className="px-4 py-3 rounded-r-lg">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23293b]">
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Chưa có đơn đặt vé nào trên hệ thống
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#121620]/60 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-xs">{b.id}</div>
                        <div className="text-gray-400 text-xs truncate max-w-[160px]">{b.movieTitle}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <div className="text-gray-300 truncate max-w-[140px]">{b.cinemaName}</div>
                        <div className="text-gray-500">{b.startTime} • {b.date}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-red-400 font-semibold">
                        {b.seatLabels?.join(', ') || 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-bold text-white">
                        {formatCurrency(b.totalPrice)}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {b.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Đã xác nhận
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Danh sách phim đang chiếu tiêu biểu (1 cột) */}
        <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Phim Đang Chiếu</h3>
              <p className="text-xs text-gray-400">Các tựa phim bom tấn nổi bật</p>
            </div>
            <Link
              to="/movies"
              className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition"
            >
              <span>Xem tất cả</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {movies.filter((m) => m.status === 'now_showing').slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#121620] border border-[#23293b] hover:border-gray-700 transition"
              >
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{m.title}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{m.genre?.slice(0, 2).join(', ')}</div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-yellow-400 font-semibold">
                    <span>★ {m.rating}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">{m.duration} phút</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
