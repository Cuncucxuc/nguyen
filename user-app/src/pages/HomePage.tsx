import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Ticket, Popcorn, Gift, Sparkles, ShieldCheck, HeartHandshake, ArrowRight, Zap, Star } from 'lucide-react';
import Banner from '../components/Home/Banner';
import MovieList from '../components/Home/MovieList';
import SearchBar from '../components/Common/SearchBar';
import QuickBookingBar from '../components/Home/QuickBookingBar';
import ComboModal from '../components/Home/ComboModal';
import RewardsModal from '../components/Home/RewardsModal';
import { movies as initialMovies } from '../data/mockData';
import { subscribeMovies } from '../firebase/movieService';
import { useAuth } from '../context/AuthContext';
import { normalizeVietnamese } from '../utils';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState(initialMovies);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Tất cả');

  // Lắng nghe cập nhật phim từ Firebase Firestore theo thời gian thực
  useEffect(() => {
    const unsubscribe = subscribeMovies((data) => {
      if (data && data.length > 0) {
        setMovies(data);
      }
    });
    return () => unsubscribe();
  }, []);

  // Quản lý Modal cho 3 chức năng
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const quickBookRef = useRef<HTMLDivElement | null>(null);

  const scrollToQuickBook = () => {
    quickBookRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Danh sách thể loại nổi bật
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    movies.forEach((m) => {
      m.genre?.forEach((g) => genreSet.add(g));
    });
    return ['Tất cả', ...Array.from(genreSet)];
  }, [movies]);

  // Lọc phim theo tìm kiếm và thể loại
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchSearch =
        !searchQuery.trim() ||
        normalizeVietnamese(movie.title).includes(normalizeVietnamese(searchQuery)) ||
        movie.genre?.some((g) =>
          normalizeVietnamese(g).includes(normalizeVietnamese(searchQuery))
        ) ||
        (movie.director &&
          normalizeVietnamese(movie.director).includes(normalizeVietnamese(searchQuery))) ||
        movie.cast?.some((c) =>
          normalizeVietnamese(c).includes(normalizeVietnamese(searchQuery))
        );

      const matchGenre =
        selectedGenre === 'Tất cả' || movie.genre?.includes(selectedGenre);

      return matchSearch && matchGenre;
    });
  }, [movies, searchQuery, selectedGenre]);

  // Phim đang chiếu & phim sắp chiếu
  const nowShowingMovies = useMemo(
    () => filteredMovies.filter((m) => m.status === 'now_showing'),
    [filteredMovies]
  );

  const comingSoonMovies = useMemo(
    () => filteredMovies.filter((m) => m.status === 'coming_soon'),
    [filteredMovies]
  );

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* 1. Hero Banner Carousel */}
      <Banner movies={movies} />

      {/* 2. Search & Quick Booking Bar Section */}
      <section className="relative -mt-7 sm:-mt-8 z-30 px-4 max-w-7xl mx-auto space-y-4">
        {/* Search & Genre Filter */}
        <div className="bg-gray-900/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-gray-800 shadow-2xl space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm theo tên phim, thể loại, đạo diễn..."
            onClear={() => setSearchQuery('')}
          />

          {/* Quick Genre Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap pl-1">
              Thể loại:
            </span>
            {allGenres.slice(0, 10).map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedGenre === genre
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/50'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Thanh Đặt Vé Nhanh (Quick Booking Bar) */}
        <div ref={quickBookRef} id="quick-book" className="scroll-mt-24">
          <QuickBookingBar />
        </div>
      </section>

      {/* 3. Movie Lists */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
        {hasSearch ? (
          /* Khi người dùng gõ tìm kiếm, hiển thị kết quả tìm kiếm */
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Kết Quả Tìm Kiếm ({filteredMovies.length} phim)
                </h2>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('Tất cả');
                }}
                className="text-xs text-gray-400 hover:text-red-400 underline"
              >
                Đặt lại bộ lọc
              </button>
            </div>
            <MovieList title="" movies={filteredMovies} showAll={true} />
          </section>
        ) : (
          /* Khi không tìm kiếm, hiển thị 2 section theo yêu cầu */
          <>
            {/* Phim Đang Chiếu */}
            <section id="movies" className="scroll-mt-20">
              <MovieList
                title="Phim Đang Chiếu"
                movies={nowShowingMovies}
                showAll={false}
                viewAllLink="#movies"
              />
            </section>

            {/* Phim Sắp Chiếu */}
            <section id="coming-soon" className="scroll-mt-20">
              <MovieList
                title="Phim Sắp Chiếu"
                movies={comingSoonMovies}
                showAll={false}
                viewAllLink="#coming-soon"
              />
            </section>
          </>
        )}
      </div>

      {/* 4. Ba Chức Năng Nổi Bật Tương Tác Trực Tiếp (Interactive Features) */}
      <section className="border-t border-gray-800/80 bg-gradient-to-b from-gray-900/40 via-gray-950 to-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Tiện Ích Độc Quyền</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Trải Nghiệm Điện Ảnh Đỉnh Cao
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Bấm vào từng tính năng bên dưới để trải nghiệm đặt vé nhanh, xem thực đơn bắp nước hoặc đổi điểm thưởng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Chức năng 1: Đặt vé nhanh chóng */}
            <div
              onClick={scrollToQuickBook}
              className="bg-gray-900/90 hover:bg-gray-850 p-6 sm:p-8 rounded-2xl border border-gray-800 hover:border-red-600/60 transition-all duration-300 group cursor-pointer shadow-xl hover:shadow-red-600/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <Ticket className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-red-400 bg-red-600/10 border border-red-600/20 px-2.5 py-1 rounded-full">
                    3 Bước Giữ Ghế
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                  Đặt Vé Nhanh Chóng
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Chỉ 3 bước đơn giản: Chọn phim, chọn rạp chiếu và giữ ngay vị trí ghế ngồi yêu thích mà không phải xếp hàng chờ đợi.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-bold text-red-500 group-hover:text-red-400">
                <span>Đặt vé nhanh ngay</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Chức năng 2: Combo hấp dẫn */}
            <div
              onClick={() => setIsComboModalOpen(true)}
              className="bg-gray-900/90 hover:bg-gray-850 p-6 sm:p-8 rounded-2xl border border-gray-800 hover:border-amber-500/60 transition-all duration-300 group cursor-pointer shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 shadow-inner">
                    <Popcorn className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    Ưu đãi -30%
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  Combo Hấp Dẫn
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Bắp rang bơ nóng hổi thơm giòn kết hợp nước ngọt mát lạnh với mức giá ưu đãi tiết kiệm tới 30% khi đặt trước trực tuyến.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                <span>Xem thực đơn bắp nước</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Chức năng 3: Tích điểm thưởng */}
            <div
              onClick={() => setIsRewardsModalOpen(true)}
              className="bg-gray-900/90 hover:bg-gray-850 p-6 sm:p-8 rounded-2xl border border-gray-800 hover:border-yellow-400/60 transition-all duration-300 group cursor-pointer shadow-xl hover:shadow-yellow-400/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 group-hover:bg-yellow-400 group-hover:text-black transition-all duration-300 shadow-inner">
                    <Gift className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    <span>{user?.points || 0} điểm</span>
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  Tích Điểm Thưởng
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Tích lũy điểm thưởng trên mỗi giao dịch để thăng hạng thành viên, đổi vé xem phim miễn phí và nhận quà tặng sinh nhật bất ngờ.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs font-bold text-yellow-400 group-hover:text-yellow-300">
                <span>Xem quà & Đổi điểm</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Bottom Trust Badges */}
          <div className="mt-12 pt-8 border-t border-gray-800/60 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-gray-400 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Thanh toán bảo mật SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-red-400" />
              <span>Nhận vé điện tử tức thì qua QR</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-yellow-400" />
              <span>Hỗ trợ khách hàng 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popups & Modals */}
      <ComboModal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
      />

      <RewardsModal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
