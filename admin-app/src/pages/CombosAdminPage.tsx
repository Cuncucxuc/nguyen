import React, { useEffect, useState } from 'react';
import { Popcorn, Plus, Edit2, Trash2, X } from 'lucide-react';
import { subscribeCombos, saveCombo, deleteCombo } from '../firebase/adminService';
import { Combo } from '../types';
import { formatCurrency } from '../utils';

export const CombosAdminPage: React.FC = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Partial<Combo> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeCombos((data) => setCombos(data));
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setEditingCombo({
      id: `combo-${Date.now().toString().slice(-4)}`,
      name: '',
      description: '',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80',
      items: ['1 Bắp lớn', '1 Nước lớn'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Combo) => {
    setEditingCombo({ ...c });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCombo || !editingCombo.name) return;
    const items = Array.isArray(editingCombo.items)
      ? editingCombo.items
      : (editingCombo.items as any)?.split(',').map((s: string) => s.trim()) || [];

    await saveCombo({
      id: editingCombo.id || `combo-${Date.now()}`,
      name: editingCombo.name || '',
      description: editingCombo.description || '',
      price: Number(editingCombo.price) || 85000,
      image: editingCombo.image || '',
      items,
    });
    setIsModalOpen(false);
    setEditingCombo(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa combo này?')) {
      await deleteCombo(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#23293b] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Popcorn className="w-6 h-6 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Quản Lý Combo Bắp Nước</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-600/20 text-amber-400 font-bold border border-amber-600/30">
              {combos.length} gói combo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Quản lý thực đơn ăn uống, giá bán và thành phần combo tại quầy
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Combo Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {combos.map((c) => (
          <div
            key={c.id}
            className="bg-[#181d2a] border border-[#23293b] rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
          >
            <div className="relative h-40 overflow-hidden">
              <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-black bg-red-600 text-white shadow-md">
                {formatCurrency(c.price)}
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{c.name}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.items?.map((it, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300">
                      {it}
                    </span>
                  ))}
                </div>
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

      {isModalOpen && editingCombo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#23293b]">
              <h3 className="text-base font-bold text-white">Thông Tin Combo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Tên Combo</label>
                <input
                  type="text"
                  required
                  value={editingCombo.name || ''}
                  onChange={(e) => setEditingCombo({ ...editingCombo, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Giá Bán (VNĐ)</label>
                <input
                  type="number"
                  required
                  value={editingCombo.price || 0}
                  onChange={(e) => setEditingCombo({ ...editingCombo, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Mô Tả</label>
                <textarea
                  rows={2}
                  value={editingCombo.description || ''}
                  onChange={(e) => setEditingCombo({ ...editingCombo, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Link Ảnh URL</label>
                <input
                  type="text"
                  value={editingCombo.image || ''}
                  onChange={(e) => setEditingCombo({ ...editingCombo, image: e.target.value })}
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
                  Lưu Combo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
