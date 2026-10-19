import React, { useState, useMemo } from 'react';
import { Film, Search } from 'lucide-react';
import MovieCard from '../components/Home/MovieCard';
import { movies } from '../data/mockData';
import { normalizeVietnamese } from '../utils';

export const MoviesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'now_showing' | 'coming_soon'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Tất cả');
  const [selectedFormat, setSelectedFormat] = useState<string>('Tất cả');

  // Danh sách thể loại
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    movies.forEach((m) => m.genre?.forEach((g) => genreSet.add(g)));
    return ['Tất cả', ...Array.from(genreSet)];
  }, []);

  // Lọc phim
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Lọc theo tab trạng thái
      if (activeTab === 'now_showing' && movie.status !== 'now_showing') return false;
      if (activeTab === 'coming_soon' && movie.status !== 'coming_soon') return false;

      // Lọc theo từ khóa tìm kiếm
      const matchSearch =
        !searchQuery.trim() ||
        normalizeVietnamese(movie.title).includes(normalizeVietnamese(searchQuery)) ||
        movie.genre?.some((g) => normalizeVietnamese(g).includes(normalizeVietnamese(searchQuery))) ||
        (movie.director && normalizeVietnamese(movie.director).includes(normalizeVietnamese(searchQuery))) ||
        movie.cast?.some((c) => normalizeVietnamese(c).includes(normalizeVietnamese(searchQuery)));

      if (!matchSearch) return false;

      // Lọc theo thể loại
      if (selectedGenre !== 'Tất cả' && !movie.genre?.includes(selectedGenre)) return false;

      // Lọc theo định dạng
      if (selectedFormat !== 'Tất cả' && !movie.format?.includes(selectedFormat)) return false;

      return true;
    });
  }, [activeTab, searchQuery, selectedGenre, selectedFormat]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="border-b border-gray-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Film className="w-3.5 h-3.5" />
              <span>Kho Phim Chiếu Rạp</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
              Danh Sách Phim
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Khám phá toàn bộ phim bom tấn đang chiếu và sắp ra mắt tại hệ thống cụm rạp
            </p>
          </div>

          {/* Tab Switcher: Tất cả / Đang chiếu / Sắp chiếu */}
          <div className="flex items-center bg-gray-900 p-1.5 rounded-xl border border-gray-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tất Cả ({movies.length})
            </button>
            <button
              onClick={() => setActiveTab('now_showing')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'now_showing'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Đang Chiếu ({movies.filter((m) => m.status === 'now_showing').length})
            </button>
            <button
              onClick={() => setActiveTab('coming_soon')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'coming_soon'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sắp Chiếu ({movies.filter((m) => m.status === 'coming_soon').length})
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-gray-900/90 border border-gray-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên phim, đạo diễn, diễn viên..."
                className="w-full bg-gray-800 text-white placeholder-gray-500 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">Thể loại:</span>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-gray-800 text-white text-sm rounded-xl px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
              >
                {allGenres.map((g) => (
                  <option key={g} value={g} className="bg-gray-900">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">Định dạng:</span>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full bg-gray-800 text-white text-sm rounded-xl px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="Tất cả" className="bg-gray-900">Tất cả định dạng</option>
                <option value="2D" className="bg-gray-900">2D Digital</option>
                <option value="3D" className="bg-gray-900">3D Dolby</option>
                <option value="IMAX" className="bg-gray-900">IMAX Laser</option>
              </select>
            </div>
          </div>
        </div>

        {/* Movie Grid */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800 space-y-3">
            <Film className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-lg font-bold text-gray-300">Không tìm thấy bộ phim phù hợp</h3>
            <p className="text-xs text-gray-500">
              Hãy thử tìm kiếm với từ khóa khác hoặc bỏ các bộ lọc thể loại / định dạng.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('Tất cả');
                setSelectedFormat('Tất cả');
                setActiveTab('all');
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition-colors mt-2"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;
