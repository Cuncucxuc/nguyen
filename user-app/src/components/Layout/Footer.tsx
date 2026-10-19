import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Facebook, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Column 1: CineViet Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group inline-flex">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300">
                <Film className="w-6 h-6 text-red-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-2xl font-bold tracking-wider text-red-600">
                Cine<span className="text-white">Viet</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              CineViet - Hệ thống đặt vé xem phim trực tuyến hàng đầu Việt Nam. Tận hưởng trải nghiệm điện ảnh đỉnh cao với hệ thống âm thanh, màn chiếu hiện đại và đặt vé tiện lợi mọi lúc mọi nơi.
            </p>
            <div className="space-y-2 text-sm text-gray-400 pt-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>Hotline: 1900 6868 (1.000đ/phút)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>Email: hotro@cineviet.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>Tầng 5, Tòa nhà Landmark, Hà Nội</span>
              </div>
            </div>
          </div>

          {/* Column 2: Khám Phá Điện Ảnh */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 uppercase tracking-wider relative inline-block after:content-[''] after:block after:w-8 after:h-0.5 after:bg-red-600 after:mt-1">
              Khám Phá
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/phim" className="hover:text-white transition-colors duration-200">
                  Phim Đang Chiếu Rạp
                </Link>
              </li>
              <li>
                <Link to="/phim" className="hover:text-white transition-colors duration-200">
                  Phim Sắp Ra Mắt
                </Link>
              </li>
              <li>
                <Link to="/rap-chieu" className="hover:text-white transition-colors duration-200">
                  Hệ Thống Cụm Rạp Chiếu
                </Link>
              </li>
              <li>
                <Link to="/khuyen-mai" className="hover:text-white transition-colors duration-200">
                  Ưu Đãi & Mã Giảm Giá
                </Link>
              </li>
              <li>
                <Link to="/ve-cua-toi" className="hover:text-white transition-colors duration-200">
                  Vé Đã Đặt Của Tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Kết Nối */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 uppercase tracking-wider relative inline-block after:content-[''] after:block after:w-8 after:h-0.5 after:bg-red-600 after:mt-1">
              Kết Nối
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Theo dõi CineViet trên các nền tảng mạng xã hội để cập nhật tin tức điện ảnh và khuyến mãi mới nhất.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all duration-200"
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 CineViet. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Chính sách bảo mật</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Điều khoản dịch vụ</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Cookie</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
