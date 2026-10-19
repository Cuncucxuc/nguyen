import React, { useMemo, useState } from 'react';
import { AlertCircle, Armchair, Info, X } from 'lucide-react';
import { Seat, Showtime } from '../../types';
import { getSeatLabel, getSeatTypeName, formatCurrency } from '../../utils';

interface SeatMapProps {
  showtime: Showtime;
  selectedSeats: Seat[];
  onSeatChange: (seats: Seat[]) => void;
  maxSeats?: number;
}

// PRNG for consistent booked seats generation per showtime
const getSeededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  return () => {
    hash = (hash * 16807) % 2147483647;
    return (hash - 1) / 2147483646;
  };
};

export const SeatMap: React.FC<SeatMapProps> = ({
  showtime,
  selectedSeats,
  onSeatChange,
  maxSeats = 8,
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Generate 8 rows (A-H)
  // Rows A-B: couple (6 double seats = 12 cols span)
  // Rows C-D: VIP (12 cols)
  // Rows E-H: standard (12 cols)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const allSeats = useMemo<Seat[]>(() => {
    const random = getSeededRandom(showtime.id);
    const seats: Seat[] = [];

    rows.forEach((row) => {
      const isCoupleRow = row === 'A' || row === 'B';
      const isVipRow = row === 'C' || row === 'D';
      const type: 'couple' | 'vip' | 'standard' = isCoupleRow
        ? 'couple'
        : isVipRow
        ? 'vip'
        : 'standard';

      const price =
        type === 'couple'
          ? showtime.price.couple
          : type === 'vip'
          ? showtime.price.vip
          : showtime.price.standard;

      // 6 seats for couple rows (each double-wide), 12 for standard/VIP
      const colCount = isCoupleRow ? 6 : 12;

      for (let col = 1; col <= colCount; col++) {
        // ~20% seeded chance of being booked
        const isBooked = random() < 0.22;

        seats.push({
          id: `${showtime.id}-${row}${col}`,
          row,
          col,
          type,
          status: isBooked ? 'booked' : 'available',
          price,
        });
      }
    });

    return seats;
  }, [showtime.id, showtime.price]);

  // Handle seat click
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'booked') return;

    setWarningMessage(null);
    const isSelected = selectedSeats.some((s) => s.id === seat.id);

    if (isSelected) {
      // Deselect
      onSeatChange(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      // Check max seats limit
      if (selectedSeats.length >= maxSeats) {
        setWarningMessage(`Bạn chỉ có thể chọn tối đa ${maxSeats} ghế cho mỗi lần đặt vé.`);
        return;
      }
      onSeatChange([...selectedSeats, seat]);
    }
  };

  // Group seats by row for rendering
  const seatsByRow = useMemo(() => {
    const map = new Map<string, Seat[]>();
    rows.forEach((r) => map.set(r, []));
    allSeats.forEach((seat) => {
      map.get(seat.row)?.push(seat);
    });
    return map;
  }, [allSeats]);

  // Selected seats subtotal
  const subtotal = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  return (
    <div className="w-full space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Armchair className="w-6 h-6 text-red-600" />
            Chọn Ghế Ngồi
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Phòng: <span className="text-white font-medium">{showtime.roomName}</span> ({showtime.roomType}) • Tối đa {maxSeats} ghế/lần đặt
          </p>
        </div>

        {/* Floating Tooltip / Live Seat Info */}
        <div className="h-9 flex items-center">
          {hoveredSeat ? (
            <div className="bg-gray-800 border border-gray-700 px-3 py-1 rounded-lg text-xs text-gray-200 flex items-center gap-2 animate-fadeIn">
              <span className="font-bold text-white">{getSeatLabel(hoveredSeat)}</span>
              <span className="text-gray-400">•</span>
              <span className="text-yellow-400 font-medium">{getSeatTypeName(hoveredSeat.type)}</span>
              <span className="text-gray-400">•</span>
              <span className="text-red-400 font-bold">{formatCurrency(hoveredSeat.price)}</span>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic hidden sm:flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Di chuột lên ghế để xem chi tiết loại ghế và giá
            </div>
          )}
        </div>
      </div>

      {/* Warning message if max seats exceeded */}
      {warningMessage && (
        <div className="p-3 bg-red-950/80 border border-red-700/80 rounded-xl text-red-200 text-xs sm:text-sm flex items-center justify-between animate-shake">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{warningMessage}</span>
          </div>
          <button
            onClick={() => setWarningMessage(null)}
            className="text-red-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Screen & Seat Map Container */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-8 overflow-hidden shadow-2xl relative">
        {/* Glow Screen Indicator */}
        <div className="w-full max-w-xl mx-auto mb-10 text-center">
          <div className="relative mb-2">
            <div className="h-1.5 w-3/4 max-w-md mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
            <div className="h-6 w-3/4 max-w-md mx-auto bg-gradient-to-b from-red-500/25 via-red-500/5 to-transparent blur-md rounded-t-full" />
          </div>
          <span className="text-[11px] font-bold tracking-[0.35em] text-gray-400 uppercase">
            MÀN HÌNH
          </span>
        </div>

        {/* Scrollable Map for mobile devices */}
        <div className="overflow-x-auto pb-4 pt-2 flex justify-center scrollbar-thin scrollbar-thumb-gray-700">
          <div className="inline-flex flex-col space-y-2 min-w-max px-2">
            {rows.map((row) => {
              const rowSeats = seatsByRow.get(row) || [];
              const isCoupleRow = row === 'A' || row === 'B';

              return (
                <div key={row} className="flex items-center justify-center space-x-2">
                  {/* Left Row Label */}
                  <div className="w-6 text-center text-xs font-bold text-gray-400 select-none">
                    {row}
                  </div>

                  {/* Seats in Row */}
                  <div className="flex items-center">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeats.some((s) => s.id === seat.id);
                      const isBooked = seat.status === 'booked';
                      const label = getSeatLabel(seat);

                      // Style determination
                      let seatClasses = '';
                      if (isBooked) {
                        seatClasses = 'bg-gray-800 text-gray-600 border border-gray-800 cursor-not-allowed opacity-60';
                      } else if (isSelected) {
                        seatClasses = 'bg-red-500 text-white ring-2 ring-red-400 shadow-lg shadow-red-500/50 scale-105 z-10';
                      } else if (seat.type === 'couple') {
                        seatClasses = 'bg-pink-700 hover:bg-pink-500 text-white cursor-pointer';
                      } else if (seat.type === 'vip') {
                        seatClasses = 'bg-purple-700 hover:bg-purple-500 text-white cursor-pointer';
                      } else {
                        seatClasses = 'bg-gray-600 hover:bg-blue-500 text-gray-200 cursor-pointer';
                      }

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          title={`${label} - ${getSeatTypeName(seat.type)} - ${formatCurrency(seat.price)}`}
                          className={`h-8 rounded-t-lg m-1 text-[11px] font-semibold flex items-center justify-center transition-all duration-150 transform active:scale-90 select-none ${
                            isCoupleRow ? 'w-16' : 'w-8'
                          } ${seatClasses}`}
                        >
                          {isBooked ? '✕' : seat.type === 'couple' ? `${seat.row}${seat.col}` : seat.col}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Row Label */}
                  <div className="w-6 text-center text-xs font-bold text-gray-400 select-none">
                    {row}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-t-md bg-gray-600 inline-block" />
            <span>Ghế thường ({formatCurrency(showtime.price.standard)})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-t-md bg-purple-700 inline-block" />
            <span>Ghế VIP ({formatCurrency(showtime.price.vip)})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 h-5 rounded-t-md bg-pink-700 inline-block" />
            <span>Ghế đôi ({formatCurrency(showtime.price.couple)})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-t-md bg-red-500 ring-2 ring-red-400 inline-block" />
            <span className="font-medium text-white">Đang chọn</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-t-md bg-gray-800 text-gray-600 flex items-center justify-center text-[10px] inline-block text-center leading-5">
              ✕
            </span>
            <span className="text-gray-500">Đã bán</span>
          </div>
        </div>
      </div>

      {/* Selected Seats Summary Box */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider block mb-1">
            Ghế đã chọn ({selectedSeats.length}):
          </span>
          {selectedSeats.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 items-center">
              {selectedSeats.map((seat) => (
                <span
                  key={seat.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/80 border border-red-700/60 text-white text-xs font-semibold"
                >
                  <span>{getSeatLabel(seat)}</span>
                  <span className="text-[10px] text-red-300">({getSeatTypeName(seat.type)})</span>
                  <button
                    type="button"
                    onClick={() => handleSeatClick(seat)}
                    className="hover:text-red-400 ml-0.5"
                    title="Xoá ghế"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Vui lòng chọn ít nhất 1 ghế để tiếp tục</p>
          )}
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-gray-800 pt-3 sm:pt-0">
          <span className="text-xs text-gray-400">Tạm tính tiền ghế:</span>
          <span className="text-xl sm:text-2xl font-black text-red-500">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
