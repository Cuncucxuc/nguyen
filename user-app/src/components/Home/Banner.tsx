import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../../types';
import { getAgeRatingInfo } from '../../utils';

interface BannerProps {
  movies: Movie[];
}

const SLIDE_DURATION = 4000; // 4 giây tự động chuyển slide

export const Banner: React.FC<BannerProps> = ({ movies }) => {
  // Lấy danh sách phim đang chiếu để làm banner giới thiệu
  const displayMovies = React.useMemo(() => {
    const nowShowing = movies.filter((m) => m.status === 'now_showing');
    return (nowShowing.length > 0 ? nowShowing : movies).slice(0, 6);
  }, [movies]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    if (displayMovies.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % displayMovies.length);
  }, [displayMovies.length]);

  const prevSlide = useCallback(() => {
    if (displayMovies.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + displayMovies.length) % displayMovies.length);
  }, [displayMovies.length]);

  // Tự động chuyển động slide liên tục
  useEffect(() => {
    if (displayMovies.length <= 1) return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, displayMovies.length, nextSlide]);

  if (!displayMovies.length) {
    return null;
  }

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] md:h-[560px] overflow-hidden bg-black select-none group">
      {/* Track trượt ngang mượt mà (Horizontal Sliding Track) */}
      <div
        className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayMovies.map((movie, index) => {
          const isActive = index === currentIndex;

          return (
            <div key={movie.id} className="w-full flex-shrink-0 h-full relative overflow-hidden">
              {/* Hình nền Poster với hiệu ứng Zoom điện ảnh (Ken Burns Effect) */}
              <div
                className={`absolute inset-0 bg-cover bg-center filter brightness-60 transition-transform duration-[4000ms] ease-out ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
                style={{ backgroundImage: `url(${movie.poster})` }}
              />

              {/* Lớp phủ Gradient đen điện ảnh */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 to-transparent" />

              {/* Nội dung thông tin phim */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center z-10">
                <div
                  className={`max-w-2xl space-y-3 md:space-y-4 transition-all duration-700 delay-100 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  {/* Nhãn Độ tuổi & Định dạng phòng chiếu */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold tracking-wider uppercase shadow-sm ${getAgeRatingInfo(
                        movie.ageRating
                      ).bg}`}
                    >
                      {movie.ageRating || 'P'}
                    </span>
                    {movie.format?.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-800/80 text-gray-200 border border-gray-700"
                      >
                        {fmt}
                      </span>
                    ))}
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                      Đang Chiếu
                    </span>
                  </div>

                  {/* Tên phim nổi bật */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-wide drop-shadow-lg line-clamp-2">
                    {movie.title}
                  </h1>

                  {/* Điểm đánh giá sao vàng & Thời lượng */}
                  <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-yellow-500/30 shadow-sm">
                      <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 font-bold">
                        {movie.rating?.toFixed(1) || '8.5'}
                      </span>
                      <span className="text-gray-400 text-xs">/10</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{movie.duration} phút</span>
                    </div>

                    {movie.language && (
                      <span className="hidden sm:inline-block text-gray-400 text-sm">
                        • {movie.language}
                      </span>
                    )}
                  </div>

                  {/* Thể loại phim */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {movie.genre?.slice(0, 4).map((g) => (
                      <span
                        key={g}
                        className="text-xs text-gray-200 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Tóm tắt nội dung */}
                  <p className="text-gray-300 text-xs sm:text-sm md:text-base line-clamp-2 max-w-xl drop-shadow">
                    {movie.description}
                  </p>

                  {/* Các nút hành động */}
                  <div className="flex items-center gap-3 pt-3">
                    <Link
                      to={`/dat-ve/${movie.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-xl shadow-red-600/40 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Ticket className="w-5 h-5" />
                      <span>Đặt Vé Ngay</span>
                    </Link>
                    <Link
                      to={`/phim/${movie.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-600 hover:border-gray-300 text-gray-200 hover:text-white font-semibold text-sm sm:text-base bg-black/40 backdrop-blur-md hover:bg-white/10 transition-all duration-200"
                    >
                      <Info className="w-5 h-5" />
                      <span>Chi Tiết</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nút mũi tên chuyển slide thủ công (hiện khi hover hoặc bấm trực tiếp) */}
      {displayMovies.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-red-600 text-white/80 hover:text-white border border-gray-700/80 transition-all opacity-70 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-red-600 text-white/80 hover:text-white border border-gray-700/80 transition-all opacity-70 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

    </div>
  );
};

export default Banner;
