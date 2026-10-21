import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { MoviesAdminPage } from './pages/MoviesAdminPage';
import { BookingsAdminPage } from './pages/BookingsAdminPage';
import { CinemasAdminPage } from './pages/CinemasAdminPage';
import { CombosAdminPage } from './pages/CombosAdminPage';
import { PromotionsAdminPage } from './pages/PromotionsAdminPage';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/movies':
        return { title: 'Quản Lý Phim', subtitle: 'Thêm, sửa, xóa và thay đổi trạng thái chiếu phim' };
      case '/bookings':
        return { title: 'Quản Lý Đơn Vé', subtitle: 'Tra cứu thông tin khách hàng và lịch sử đặt vé' };
      case '/cinemas':
        return { title: 'Cụm Rạp Chiếu', subtitle: 'Quản lý thông tin địa điểm rạp và phòng chiếu' };
      case '/combos':
        return { title: 'Bắp Nước & Combos', subtitle: 'Quản lý thực đơn thức ăn và đồ uống tại rạp' };
      case '/promotions':
        return { title: 'Khuyến Mãi & Voucher', subtitle: 'Quản lý mã giảm giá và chương trình ưu đãi' };
      default:
        return { title: 'Bảng Điều Khiển Tổng Quan', subtitle: 'Theo dõi doanh thu và tình trạng hoạt động toàn hệ thống' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="min-h-screen bg-[#0c0e14] text-gray-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/movies" element={<MoviesAdminPage />} />
          <Route path="/bookings" element={<BookingsAdminPage />} />
          <Route path="/cinemas" element={<CinemasAdminPage />} />
          <Route path="/combos" element={<CombosAdminPage />} />
          <Route path="/promotions" element={<PromotionsAdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
