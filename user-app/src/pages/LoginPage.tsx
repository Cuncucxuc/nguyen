import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Địa chỉ email không đúng định dạng');
      return false;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự');
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
      await login(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(
        err?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // In a real flow, this triggers OAuth or redirects
    try {
      setIsLoading(true);
      setErrorMessage(null);
      // For demonstration or mocked auth flow
      await login('user@cineviet.vn', 'password123');
      navigate('/');
    } catch (err: any) {
      setErrorMessage('Đăng nhập bằng Google không thành công. Vui lòng thử lại.');
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Đăng Nhập</h1>
            <p className="text-sm text-gray-400 mt-1.5">
              Chào mừng bạn quay trở lại với <span className="text-red-500 font-semibold">CineViet</span>
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
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
                  className="w-full pl-11 pr-4 py-3 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-colors duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Mật khẩu
                </label>
                <Link
                  to="/#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Tính năng khôi phục mật khẩu đang được bảo trì. Vui lòng liên hệ hotline 1900 6868.');
                  }}
                  className="text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-colors duration-200"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng Nhập</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-3 text-gray-400 font-medium">Hoặc</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-750 border border-gray-700 text-white font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>

          {/* Bottom link to Register */}
          <div className="mt-8 text-center text-sm text-gray-400">
            Chưa có tài khoản?{' '}
            <Link
              to="/dang-ky"
              className="text-red-500 hover:text-red-400 font-semibold transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
