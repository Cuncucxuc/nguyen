import React from 'react';
import { Menu, Bell, Search, ShieldCheck, RefreshCw, Plus } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  title = 'Bảng Điều Khiển',
  subtitle = 'Tổng quan dữ liệu hoạt động hệ thống đặt vé',
}) => {
  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 bg-[#121620]/80 backdrop-blur-md border-b border-[#23293b] sticky top-0 z-30 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
            {title}
          </h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Admin User Chip */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
            AD
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <span className="block text-xs font-bold text-white">Quản Trị Viên</span>
            <span className="block text-[10px] text-gray-400">admin@cineviet.vn</span>
          </div>
        </div>
      </div>
    </header>
  );
};
