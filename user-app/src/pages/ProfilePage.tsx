import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Award,
  Ticket,
  CreditCard,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Camera,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sampleBookings } from '../data/mockData';
import { formatCurrency } from '../utils';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, logout } = useAuth();

  // Điều hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/dang-nhap');
    }
  }, [isAuthenticated, navigate]);

  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || 'Nguyễn Văn A');
  const [phone, setPhone] = useState(user?.phone || '0912345678');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const email = user?.email || 'user@example.com';
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Cập nhật form khi user trong context thay đổi
  useEffect(() => {
    if (user) {
      if (user.displayName) setDisplayName(user.displayName);
      if (user.phone) setPhone(user.phone);
      if (user.photoURL) setPhotoURL(user.photoURL);
    }
  }, [user]);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Điểm thưởng & thống kê
  const points = user?.points ?? 250;
  const totalTickets = sampleBookings?.length || 4;
  const totalSpent =
    sampleBookings?.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0) || 780000;

  // Cấp bậc thành viên
  const getMembershipTier = (pts: number) => {
    if (pts >= 500) return { name: 'Thành Viên Kim Cương', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    if (pts >= 200) return { name: 'Thành Viên Vàng', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    return { name: 'Thành Viên Bạc', color: 'text-gray-300 bg-gray-500/10 border-gray-500/30' };
  };

  const membership = getMembershipTier(points);

  // Xử lý cập nhật thông tin
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    setTimeout(async () => {
      await updateProfile({ displayName, phone, photoURL });
      setIsSaving(false);
      setSuccessMessage('Thông tin tài khoản đã được cập nhật thành công!');
      setTimeout(() => setSuccessMessage(''), 4000);
    }, 400);
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      const authObj = (window as any).__authContext || {};
      if (authObj.changePassword) {
        await authObj.changePassword(newPassword);
      }
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('');
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Không thể đổi mật khẩu. Bạn có thể cần đăng nhập lại trước.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/dang-nhap');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">Tài Khoản Của Tôi</h1>
          <p className="text-gray-400 text-sm mt-1">
            Quản lý thông tin cá nhân, tích điểm đổi thưởng và lịch sử đặt vé
          </p>
        </div>

        {/* Thống kê nhanh (Stats Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Tổng vé đã đặt */}
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-red-600/15 flex items-center justify-center text-red-500">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                Tổng vé đã đặt
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {totalTickets} vé
              </h3>
            </div>
          </div>

          {/* Card 2: Tổng chi tiêu */}
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center text-green-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                Tổng chi tiêu
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {formatCurrency(totalSpent)}
              </h3>
            </div>
          </div>

          {/* Card 3: Điểm tích lũy */}
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-yellow-400/15 flex items-center justify-center text-yellow-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                Điểm tích lũy
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mt-0.5">
                {points} điểm
              </h3>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
              <div className="relative inline-block mx-auto mb-4">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="w-24 h-24 rounded-full object-cover border-2 border-red-600 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center text-3xl font-black shadow-lg">
                    {displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const newUrl = prompt('Nhập đường dẫn ảnh đại diện (URL):', photoURL);
                    if (newUrl !== null) setPhotoURL(newUrl);
                  }}
                  className="absolute bottom-0 right-0 p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-full border border-gray-700 shadow transition-colors"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-white line-clamp-1">{displayName}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{email}</p>

              {/* Membership Badge */}
              <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${membership.color}`}>
                <Award className="w-3.5 h-3.5" />
                <span>{membership.name}</span>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3 shadow-lg divide-y divide-gray-800">
              <Link
                to="/ve-cua-toi"
                className="flex items-center justify-between p-3.5 rounded-xl text-gray-200 hover:bg-gray-800/80 hover:text-red-400 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-sm">Vé Của Tôi</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl text-gray-200 hover:bg-gray-800/80 hover:text-yellow-400 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium text-sm">Đổi Mật Khẩu</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3.5 rounded-xl text-red-400 hover:bg-red-600/10 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium text-sm">Đăng Xuất</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Content: Editable Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                  <h3 className="text-xl font-bold text-white">Thông Tin Cá Nhân</h3>
                </div>
              </div>

              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3 text-green-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Họ tên */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      placeholder="Nhập họ và tên của bạn"
                      className="w-full pl-11 pr-4 py-3 bg-gray-950/80 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Email (Readonly) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Địa chỉ Email
                    </label>
                    <span className="text-xs text-gray-500">(Không thể thay đổi)</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-gray-950/40 border border-gray-800 rounded-xl text-gray-400 cursor-not-allowed text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full pl-11 pr-4 py-3 bg-gray-950/80 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-red-600/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Đang lưu...' : 'Cập Nhật Thông Tin'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Đổi Mật Khẩu */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-yellow-400" />
                <span>Đổi Mật Khẩu</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-white text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-white text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-4 py-2.5 bg-gray-950 border border-gray-700 rounded-xl text-white text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/30"
                >
                  Đổi Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
