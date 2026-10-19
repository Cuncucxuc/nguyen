import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Calendar, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { promotions } from '../data/mockData';

export const PromotionsPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('Tất cả');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const tags = ['Tất cả', 'Đồng giá', 'HSSV', 'Ví điện tử', 'Ẩm thực', 'Thành viên', 'Cuối tuần'];

  const filteredPromos = promotions.filter((promo) => {
    if (selectedTag === 'Tất cả') return true;
    return promo.tag === selectedTag;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Title */}
        <div className="border-b border-gray-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Gift className="w-3.5 h-3.5" />
              <span>Chương Trình Ưu Đãi Độc Quyền</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
              Khuyến Mãi & Voucher
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Nhận ngay mã giảm giá vé xem phim, bắp nước và các gói quà tặng thành viên hấp dẫn
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-4 py-2 rounded-xl self-start md:self-auto">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>Sao chép mã voucher và nhập ở Bước 4 khi thanh toán vé</span>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromos.map((promo) => (
            <div
              key={promo.id}
              className="bg-gray-900 border border-gray-800 hover:border-red-600/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                {/* Image Banner */}
                <div className="h-44 relative overflow-hidden">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                  
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-lg">
                    {promo.discount}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-gray-300">
                    <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                      <Calendar className="w-3.5 h-3.5 text-red-400" />
                      Hạn dùng: {promo.validUntil}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-800/90 border border-gray-700 text-gray-300 font-semibold">
                      {promo.tag}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {promo.description}
                  </p>

                  {/* Voucher Code Box */}
                  <div className="bg-gray-950/80 p-3 rounded-xl border border-dashed border-gray-700 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-gray-500 block">
                        Mã khuyến mãi:
                      </span>
                      <span className="text-sm font-mono font-black text-yellow-400 tracking-wider">
                        {promo.code}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(promo.code)}
                      className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      {copiedCode === promo.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Terms */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Điều kiện áp dụng:
                    </span>
                    <ul className="space-y-1">
                      {promo.terms.map((term, idx) => (
                        <li key={idx} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                          <span>{term}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <Link
                  to="/phim"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs transition-all border border-red-600/30"
                >
                  <span>Đặt Vé Áp Dụng Mã Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;
