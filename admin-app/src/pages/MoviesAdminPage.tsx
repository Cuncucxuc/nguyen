import React, { useEffect, useState, useMemo } from 'react';
import {
  Film,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Star,
  Clock,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';
import { subscribeMovies, saveMovie, deleteMovie } from '../firebase/adminService';
import { Movie } from '../types';
import { normalizeVietnamese } from '../utils';

export const MoviesAdminPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'now_showing' | 'coming_soon'>('all');
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeMovies((data) => {
      setMovies(data);
    });
    return () => unsubscribe();
  }, []);

  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genre?.forEach((g) => set.add(g)));
    return ['Tất cả', ...Array.from(set)];
  }, [movies]);

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      if (activeTab === 'now_showing' && m.status !== 'now_showing') return false;
      if (activeTab === 'coming_soon' && m.status !== 'coming_soon') return false;

      const q = normalizeVietnamese(searchQuery);
      if (q) {
        const titleMatch = normalizeVietnamese(m.title).includes(q);
        const dirMatch = normalizeVietnamese(m.director || '').includes(q);
        const castMatch = m.cast?.some((c) => normalizeVietnamese(c).includes(q));
        if (!titleMatch && !dirMatch && !castMatch) return false;
      }

      if (selectedGenre !== 'Tất cả' && !m.genre?.includes(selectedGenre)) {
        return false;
      }

      return true;
    });
  }, [movies, activeTab, searchQuery, selectedGenre]);

  // Mở modal thêm phim mới
  const handleOpenAdd = () => {
    const newId = `movie-${Date.now().toString().slice(-6)}`;
    setEditingMovie({
      id: newId,
      title: '',
      description: '',
      genre: 'Hành Động, Phiêu Lưu',
      director: '',
      cast: '',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
      trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: 120,
      rating: 8.5,
      releaseDate: new Date().toISOString().slice(0, 10),
      status: 'now_showing',
      language: 'Tiếng Việt',
      format: '2D, IMAX',
      ageRating: 'P',
    });
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEdit = (movie: Movie) => {
    setEditingMovie({
      ...movie,
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
      format: Array.isArray(movie.format) ? movie.format.join(', ') : movie.format || '2D',
    });
    setIsModalOpen(true);
  };

  // Lưu thông tin phim lên Firebase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie || !editingMovie.title?.trim()) {
      alert('Vui lòng nhập tên phim');
      return;
    }

    setIsSubmitting(true);

    const genreList = typeof editingMovie.genre === 'string'
      ? editingMovie.genre.split(',').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(editingMovie.genre) ? editingMovie.genre : ['Hành Động'];

    const castList = typeof editingMovie.cast === 'string'
      ? editingMovie.cast.split(',').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(editingMovie.cast) ? editingMovie.cast : [];

    const formatList = typeof editingMovie.format === 'string'
      ? editingMovie.format.split(',').map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(editingMovie.format) ? editingMovie.format : ['2D'];

    const movieData: Movie = {
      id: editingMovie.id || `movie-${Date.now()}`,
      title: editingMovie.title.trim(),
      description: editingMovie.description || '',
      genre: genreList.length > 0 ? genreList : ['Hành Động'],
      director: editingMovie.director || 'Chưa cập nhật',
      cast: castList,
      poster: editingMovie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      trailer: editingMovie.trailer || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: Number(editingMovie.duration) || 120,
      rating: Number(editingMovie.rating) || 8.0,
      releaseDate: editingMovie.releaseDate || new Date().toISOString().slice(0, 10),
      status: editingMovie.status || 'now_showing',
      language: editingMovie.language || 'Tiếng Việt',
      format: formatList.length > 0 ? formatList : ['2D'],
      ageRating: editingMovie.ageRating || 'P',
    };

    const ok = await saveMovie(movieData);
    setIsSubmitting(false);
    if (ok) {
      setIsModalOpen(false);
      setToastMessage(`✨ Đã lưu thành công bộ phim "${movieData.title}" lên Firebase Firestore!`);
      setTimeout(() => setToastMessage(null), 4000);
      setEditingMovie(null);
    } else {
      alert('Lỗi lưu phim lên Firebase. Vui lòng kiểm tra lại kết nối!');
    }
  };

  // Xóa phim
  const handleDelete = async (id: string) => {
    const ok = await deleteMovie(id);
    if (ok) {
      setDeleteConfirmId(null);
    } else {
      alert('Lỗi xóa phim khỏi Firebase.');
    }
  };

  // Đổi nhanh trạng thái Đang chiếu <-> Sắp chiếu
  const handleToggleStatus = async (movie: Movie) => {
    const nextStatus = movie.status === 'now_showing' ? 'coming_soon' : 'now_showing';
    await saveMovie({ ...movie, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600/70 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#23293b] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Quản Lý Danh Sách Phim</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 font-bold border border-red-600/30">
              {movies.length} phim
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Toàn bộ danh sách phim được đồng bộ trực tiếp hai chiều với Firebase Firestore
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Phim Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#181d2a] border border-[#23293b] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        {/* Tabs: Tất cả / Đang chiếu / Sắp chiếu */}
        <div className="flex items-center bg-[#121620] p-1 rounded-xl border border-[#23293b] w-full md:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'all' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tất Cả ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('now_showing')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'now_showing' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Đang Chiếu ({movies.filter((m) => m.status === 'now_showing').length})
          </button>
          <button
            onClick={() => setActiveTab('coming_soon')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'coming_soon' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sắp Chiếu ({movies.filter((m) => m.status === 'coming_soon').length})
          </button>
        </div>

        {/* Search & Genre Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm phim, đạo diễn..."
              className="w-full pl-10 pr-4 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-[#121620] border border-[#23293b] text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-red-500"
          >
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Movies Table */}
      <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#121620] text-xs uppercase font-bold text-gray-400 border-b border-[#23293b]">
              <tr>
                <th className="px-5 py-3.5">Poster & Tên Phim</th>
                <th className="px-4 py-3.5">Thể Loại</th>
                <th className="px-4 py-3.5">Thời Lượng & Điểm</th>
                <th className="px-4 py-3.5">Độ Tuổi & Định Dạng</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23293b]">
              {filteredMovies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Không tìm thấy bộ phim nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredMovies.map((m) => (
                  <tr key={m.id} className="hover:bg-[#121620]/60 transition">
                    {/* Poster & Title */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-12 h-16 rounded-lg object-cover flex-shrink-0 shadow"
                        />
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-white text-sm truncate">{m.title}</div>
                          <div className="text-xs text-gray-400 truncate mt-0.5">ĐD: {m.director}</div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">ID: {m.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Genre */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {m.genre?.slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-800 text-gray-300 border border-gray-700"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Duration & Rating */}
                    <td className="px-4 py-3.5 text-xs">
                      <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        <span>{m.rating?.toFixed(1) || '8.5'}</span>
                        <span className="text-gray-500 text-[10px]">/10</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{m.duration} phút</span>
                      </div>
                    </td>

                    {/* Age & Format */}
                    <td className="px-4 py-3.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-600/30">
                          {m.ageRating || 'P'}
                        </span>
                        {m.format?.map((fmt) => (
                          <span key={fmt} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300">
                            {fmt}
                          </span>
                        ))}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        {m.releaseDate}
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-4 py-3.5 text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(m)}
                        title="Bấm để chuyển trạng thái"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                          m.status === 'now_showing'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'now_showing' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span>{m.status === 'now_showing' ? 'Đang Chiếu' : 'Sắp Chiếu'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition"
                          title="Chỉnh sửa thông tin phim"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(m.id)}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-300 hover:text-white transition"
                          title="Xóa phim khỏi Firestore"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Chỉnh Sửa Phim */}
      {isModalOpen && editingMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#23293b]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <span>{movies.some((m) => m.id === editingMovie.id) ? 'Chỉnh Sửa Phim' : 'Thêm Phim Mới Vào Firestore'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Mã Phim (ID)</label>
                  <input
                    type="text"
                    disabled={movies.some((m) => m.id === editingMovie.id)}
                    value={editingMovie.id || ''}
                    onChange={(e) => setEditingMovie({ ...editingMovie, id: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-gray-300 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Tên Phim (*)</label>
                  <input
                    type="text"
                    required
                    value={editingMovie.title || ''}
                    onChange={(e) => setEditingMovie({ ...editingMovie, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Mô Tả Tóm Tắt</label>
                <textarea
                  rows={3}
                  value={editingMovie.description || ''}
                  onChange={(e) => setEditingMovie({ ...editingMovie, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Thể Loại (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Hành Động, Phiêu Lưu, Hài Hước"
                    value={editingMovie.genre || ''}
                    onChange={(e) => setEditingMovie({ ...editingMovie, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Diễn Viên (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Tom Cruise, Keanu Reeves"
                    value={editingMovie.cast || ''}
                    onChange={(e) => setEditingMovie({ ...editingMovie, cast: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Đạo Diễn</label>
                  <input
                    type="text"
                    value={editingMovie.director || ''}
                    onChange={(e) => setEditingMovie({ ...editingMovie, director: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Ngôn Ngữ</label>
                  <input
                    type="text"
                    value={editingMovie.language || ''}
                    onChange={(e) => setEditingMovie({ ...editingMovie, language: e.target.value })}
                    placeholder="Tiếng Việt, Phụ đề..."
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Thời Lượng (Phút)</label>
                  <input
                    type="number"
                    value={editingMovie.duration || 120}
                    onChange={(e) => setEditingMovie({ ...editingMovie, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Điểm Đánh Giá (/10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingMovie.rating || 8.5}
                    onChange={(e) => setEditingMovie({ ...editingMovie, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Định Dạng (VD: 2D, IMAX)</label>
                  <input
                    type="text"
                    value={editingMovie.format || ''}
                    onChange={(e) => setEditingMovie({ ...editingMovie, format: e.target.value })}
                    placeholder="2D, IMAX"
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Trạng Thái</label>
                  <select
                    value={editingMovie.status || 'now_showing'}
                    onChange={(e) => setEditingMovie({ ...editingMovie, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                  >
                    <option value="now_showing">Đang Chiếu (now_showing)</option>
                    <option value="coming_soon">Sắp Chiếu (coming_soon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Phân Loại Độ Tuổi</label>
                  <select
                    value={editingMovie.ageRating || 'P'}
                    onChange={(e) => setEditingMovie({ ...editingMovie, ageRating: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                  >
                    <option value="P">P (Mọi lứa tuổi)</option>
                    <option value="T13">T13 (Trên 13 tuổi)</option>
                    <option value="T16">T16 (Trên 16 tuổi)</option>
                    <option value="T18">T18 (Trên 18 tuổi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Ngày Khởi Chiếu</label>
                  <input
                    type="date"
                    value={editingMovie.releaseDate || ''}
                    onChange={(e) => setEditingMovie({ ...editingMovie, releaseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Link Ảnh Poster URL</label>
                <input
                  type="text"
                  value={editingMovie.poster || ''}
                  onChange={(e) => setEditingMovie({ ...editingMovie, poster: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Link YouTube Trailer</label>
                <input
                  type="text"
                  value={editingMovie.trailer || ''}
                  onChange={(e) => setEditingMovie({ ...editingMovie, trailer: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#23293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang Lưu...' : 'Lưu Lên Firebase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#181d2a] border border-red-900/50 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Xác Nhận Xóa Phim?</h4>
            <p className="text-xs text-gray-400">
              Bạn có chắc chắn muốn xóa bộ phim này khỏi Firebase Firestore? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:text-white text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
