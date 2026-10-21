import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Film,
  ArrowLeft,
  ArrowRight,
  Armchair,
  ShoppingBag,
  AlertCircle,
  Home,
} from 'lucide-react';
import { Showtime, Seat, SelectedCombo, Booking } from '../types';
import { movies, showtimes } from '../data/mockData';
import { getMovieByIdFromFirestore } from '../firebase/movieService';
import { useAuth } from '../context/AuthContext';
import { saveBookingToFirestore } from '../firebase/bookingService';
import { BookingSteps } from '../components/Booking/BookingSteps';
import { ShowtimeSelection } from '../components/Booking/ShowtimeSelection';
import { SeatMap } from '../components/Booking/SeatMap';
import { ComboSelection } from '../components/Booking/ComboSelection';
import { PaymentSummary } from '../components/Booking/PaymentSummary';
import { getSeatLabel, formatCurrency } from '../utils';

export const BookingPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const [searchParams] = useSearchParams();
  const showtimeIdParam = searchParams.get('showtimeId') || searchParams.get('showtime');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Authentication Guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/dang-nhap', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate, location]);

  // Find movie
  const [movie, setMovie] = useState(() => movies.find((m) => m.id === movieId));

  useEffect(() => {
    if (movieId) {
      getMovieByIdFromFirestore(movieId).then((m) => {
        if (m) setMovie(m);
      });
    }
  }, [movieId]);

  // Stepper State (0: Showtime, 1: Seat, 2: Combo, 3: Payment)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<SelectedCombo[]>([]);

  // Auto-select showtime if showtimeId is provided in URL
  useEffect(() => {
    if (showtimeIdParam && !selectedShowtime) {
      const foundSt = showtimes.find((st) => st.id === showtimeIdParam);
      if (foundSt) {
        setSelectedShowtime(foundSt);
        setCurrentStep(1); // Jump to seat selection
      }
    }
  }, [showtimeIdParam, selectedShowtime]);

  // Calculation for sidebar
  const seatsTotal = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  const combosTotal = useMemo(() => {
    return selectedCombos.reduce(
      (sum, sc) => sum + sc.combo.price * sc.quantity,
      0
    );
  }, [selectedCombos]);

  const totalAmount = seatsTotal + combosTotal;

  // Handlers for steps
  const handleSelectShowtime = (st: Showtime) => {
    setSelectedShowtime(st);
    // Clear seats if switching showtime
    setSelectedSeats([]);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromSeats = () => {
    if (selectedSeats.length === 0) return;
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromCombos = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePaymentConfirm = (paymentData?: {
    paymentMethod: string;
    discountCode: string;
    discountAmount: number;
    finalTotal: number;
  }) => {
    const bookingCode = 'BK' + Math.floor(100000 + Math.random() * 900000);
    const finalAmount = paymentData ? paymentData.finalTotal : totalAmount;

    // Chuẩn bị dữ liệu vé đặt
    const bookingRecord: Booking = {
      id: bookingCode,
      orderId: 'CV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + bookingCode.slice(-3),
      showtimeId: selectedShowtime?.id,
      movieId: movie?.id,
      movieTitle: movie?.title || 'Phim Chiếu Rạp',
      moviePoster: movie?.poster || '',
      cinemaId: selectedShowtime?.cinemaId,
      cinemaName: selectedShowtime?.cinemaName || '',
      roomId: selectedShowtime?.roomId,
      roomName: selectedShowtime?.roomName || '',
      date: selectedShowtime?.date || '',
      startTime: selectedShowtime?.startTime || '',
      seatLabels: selectedSeats.map((s) => getSeatLabel(s)),
      seats: selectedSeats,
      combos: selectedCombos.map((c) => ({
        name: c.combo.name,
        quantity: c.quantity,
        price: c.combo.price,
      })),
      totalPrice: finalAmount,
      status: 'confirmed',
      paymentMethod: paymentData?.paymentMethod || 'VNPay',
      createdAt: new Date().toISOString(),
    };

    // Tự động lưu lên Firestore Database (và lưu dự phòng LocalStorage)
    saveBookingToFirestore(bookingRecord, user).catch((err) =>
      console.warn('Lỗi ghi vé lên Firebase:', err)
    );

    navigate('/ket-qua-thanh-toan', {
      state: {
        bookingId: bookingCode,
        movie,
        showtime: selectedShowtime,
        seats: selectedSeats,
        combos: selectedCombos,
        totalAmount: finalAmount,
        paymentMethod: paymentData?.paymentMethod || 'VNPay',
        discountCode: paymentData?.discountCode || '',
        discountAmount: paymentData?.discountAmount || 0,
        createdAt: new Date().toISOString(),
      },
    });
  };

  // Movie Not Found Screen
  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Không tìm thấy thông tin phim</h1>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          Phim bạn đang tìm kiếm không tồn tại hoặc đã ngừng chiếu. Vui lòng quay lại danh sách phim đang chiếu để chọn phim khác.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
        >
          <Home className="w-4 h-4" />
          <span>Về Trang Chủ</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Step Indicator Header */}
      <BookingSteps currentStep={currentStep} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Booking Step Flow (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 0: Showtime Selection */}
            {currentStep === 0 && (
              <ShowtimeSelection
                movieId={movie.id}
                onSelect={handleSelectShowtime}
                selectedShowtime={selectedShowtime}
              />
            )}

            {/* Step 1: Seat Map Selection */}
            {currentStep === 1 && selectedShowtime && (
              <div className="space-y-6 animate-fadeIn">
                <SeatMap
                  showtime={selectedShowtime}
                  selectedSeats={selectedSeats}
                  onSeatChange={setSelectedSeats}
                  maxSeats={8}
                  movieTitle={movie?.title}
                />

                {/* Step Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300 font-semibold text-sm transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Đổi suất chiếu</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedSeats.length === 0}
                    onClick={handleNextFromSeats}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Tiếp tục chọn bắp nước</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Combo Food Selection */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <ComboSelection
                  selectedCombos={selectedCombos}
                  onComboChange={setSelectedCombos}
                  onSkip={handleNextFromCombos}
                />

                {/* Step Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300 font-semibold text-sm transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại chọn ghế</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextFromCombos}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition active:scale-95 cursor-pointer"
                  >
                    <span>Tiếp tục thanh toán</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Summary */}
            {currentStep === 3 && selectedShowtime && (
              <PaymentSummary
                movie={movie}
                showtime={selectedShowtime}
                selectedSeats={selectedSeats}
                selectedCombos={selectedCombos}
                onConfirm={handlePaymentConfirm}
                onBack={handlePrevStep}
              />
            )}
          </div>

          {/* Desktop Sticky Order Summary Sidebar (4 cols) */}
          <aside className="lg:col-span-4 hidden lg:block sticky top-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-base font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-red-500" />
                Thông Tin Vé Đặt
              </h3>

              {/* Movie info snippet */}
              <div className="flex gap-3">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded-lg border border-gray-800 shadow shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="inline-block bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded mb-1">
                    {movie.ageRating || 'T16'}
                  </span>
                  <h4 className="font-bold text-sm text-white truncate">
                    {movie.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {movie.duration} phút • {movie.language}
                  </p>
                </div>
              </div>

              {/* Showtime info */}
              {selectedShowtime ? (
                <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-200">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="font-semibold truncate">{selectedShowtime.cinemaName}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-red-500" />
                      <span>{selectedShowtime.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-red-500" />
                      <span className="font-bold text-white">{selectedShowtime.startTime}</span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-[11px] border-t border-gray-700/50 pt-1.5 flex justify-between">
                    <span>Phòng: {selectedShowtime.roomName}</span>
                    <span className="text-yellow-400 font-semibold">{selectedShowtime.roomType}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/40 rounded-xl p-3 border border-dashed border-gray-700 text-xs text-gray-500 italic text-center">
                  Chưa chọn suất chiếu
                </div>
              )}

              {/* Selected Seats summary */}
              {selectedSeats.length > 0 && (
                <div className="space-y-1.5 border-t border-gray-800 pt-3">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Armchair className="w-3.5 h-3.5 text-red-500" />
                      Ghế đã chọn ({selectedSeats.length}):
                    </span>
                    <span className="text-white font-medium">
                      {formatCurrency(seatsTotal)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSeats.map((s) => (
                      <span
                        key={s.id}
                        className="bg-gray-800 text-gray-200 text-[11px] font-bold px-2 py-0.5 rounded border border-gray-700"
                      >
                        {getSeatLabel(s)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Combos summary */}
              {selectedCombos.length > 0 && (
                <div className="space-y-1.5 border-t border-gray-800 pt-3">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-red-500" />
                      Bắp nước ({selectedCombos.reduce((a, b) => a + b.quantity, 0)} món):
                    </span>
                    <span className="text-white font-medium">
                      {formatCurrency(combosTotal)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {selectedCombos.map(({ combo, quantity }) => (
                      <div
                        key={combo.id}
                        className="flex justify-between text-[11px] text-gray-300"
                      >
                        <span className="truncate max-w-[170px]">
                          {quantity}x {combo.name}
                        </span>
                        <span>{formatCurrency(combo.price * quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grand Total */}
              <div className="border-t border-gray-800 pt-4 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-gray-400">Tổng tạm tính:</span>
                <span className="text-2xl font-black text-red-500">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
