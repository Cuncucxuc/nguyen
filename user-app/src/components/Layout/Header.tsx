import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Gift, User, Ticket, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Trang Chủ', href: '/' },
    { label: 'Phim', href: '/phim' },
    { label: 'Rạp Chiếu', href: '/rap-chieu' },
    { label: 'Khuyến Mãi', href: '/khuyen-mai' },
  ];

  const getUserInitial = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300">
              <Film className="w-6 h-6 text-red-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="text-2xl font-bold tracking-wider text-red-600">
              Cine<span className="text-white">Viet</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.href);

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`font-semibold text-sm transition-all duration-200 relative py-1 ${
                    isActive
                      ? 'text-red-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Auth & User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Points Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-yellow-400 text-sm font-semibold shadow-inner">
                  <Gift className="w-4 h-4 text-yellow-400" />
                  <span>{user?.points?.toLocaleString('vi-VN') ?? 0}</span>
                  <span className="text-xs text-gray-400 font-normal">điểm</span>
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-gray-800 transition-colors duration-200 focus:outline-none"
                    aria-expanded={isDropdownOpen}
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Avatar'}
                        className="w-9 h-9 rounded-full object-cover border-2 border-red-600"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {getUserInitial()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-white max-w-[120px] truncate">
                      {user?.displayName || user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2.5 border-b border-gray-800">
                        <p className="text-xs text-gray-400">Đã đăng nhập với</p>
                        <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/tai-khoan"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <span>Tài Khoản</span>
                        </Link>
                        <Link
                          to="/ve-cua-toi"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                          <Ticket className="w-4 h-4 text-gray-400" />
                          <span>Vé Của Tôi</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-800 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-gray-800 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng Xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/dang-nhap"
                  className="px-4 py-2 rounded-lg border border-gray-700 text-sm font-medium text-white hover:border-gray-500 hover:bg-gray-800/50 transition-all duration-200"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/dang-ky"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium text-white shadow-lg shadow-red-600/30 transition-all duration-200"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-yellow-400 text-xs font-semibold">
                <Gift className="w-3.5 h-3.5 text-yellow-400" />
                <span>{user?.points ?? 0}</span>
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-[#0f0f0f] px-4 pt-3 pb-6 space-y-4">
          {isAuthenticated && (
            <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl border border-gray-800">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-base">
                {getUserInitial()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.displayName || 'Người dùng'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold px-2 py-1 rounded bg-gray-800">
                <Gift className="w-3.5 h-3.5" />
                <span>{user?.points ?? 0} đ</span>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.href);

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-lg text-base transition-colors ${
                    isActive
                      ? 'bg-red-600/15 text-red-500 font-bold border-l-4 border-red-600'
                      : 'font-medium text-gray-300 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <Link
                  to="/tai-khoan"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-400" />
                  <span>Tài Khoản</span>
                </Link>
                <Link
                  to="/ve-cua-toi"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                >
                  <Ticket className="w-5 h-5 text-gray-400" />
                  <span>Vé Của Tôi</span>
                </Link>
              </>
            )}
          </nav>

          <div className="pt-2 border-t border-gray-800">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-gray-900 text-red-500 font-medium hover:bg-gray-800 transition-colors border border-gray-800"
              >
                <LogOut className="w-5 h-5" />
                <span>Đăng Xuất</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/dang-nhap"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-4 rounded-lg border border-gray-700 text-white font-medium hover:bg-gray-800 text-center text-sm transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/dang-ky"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 text-center text-sm shadow-md transition-colors"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
