import React, { useEffect, useState } from 'react';
import { Gift, Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import { subscribePromotions, savePromotion, deletePromotion } from '../firebase/adminService';
import { Promotion } from '../types';

export const PromotionsAdminPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Partial<Promotion> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePromotions((data) => setPromotions(data));
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setEditingPromo({
      id: `promo-${Date.now().toString().slice(-4)}`,
      title: '',
      description: '',
      code: 'DISCOUNT20',
      discount: 'Giảm 20%',
      validUntil: '31/12/2026',
      tag: 'Khuyến mãi',
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
      terms: ['Áp dụng tất cả các rạp', 'Có giá trị đến hết năm'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Promotion) => {
    setEditingPromo({ ...p });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo || !editingPromo.title) return;
    const terms = Array.isArray(editingPromo.terms)
      ? editingPromo.terms
      : (editingPromo.terms as any)?.split(',').map((s: string) => s.trim()) || [];

    await savePromotion({
      id: editingPromo.id || `promo-${Date.now()}`,
      title: editingPromo.title || '',
      description: editingPromo.description || '',
      code: (editingPromo.code || 'PROMO').toUpperCase(),
      discount: editingPromo.discount || 'Ưu đãi',
      validUntil: editingPromo.validUntil || '31/12/2026',
      tag: editingPromo.tag || 'Ưu đãi',
      image: editingPromo.image || '',
      terms,
    });
    setIsModalOpen(false);
    setEditingPromo(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mã ưu đãi này?')) {
      await deletePromotion(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#23293b] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Quản Lý Khuyến Mãi & Voucher</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400 font-bold border border-emerald-600/30">
              {promotions.length} mã ưu đãi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Quản lý mã giảm giá, mức chiết khấu và điều khoản áp dụng cho khách hàng
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khuyến Mãi Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((p) => (
          <div
            key={p.id}
            className="bg-[#181d2a] border border-[#23293b] rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-red-600/20 text-red-400 border border-red-600/30">
                  {p.code}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {p.discount}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{p.title}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{p.description}</p>

              <div className="text-[11px] text-gray-500">
                Hạn sử dụng: <strong className="text-gray-300">{p.validUntil}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#23293b]">
              <button
                type="button"
                onClick={() => handleOpenEdit(p)}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5" /> Sửa
              </button>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#181d2a] border border-[#23293b] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#23293b]">
              <h3 className="text-base font-bold text-white">Thông Tin Khuyến Mãi</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Mã Code (*)</label>
                <input
                  type="text"
                  required
                  value={editingPromo.code || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Tiêu Đề Ưu Đãi</label>
                <input
                  type="text"
                  required
                  value={editingPromo.title || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Mức Giảm</label>
                  <input
                    type="text"
                    required
                    value={editingPromo.discount || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Hạn Dùng</label>
                  <input
                    type="text"
                    value={editingPromo.validUntil || '31/12/2026'}
                    onChange={(e) => setEditingPromo({ ...editingPromo, validUntil: e.target.value })}
                    className="w-full px-3 py-2 bg-[#121620] border border-[#23293b] rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Mô Tả</label>
                <textarea
                  rows={2}
                  value={editingPromo.description || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
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
                  Lưu Khuyến Mãi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
