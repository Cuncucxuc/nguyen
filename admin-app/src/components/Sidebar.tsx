import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Ticket,
  Building2,
  Popcorn,
  Gift,
  ShieldCheck,
  Clapperboard,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/', label: 'Tổng Quan', icon: LayoutDashboard },
    { to: '/movies', label: 'Quản Lý Phim', icon: Film },
    { to: '/bookings', label: 'Đơn Đặt Vé', icon: Ticket },
    { to: '/cinemas', label: 'Cụm Rạp Chiếu', icon: Building2 },
    { to: '/combos', label: 'Bắp Nước & Combo', icon: Popcorn },
    { to: '/promotions', label: 'Ưu Đãi & Voucher', icon: Gift },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#121620] border-r border-[#23293b] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#23293b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide text-white block">
                CineViet <span className="text-red-500">Admin</span>
              </span>
              <span className="text-[10px] text-gray-400 block -mt-0.5">
                Portal Quản Trị Hệ Thống
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
            Menu Quản Lý
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-[#23293b]">
          <div className="flex items-center gap-2 px-2 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-400">Firebase:</span>
            <span className="font-semibold">xemphim-c8996</span>
          </div>
        </div>
      </aside>
    </>
  );
};
