import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Film, Ticket, ChevronDown, ChevronUp, Navigation } from 'lucide-react';
import { cinemas, movies as defaultMovies, showtimeDates } from '../data/mockData';
import { subscribeMovies } from '../firebase/movieService';
import { getShowtimesForMovie } from '../utils/showtimeGenerator';
import { isShowtimePast } from '../utils';

export const CinemasPage: React.FC = () => {
  const [allMovies, setAllMovies] = useState(defaultMovies);
  const [expandedCinemaId, setExpandedCinemaId] = useState<string | null>(cinemas[0]?.id || null);
  const [selectedDate, setSelectedDate] = useState<string>(showtimeDates[0] || '2026-10-18');

  // Lắng nghe realtime danh sách phim mới nhất từ Firebase
  useEffect(() => {
    const unsub = subscribeMovies((data) => {
      if (data && data.length > 0) setAllMovies(data);
    });
    return () => unsub();
  }, []);

  const dates = showtimeDates;

  const toggleCinema = (cinemaId: string) => {
    setExpandedCinemaId(expandedCinemaId === cinemaId ? null : cinemaId);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Title */}
        <div className="border-b border-gray-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Hệ Thống Rạp Chiếu Toàn Quốc</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
            Cụm Rạp Chiếu Phim
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Trải nghiệm công nghệ chiếu phim đỉnh cao với hệ thống phòng chiếu hiện đại bậc nhất
          </p>
        </div>

        {/* Date Selector for Showtimes */}
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="font-semibold">Chọn ngày xem lịch chiếu:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
            {dates.map((d, idx) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDate === d
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {idx === 0 ? 'Hôm Nay' : d.split('-').slice(1).join('/')}
              </button>
            ))}
          </div>
        </div>

        {/* Cinema List Cards */}
        <div className="space-y-6">
          {cinemas.map((cinema) => {
            const isExpanded = expandedCinemaId === cinema.id;

            // Lấy danh sách phim đang chiếu và lọc suất chiếu của rạp này theo ngày (kể cả phim mới thêm từ Admin)
            const nowShowing = allMovies.filter((m) => m.status === 'now_showing');
            const moviesInCinema = nowShowing
              .map((movieObj) => {
                const mShowtimes = getShowtimesForMovie(movieObj.id, cinemas).filter(
                  (s) => s.cinemaId === cinema.id && s.date === selectedDate
                );
                return { movie: movieObj, showtimes: mShowtimes };
              })
              .filter((item) => item.showtimes.length > 0);

            return (
              <div
                key={cinema.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-gray-700"
              >
                {/* Cinema Overview Header */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                  {/* Photo Thumbnail */}
                  <div className="md:col-span-4 h-48 md:h-56 rounded-xl overflow-hidden relative group">
                    <img
                      src={cinema.image}
                      alt={cinema.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-red-600 text-white text-[11px] font-bold rounded-lg shadow">
                      Đang Mở Cửa
                    </span>
                  </div>

                  {/* Cinema Details */}
                  <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        {cinema.name}
                      </h2>

                      <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                        <p className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{cinema.address}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>Hotline đặt vé: <strong className="text-white">1900 6017</strong></span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>Giờ hoạt động: 08:00 - 24:00 (Tất cả các ngày trong tuần)</span>
                        </p>
                      </div>

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-2 pt-3">
                        <span className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-semibold border border-gray-700">
                          IMAX Laser
                        </span>
                        <span className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-semibold border border-gray-700">
                          Dolby Atmos 7.1
                        </span>
                        <span className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-semibold border border-gray-700">
                          Ghế VIP Gold Class
                        </span>
                        <span className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-semibold border border-gray-700">
                          Bãi đỗ xe ô tô
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(cinema.name + ' ' + cinema.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-red-500" />
                        <span>Xem bản đồ đường đi</span>
                      </a>

                      <button
                        onClick={() => toggleCinema(cinema.id)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs sm:text-sm font-bold border border-red-600/30 transition-all"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>{isExpanded ? 'Ẩn Lịch Chiếu' : 'Xem Lịch Chiếu Rạp Này'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Showtimes Section */}
                {isExpanded && (
                  <div className="bg-gray-950/80 border-t border-gray-800 p-6 space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Film className="w-4 h-4 text-red-500" />
                        <span>Lịch Chiếu Phim Ngày {selectedDate}</span>
                      </h3>
                      <span className="text-xs text-gray-400">
                        {moviesInCinema.length} bộ phim đang có suất chiếu
                      </span>
                    </div>

                    {moviesInCinema.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-xs">
                        Rạp chưa mở suất chiếu cho ngày này, vui lòng chọn ngày khác.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {moviesInCinema.map(({ movie, showtimes: mShowtimes }) => {
                          if (!movie) return null;

                          return (
                            <div
                              key={movie.id}
                              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between md:items-center"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={movie.poster}
                                  alt={movie.title}
                                  className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                                <div>
                                  <Link
                                    to={`/phim/${movie.id}`}
                                    className="font-bold text-sm sm:text-base text-white hover:text-red-400 transition-colors"
                                  >
                                    {movie.title}
                                  </Link>
                                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                    <span className="px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 font-bold text-[10px]">
                                      {movie.ageRating}
                                    </span>
                                    <span>{movie.duration} phút</span>
                                    <span>• {movie.genre.slice(0, 2).join(', ')}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Suất chiếu buttons */}
                              <div className="flex flex-wrap items-center gap-2">
                                {mShowtimes.map((st) => {
                                  const isPast = isShowtimePast(st.date || selectedDate, st.startTime);
                                  if (isPast) {
                                    return (
                                      <div
                                        key={st.id}
                                        title="Suất chiếu đã qua giờ bắt đầu, không thể đặt vé"
                                        className="px-3.5 py-2 rounded-xl bg-gray-900/40 border border-gray-800 text-gray-500 text-xs font-bold opacity-40 cursor-not-allowed flex flex-col items-center select-none shadow-none"
                                      >
                                        <span className="line-through">{st.startTime}</span>
                                        <span className="text-[10px] text-red-400/90 font-normal mt-0.5">
                                          Đã qua giờ
                                        </span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <Link
                                      key={st.id}
                                      to={`/dat-ve/${movie.id}?showtimeId=${st.id}`}
                                      className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-red-600 hover:text-white border border-gray-700 hover:border-red-600 text-gray-200 text-xs font-bold transition-all shadow-sm flex flex-col items-center"
                                    >
                                      <span>{st.startTime}</span>
                                      <span className="text-[10px] text-gray-400 hover:text-white font-normal mt-0.5">
                                        {st.roomType}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CinemasPage;
