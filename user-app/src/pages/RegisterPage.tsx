import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên');
      return false;
    }
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Địa chỉ email không đúng định dạng');
      return false;
    }
    if (!phone.trim()) {
      setErrorMessage('Vui lòng nhập số điện thoại');
      return false;
    }
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      setErrorMessage('Số điện thoại không hợp lệ (gồm 10 chữ số)');
      return false;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có độ dài tối thiểu 6 ký tự');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await register(email.trim(), password, name.trim());
      if (phone.trim() && updateProfile) {
        try {
          updateProfile({ phone: phone.trim() });
        } catch {
          // non-critical
        }
      }
      navigate('/');
    } catch (err: any) {
      console.error('Register error:', err);
      setErrorMessage(
        err?.message || 'Đăng ký không thành công. Email này có thể đã được sử dụng.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-[#0f0f0f]">
      <div className="w-full max-w-md">
        {/* Card container */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle top red glow line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/30 mb-4 shadow-lg shadow-red-600/10">
              <Film className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Đăng Ký Tài Khoản</h1>
            <p className="text-sm text-gray-400 mt-1.5">
              Tạo tài khoản để nhận ưu đãi và tích điểm cùng <span className="text-red-500 font-semibold">CineViet</span>
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-colors duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-colors duration-200"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
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
                  autoComplete="tel"
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-colors duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                  required
                  className="w-full pl-11 pr-11 py-2.5 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  required
                  className="w-full pl-11 pr-11 py-2.5 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý đăng ký...</span>
                </>
              ) : (
                <span>Đăng Ký</span>
              )}
            </button>
          </form>

          {/* Bottom link to Login */}
          <div className="mt-8 text-center text-sm text-gray-400">
            Đã có tài khoản?{' '}
            <Link
              to="/dang-nhap"
              className="text-red-500 hover:text-red-400 font-semibold transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
