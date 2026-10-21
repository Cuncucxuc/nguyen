import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  Ticket,
  Play,
  Film,
  User,
  MapPin,
  ChevronRight,
  Share2,
  Heart,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { Movie } from '../types';
import { movies, cinemas, showtimes } from '../data/mockData';
import { getMovieByIdFromFirestore } from '../firebase/movieService';
import { getShowtimesForMovie } from '../utils/showtimeGenerator';
import { getAgeRatingInfo, formatDateLabel, formatCurrency } from '../utils';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Active Tab state: 'noi-dung' | 'dien-vien' | 'lich-chieu'
  const [activeTab, setActiveTab] = useState<'noi-dung' | 'dien-vien' | 'lich-chieu'>('lich-chieu');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [showTrailerModal, setShowTrailerModal] = useState<boolean>(false);

  // Tìm phim theo ID (kết hợp cache tĩnh và Firestore)
  const [movie, setMovie] = useState<Movie | undefined>(() => movies.find((m) => m.id === id));

  useEffect(() => {
    if (id) {
      getMovieByIdFromFirestore(id).then((m) => {
        if (m) setMovie(m);
      });
    }
  }, [id]);

  // Lọc lịch chiếu của phim này (kết hợp cả phim tĩnh và phim mới thêm từ Admin)
  const movieShowtimes = useMemo(() => {
    if (!movie) return [];
    return getShowtimesForMovie(movie.id, cinemas);
  }, [movie]);

  // Danh sách các ngày chiếu có sẵn
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(movieShowtimes.map((st: any) => st.date))).sort();
    return dates;
  }, [movieShowtimes]);

  // Thiết lập ngày mặc định
  React.useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Nhóm lịch chiếu theo rạp cho ngày đã chọn
  const showtimesByCinema = useMemo(() => {
    if (!selectedDate) return [];

    const filtered = movieShowtimes.filter((st: any) => st.date === selectedDate);
    const cinemaMap = new Map<string, { cinema: any; list: any[] }>();

    filtered.forEach((st: any) => {
      const cId = st.cinemaId;
      const cinemaObj = cinemas?.find((c: any) => c.id === cId) || {
        id: cId,
        name: st.cinemaName || 'Rạp Chiếu Phim StarCinema',
        address: 'Tầng 4, TTTM Vincom Center',
      };

      if (!cinemaMap.has(cId)) {
        cinemaMap.set(cId, { cinema: cinemaObj, list: [] });
      }
      cinemaMap.get(cId)!.list.push(st);
    });

    return Array.from(cinemaMap.values());
  }, [movieShowtimes, selectedDate]);

  // Chuyển đổi trailer URL sang dạng YouTube Embed
  const embedTrailerUrl = useMemo(() => {
    if (!movie?.trailer) return null;
    const url = movie.trailer;
    if (url.includes('youtube.com/embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : url;
  }, [movie]);

  // 404 - Movie Not Found
  if (!movie) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#0f0f0f] px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-red-600/10 flex items-center justify-center text-red-500 mb-6 border border-red-600/20">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Không Tìm Thấy Phim</h1>
        <p className="text-gray-400 max-w-md mb-8">
          Rất tiếc, bộ phim bạn đang tìm kiếm không tồn tại hoặc đã ngừng công chiếu.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-lg shadow-red-600/30"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>
    );
  }

  const ageBadge = getAgeRatingInfo(movie.ageRating);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* 1. Hero Backdrop & Movie Info Header */}
      <div className="relative w-full overflow-hidden bg-black">
        {/* Blurred Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${movie.poster})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-black/60" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pb-16">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <Link to="/#movies" className="hover:text-white transition-colors">
              Phim
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <span className="text-gray-200 font-medium truncate max-w-[200px] sm:max-w-xs">
              {movie.title}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
            {/* Left: Movie Poster (300px wide) */}
            <div className="w-64 sm:w-72 md:w-[300px] flex-shrink-0 group">
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-gray-800">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Age rating in poster */}
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-bold tracking-wider uppercase shadow-lg ${ageBadge.bg}`}
                >
                  {movie.ageRating || 'P'}
                </span>

                {/* Trailer Play Overlay Button */}
                {movie.trailer && (
                  <button
                    onClick={() => setShowTrailerModal(true)}
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all group-hover:scale-100"
                    aria-label="Xem trailer"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-white translate-x-0.5" />
                    </div>
                  </button>
                )}
              </div>

              {/* Quick Actions below poster */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                    isLiked
                      ? 'border-red-500 bg-red-500/10 text-red-500'
                      : 'border-gray-800 bg-gray-900/60 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                  <span>{isLiked ? 'Đã Thích' : 'Yêu Thích'}</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Đã sao chép liên kết phim vào bộ nhớ tạm!');
                  }}
                  className="p-2.5 rounded-xl border border-gray-800 bg-gray-900/60 text-gray-300 hover:text-white hover:border-gray-700 transition-all"
                  title="Chia sẻ phim"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Movie Info & Main Booking Button */}
            <div className="flex-1 space-y-5 text-center md:text-left">
              {/* Title & Format badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold tracking-wider uppercase ${ageBadge.bg}`}
                  >
                    {movie.ageRating || 'P'}
                  </span>
                  {movie.format?.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-800/80 text-gray-200 border border-gray-700"
                    >
                      {fmt}
                    </span>
                  ))}
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                      movie.status === 'now_showing'
                        ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {movie.status === 'now_showing' ? 'Đang Chiếu' : 'Sắp Chiếu'}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-wide">
                  {movie.title}
                </h1>
              </div>

              {/* Rating, Duration & Release Date */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-sm sm:text-base">
                <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-bold text-lg">
                    {movie.rating?.toFixed(1) || '8.5'}
                  </span>
                  <span className="text-gray-400 text-xs">/10</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{movie.duration} phút</span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Khởi chiếu: {movie.releaseDate}</span>
                </div>
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                {movie.genre?.map((g) => (
                  <span
                    key={g}
                    className="bg-red-600/20 text-red-400 border border-red-600/30 rounded-full px-3.5 py-1 text-xs sm:text-sm font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Description preview */}
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-3 max-w-3xl">
                {movie.description}
              </p>

              {/* Prominent Booking Action Button */}
              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Link
                  to={`/dat-ve/${movie.id}`}
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base sm:text-lg transition-all duration-200 shadow-xl shadow-red-600/40 transform hover:-translate-y-0.5"
                >
                  <Ticket className="w-5 h-5" />
                  <span>Đặt Vé Ngay</span>
                </Link>

                {movie.trailer && (
                  <button
                    onClick={() => setShowTrailerModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-700 bg-gray-900/80 hover:bg-gray-800 text-gray-200 hover:text-white font-semibold text-base transition-all"
                  >
                    <Play className="w-5 h-5 text-red-500 fill-red-500" />
                    <span>Xem Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Tabs Header */}
        <div className="flex items-center border-b border-gray-800 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('lich-chieu')}
            className={`pb-4 px-6 text-base sm:text-lg font-bold tracking-wide transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'lich-chieu'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Lịch Chiếu
          </button>
          <button
            onClick={() => setActiveTab('noi-dung')}
            className={`pb-4 px-6 text-base sm:text-lg font-bold tracking-wide transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'noi-dung'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Nội Dung Phim
          </button>
          <button
            onClick={() => setActiveTab('dien-vien')}
            className={`pb-4 px-6 text-base sm:text-lg font-bold tracking-wide transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'dien-vien'
                ? 'border-red-600 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Diễn Viên & Đạo Diễn
          </button>
        </div>

        {/* Tab 1: Lịch Chiếu (Showtimes) */}
        {activeTab === 'lich-chieu' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Date Selector Tabs */}
            {availableDates.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Chọn Ngày Xem
                </h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {availableDates.map((dateStr) => {
                    const isSelected = selectedDate === dateStr;
                    const { dayOfWeek, dateNum } = formatDateLabel(dateStr);
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex flex-col items-center justify-center min-w-[90px] py-3 px-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-medium">{dayOfWeek}</span>
                        <span className="text-base sm:text-lg font-bold mt-0.5">{dateNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/60 p-8 rounded-2xl border border-gray-800 text-center text-gray-400">
                Phim hiện chưa có lịch chiếu cho các ngày tới. Vui lòng quay lại sau!
              </div>
            )}

            {/* Cinema List and Showtimes for Selected Date */}
            {showtimesByCinema.length > 0 ? (
              <div className="space-y-6">
                {showtimesByCinema.map(({ cinema, list }) => (
                  <div
                    key={cinema.id}
                    className="bg-gray-900/80 rounded-2xl border border-gray-800 p-5 sm:p-6 space-y-4 shadow-lg"
                  >
                    {/* Cinema Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-800/80">
                      <div>
                        <h4 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <span>{cinema.name}</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 pl-7">
                          {cinema.address || 'Hệ thống rạp chiếu chuẩn quốc tế'}
                        </p>
                      </div>
                    </div>

                    {/* Showtime Slots Grid */}
                    <div className="pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {list.map((st: any) => (
                          // showtimeId được BookingPage đọc qua useSearchParams để tự chọn suất chiếu
                          <Link
                            key={st.id}
                            to={`/dat-ve/${movie.id}?showtimeId=${st.id}`}
                            className="group/slot flex flex-col items-center justify-center p-3 rounded-xl bg-gray-800/90 hover:bg-red-600 border border-gray-700/80 hover:border-red-500 transition-all duration-200 text-center shadow-md hover:shadow-red-600/30"
                          >
                            <span className="text-base sm:text-lg font-bold text-white group-hover/slot:text-white">
                              {st.startTime}
                            </span>
                            <span className="text-[11px] text-gray-400 group-hover/slot:text-red-100 font-medium mt-0.5">
                              {st.format || st.roomType || '2D Phụ đề'}
                            </span>
                            <span className="text-xs text-yellow-400 group-hover/slot:text-white font-semibold mt-1">
                              {formatCurrency(
                                typeof st.price === 'number'
                                  ? st.price
                                  : st.price?.standard || 85000
                              )}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              selectedDate && (
                <div className="bg-gray-900/40 p-8 rounded-2xl border border-gray-800 text-center text-gray-400">
                  Không có suất chiếu nào trong ngày đã chọn.
                </div>
              )
            )}
          </div>
        )}

        {/* Tab 2: Nội Dung Phim (Storyline & Specs) */}
        {activeTab === 'noi-dung' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl">
            {/* Story Synopsis */}
            <div className="bg-gray-900/60 p-6 sm:p-8 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <span>Tóm Tắt Nội Dung</span>
              </h3>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                {movie.description}
              </p>
            </div>

            {/* Specifications Card */}
            <div className="bg-gray-900/60 p-6 sm:p-8 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Thông Tin Chi Tiết</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm sm:text-base">
                <div className="flex border-b border-gray-800/80 pb-2">
                  <span className="w-36 text-gray-400">Đạo diễn:</span>
                  <span className="text-white font-medium">{movie.director || 'Đang cập nhật'}</span>
                </div>

                <div className="flex border-b border-gray-800/80 pb-2">
                  <span className="w-36 text-gray-400">Thời lượng:</span>
                  <span className="text-white font-medium">{movie.duration} phút</span>
                </div>

                <div className="flex border-b border-gray-800/80 pb-2">
                  <span className="w-36 text-gray-400">Ngôn ngữ:</span>
                  <span className="text-white font-medium">{movie.language || 'Tiếng Việt'}</span>
                </div>

                <div className="flex border-b border-gray-800/80 pb-2">
                  <span className="w-36 text-gray-400">Khởi chiếu:</span>
                  <span className="text-white font-medium">{movie.releaseDate}</span>
                </div>

                <div className="flex border-b border-gray-800/80 pb-2">
                  <span className="w-36 text-gray-400">Định dạng:</span>
                  <span className="text-white font-medium">
                    {movie.format?.join(', ') || '2D'}
                  </span>
                </div>

                <div className="flex border-b border-gray-800/80 pb-2">
                  <span className="w-36 text-gray-400">Độ tuổi:</span>
                  <span className="text-white font-medium">{ageBadge.desc}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Diễn Viên & Đạo Diễn */}
        {activeTab === 'dien-vien' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Director Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-red-500" />
                <span>Đạo Diễn</span>
              </h3>
              <div className="inline-flex items-center gap-4 bg-gray-900/80 border border-gray-800 px-5 py-3 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-lg">
                  {movie.director ? movie.director.charAt(0) : 'D'}
                </div>
                <div>
                  <h4 className="text-white font-bold">{movie.director || 'Chưa cập nhật'}</h4>
                  <p className="text-xs text-gray-400">Đạo diễn chính</p>
                </div>
              </div>
            </div>

            {/* Cast List Section */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-500" />
                <span>Diễn Viên Tham Gia</span>
              </h3>

              {movie.cast && movie.cast.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-900/80 border border-gray-800 hover:border-gray-700 p-4 rounded-xl flex flex-col items-center text-center transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-800 group-hover:bg-red-600/20 flex items-center justify-center text-gray-300 group-hover:text-red-400 text-xl font-bold mb-3 transition-colors border border-gray-700">
                        {actor.trim().charAt(0)}
                      </div>
                      <h4 className="text-sm font-semibold text-white line-clamp-1">{actor}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Diễn viên</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Danh sách diễn viên đang được cập nhật.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. Trailer Section Embedded */}
        {movie.trailer && (
          <section className="mt-16 pt-10 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-red-600 rounded-full" />
              <h2 className="text-2xl font-bold text-white tracking-wide">Trailer Chính Thức</h2>
            </div>

            <div className="max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden border border-gray-800 bg-black shadow-2xl">
              {embedTrailerUrl ? (
                <iframe
                  src={embedTrailerUrl.replace('autoplay=1', 'autoplay=0')}
                  title={`Trailer ${movie.title}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <Play className="w-16 h-16 mb-2 opacity-50" />
                  <p>Không thể tải video trailer</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Modal Popup Trailer (when clicking play button) */}
      {showTrailerModal && embedTrailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white hover:bg-red-600 flex items-center justify-center transition-all font-bold"
              aria-label="Đóng trailer"
            >
              ✕
            </button>
            <iframe
              src={embedTrailerUrl}
              title={`Trailer ${movie.title}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailPage;
