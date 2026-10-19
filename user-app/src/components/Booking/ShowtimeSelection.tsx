import React, { useState, useMemo } from 'react';
import { MapPin, Calendar, Clock, Film, Sparkles, ChevronRight, CalendarX } from 'lucide-react';
import { Showtime, Cinema } from '../../types';
import { showtimes as allShowtimes, cinemas as allCinemas } from '../../data/mockData';
import { formatCurrency } from '../../utils';

interface ShowtimeSelectionProps {
  movieId: string;
  onSelect: (showtime: Showtime) => void;
  selectedShowtime: Showtime | null;
}

interface DateItem {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: string; // T2, T3, ..., CN
  formattedDate: string; // dd/MM
  isToday: boolean;
  rawDate: Date;
}

export const ShowtimeSelection: React.FC<ShowtimeSelectionProps> = ({
  movieId,
  onSelect,
  selectedShowtime,
}) => {
  // Generate next 7 days
  const next7Days = useMemo<DateItem[]>(() => {
    const days: DateItem[] = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const dayOfWeek = dayNames[d.getDay()];
      const formattedDate = `${day}/${m}`;

      days.push({
        dateStr,
        dayOfWeek,
        formattedDate,
        isToday: i === 0,
        rawDate: d,
      });
    }
    return days;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (selectedShowtime?.date) {
      return selectedShowtime.date;
    }
    return next7Days[0]?.dateStr || '';
  });

  // Filter showtimes for the movie and selected date
  const filteredShowtimes = useMemo(() => {
    return allShowtimes.filter(
      (st) => st.movieId === movieId && st.date === selectedDate
    );
  }, [movieId, selectedDate]);

  // Group showtimes by Cinema
  const showtimesByCinema = useMemo(() => {
    const map = new Map<string, { cinema: Cinema; showtimes: Showtime[] }>();

    filteredShowtimes.forEach((st) => {
      let cinemaData = allCinemas.find((c) => c.id === st.cinemaId);
      if (!cinemaData) {
        cinemaData = {
          id: st.cinemaId,
          name: st.cinemaName,
          address: 'Địa chỉ đang cập nhật',
          image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
        };
      }

      if (!map.has(st.cinemaId)) {
        map.set(st.cinemaId, {
          cinema: cinemaData,
          showtimes: [],
        });
      }
      map.get(st.cinemaId)!.showtimes.push(st);
    });

    // Sort showtimes by start time inside each cinema
    map.forEach((item) => {
      item.showtimes.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return Array.from(map.values());
  }, [filteredShowtimes]);

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Title & Instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-red-600" />
            Chọn Ngày & Suất Chiếu
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Vui lòng chọn ngày và rạp chiếu phù hợp để tiếp tục đặt vé
          </p>
        </div>

        {selectedShowtime && (
          <div className="text-xs bg-red-950/60 border border-red-800 text-red-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5" />
            Đã chọn: <strong className="text-white">{selectedShowtime.startTime} - {selectedShowtime.cinemaName}</strong>
          </div>
        )}
      </div>

      {/* Date Picker Horizontal Bar */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Chọn ngày xem phim:
        </label>
        <div className="flex items-center space-x-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {next7Days.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                type="button"
                className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[76px] sm:min-w-[88px] py-3 px-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30 scale-105'
                    : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700 hover:text-white'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {item.isToday ? (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${isSelected ? 'bg-white text-red-600 font-bold' : 'bg-red-600/30 text-red-400 font-semibold'}`}>
                      Hôm Nay
                    </span>
                  ) : (
                    item.dayOfWeek
                  )}
                </span>
                <span className="text-base sm:text-lg font-bold mt-1 tracking-tight">
                  {item.formattedDate}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Showtimes List Grouped by Cinema */}
      <div className="space-y-6">
        {showtimesByCinema.length > 0 ? (
          showtimesByCinema.map(({ cinema, showtimes }) => (
            <div
              key={cinema.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:border-gray-700 shadow-md"
            >
              {/* Cinema Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-gray-800/80 gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                      {cinema.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{cinema.address}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center text-xs text-gray-400 bg-gray-800/60 px-2.5 py-1 rounded-md">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{showtimes.length} suất chiếu</span>
                </div>
              </div>

              {/* Showtime Buttons Grid */}
              <div className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {showtimes.map((st) => {
                    const isSelected = selectedShowtime?.id === st.id;
                    const formatBadge = st.roomType || '2D';

                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => onSelect(st)}
                        className={`group relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? 'border-red-500 bg-red-600/20 ring-2 ring-red-500/50 shadow-md shadow-red-600/20'
                            : 'border-gray-800 bg-gray-800/60 hover:bg-gray-800 hover:border-red-500/50 hover:shadow'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-lg font-extrabold tracking-tight ${
                              isSelected ? 'text-red-400' : 'text-white group-hover:text-red-300'
                            }`}
                          >
                            {st.startTime}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              formatBadge.includes('IMAX')
                                ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                                : formatBadge.includes('VIP')
                                ? 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {formatBadge}
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-400 flex items-center justify-between mt-1">
                          <span className="truncate max-w-[90px]">{st.roomName}</span>
                          <span className="text-red-400 font-semibold group-hover:text-red-300">
                            từ {formatCurrency(st.price.standard)}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
              <CalendarX className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-semibold text-white">
              Không có suất chiếu nào vào ngày này
            </h4>
            <p className="text-sm text-gray-400 max-w-md">
              Hiện tại rạp chưa mở lịch chiếu cho ngày được chọn. Vui lòng chọn ngày khác trong thanh lịch chiếu ở trên để tiếp tục đặt vé.
            </p>
            {next7Days.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedDate(next7Days[0].dateStr)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
              >
                <span>Xem suất chiếu hôm nay</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowtimeSelection;
