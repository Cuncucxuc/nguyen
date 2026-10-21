import React, { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, Trash2, MapPin, X } from 'lucide-react';
import { subscribeCinemas, saveCinema, deleteCinema } from '../firebase/adminService';
import { Cinema } from '../types';

export const CinemasAdminPage: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState<Partial<Cinema> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeCinemas((data) => setCinemas(data));
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setEditingCinema({
      id: `cinema-${Date.now().toString().slice(-4)}`,
      name: '',
      address: '',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Cinema) => {
    setEditingCinema({ ...c });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCinema || !editingCinema.name) return;
    await saveCinema(editingCinema as Cinema);
    setIsModalOpen(false);
    setEditingCinema(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa rạp chiếu này?')) {
      await deleteCinema(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#23293b] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Quản Lý Cụm Rạp</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-600/20 text-amber-400 font-bold border border-amber-600/30">
              {cinemas.length} rạp
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Quản lý danh sách các cụm rạp chiếu, địa chỉ và thông tin liên hệ
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Cụm Rạp</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cinemas.map((c) => (
          <div
            key={c.id}
            className="bg-[#181d2a] border border-[#23293b] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
          >
            <div className="relative h-44 overflow-hidden">
              <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181d2a] via-transparent to-transparent" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-black/60 text-white backdrop-blur-md border border-white/10">
                {c.id}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <h3 className="text-lg font-bold text-white">{c.name}</h3>
              <div className="flex items-start gap-2 text-xs text-gray-400">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{c.address}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#23293b]">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Sửa
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingCinema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#23293b]">
              <h3 className="text-base font-bold text-white">Thông Tin Cụm Rạp</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Mã Rạp</label>
                <input
                  type="text"
                  value={editingCinema.id || ''}
                  onChange={(e) => setEditingCinema({ ...editingCinema, id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Tên Rạp Chiếu</label>
                <input
                  type="text"
                  required
                  value={editingCinema.name || ''}
                  onChange={(e) => setEditingCinema({ ...editingCinema, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Địa Chỉ</label>
                <textarea
                  rows={2}
                  required
                  value={editingCinema.address || ''}
                  onChange={(e) => setEditingCinema({ ...editingCinema, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Ảnh Đại Diện URL</label>
                <input
                  type="text"
                  value={editingCinema.image || ''}
                  onChange={(e) => setEditingCinema({ ...editingCinema, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#23293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300"
                >
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold">
                  Lưu Rạp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
