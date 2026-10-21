import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Film, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { movies as defaultMovies, cinemas } from '../../data/mockData';
import { subscribeMovies } from '../../firebase/movieService';
import { getShowtimesForMovie } from '../../utils/showtimeGenerator';

interface QuickBookingBarProps {
  onSuccess?: () => void;
}

export const QuickBookingBar: React.FC<QuickBookingBarProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [allMovies, setAllMovies] = useState(defaultMovies);

  useEffect(() => {
    const unsub = subscribeMovies((data) => {
      if (data && data.length > 0) setAllMovies(data);
    });
    return () => unsub();
  }, []);

  const nowShowingMovies = useMemo(() => {
    return allMovies.filter((m) => m.status === 'now_showing');
  }, [allMovies]);

  const [selectedMovieId, setSelectedMovieId] = useState<string>(nowShowingMovies[0]?.id || '');
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('');

  // 1. Danh sách rạp có chiếu phim đã chọn (hỗ trợ cả phim mới từ Admin)
  const availableCinemas = useMemo(() => {
    if (!selectedMovieId) return cinemas;
    const movieShowtimes = getShowtimesForMovie(selectedMovieId, cinemas);
    const cinemaIds = new Set(movieShowtimes.map((s) => s.cinemaId));
    const matched = cinemas.filter((c) => cinemaIds.has(c.id));
    return matched.length > 0 ? matched : cinemas;
  }, [selectedMovieId]);

  // Tự động chọn rạp đầu tiên nếu chưa chọn hoặc không hợp lệ
  useEffect(() => {
    if (availableCinemas.length > 0) {
      if (!availableCinemas.some((c) => c.id === selectedCinemaId)) {
        setSelectedCinemaId(availableCinemas[0].id);
      }
    } else {
      setSelectedCinemaId('');
    }
  }, [availableCinemas, selectedCinemaId]);

  // 2. Danh sách ngày chiếu của phim và rạp đã chọn
  const availableDates = useMemo(() => {
    if (!selectedMovieId || !selectedCinemaId) return [];
    const movieShowtimes = getShowtimesForMovie(selectedMovieId, cinemas);
    const matched = movieShowtimes.filter(
      (s) => s.cinemaId === selectedCinemaId
    );
    const dates = Array.from(new Set(matched.map((s) => s.date))).sort();
    return dates;
  }, [selectedMovieId, selectedCinemaId]);

  React.useEffect(() => {
    if (availableDates.length > 0) {
      if (!availableDates.includes(selectedDate)) {
        setSelectedDate(availableDates[0]);
      }
    } else {
      setSelectedDate('');
    }
  }, [availableDates, selectedDate]);

  // 3. Danh sách suất chiếu tương ứng (hỗ trợ cả phim mới từ Admin)
  const availableShowtimes = useMemo(() => {
    if (!selectedMovieId || !selectedCinemaId || !selectedDate) return [];
    const movieShowtimes = getShowtimesForMovie(selectedMovieId, cinemas);
    return movieShowtimes.filter(
      (s) =>
        s.cinemaId === selectedCinemaId &&
        s.date === selectedDate
    );
  }, [selectedMovieId, selectedCinemaId, selectedDate]);

  React.useEffect(() => {
    if (availableShowtimes.length > 0) {
      if (!availableShowtimes.some((s) => s.id === selectedShowtimeId)) {
        setSelectedShowtimeId(availableShowtimes[0].id);
      }
    } else {
      setSelectedShowtimeId('');
    }
  }, [availableShowtimes, selectedShowtimeId]);

  const handleBooking = () => {
    if (!selectedMovieId) return;
    let url = `/dat-ve/${selectedMovieId}`;
    if (selectedShowtimeId) {
      url += `?showtimeId=${selectedShowtimeId}`;
    }
    if (onSuccess) onSuccess();
    navigate(url);
  };

  return (
    <div className="bg-gray-900 border border-red-600/30 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4 text-red-500 font-bold text-base sm:text-lg">
        <Ticket className="w-5 h-5" />
        <span>Đặt Vé Nhanh Trực Tuyến</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Bước 1: Chọn Phim */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-red-400" />
            <span>1. Chọn Phim</span>
          </label>
          <select
            value={selectedMovieId}
            onChange={(e) => {
              setSelectedMovieId(e.target.value);
            }}
            className="w-full bg-gray-800 text-white text-sm rounded-xl px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-red-500 transition-colors"
          >
            {nowShowingMovies.map((movie) => (
              <option key={movie.id} value={movie.id} className="bg-gray-900 text-white">
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        {/* Bước 2: Chọn Rạp */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>2. Chọn Rạp</span>
          </label>
          <select
            value={selectedCinemaId}
            onChange={(e) => setSelectedCinemaId(e.target.value)}
            disabled={availableCinemas.length === 0}
            className="w-full bg-gray-800 text-white text-sm rounded-xl px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
          >
            {availableCinemas.length === 0 ? (
              <option value="">Không có rạp chiếu</option>
            ) : (
              availableCinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id} className="bg-gray-900 text-white">
                  {cinema.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Bước 3: Chọn Ngày */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-red-400" />
            <span>3. Chọn Ngày</span>
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={availableDates.length === 0}
            className="w-full bg-gray-800 text-white text-sm rounded-xl px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
          >
            {availableDates.length === 0 ? (
              <option value="">Chưa có lịch chiếu</option>
            ) : (
              availableDates.map((date) => (
                <option key={date} value={date} className="bg-gray-900 text-white">
                  {date}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Bước 4: Chọn Suất Chiếu & Nút Đặt */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>4. Suất Chiếu</span>
          </label>
          <select
            value={selectedShowtimeId}
            onChange={(e) => setSelectedShowtimeId(e.target.value)}
            disabled={availableShowtimes.length === 0}
            className="w-full bg-gray-800 text-white text-sm rounded-xl px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
          >
            {availableShowtimes.length === 0 ? (
              <option value="">Hết suất</option>
            ) : (
              availableShowtimes.map((st) => (
                <option key={st.id} value={st.id} className="bg-gray-900 text-white">
                  {st.startTime} ({st.roomType})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="mt-4 pt-3 border-t border-gray-800 flex justify-end">
        <button
          onClick={handleBooking}
          disabled={!selectedMovieId}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-red-600/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
        >
          <span>ĐẶT VÉ NGAY</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default QuickBookingBar;
