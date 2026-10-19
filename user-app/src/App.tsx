import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import CinemasPage from './pages/CinemasPage';
import PromotionsPage from './pages/PromotionsPage';
import MovieDetailPage from './pages/MovieDetailPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MyTicketsPage from './pages/MyTicketsPage';
import PaymentResultPage from './pages/PaymentResultPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/phim" element={<MoviesPage />} />
          <Route path="/phim/:id" element={<MovieDetailPage />} />
          <Route path="/rap-chieu" element={<CinemasPage />} />
          <Route path="/khuyen-mai" element={<PromotionsPage />} />
          <Route path="/dat-ve/:movieId" element={<BookingPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          <Route path="/tai-khoan" element={<ProfilePage />} />
          <Route path="/ve-cua-toi" element={<MyTicketsPage />} />
          <Route path="/ket-qua-thanh-toan" element={<PaymentResultPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
