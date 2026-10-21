import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  Armchair,
  Info,
  X,
  Sparkles,
  Heart,
  RefreshCw,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { Seat, Showtime } from '../../types';
import { getSeatLabel, getSeatTypeName, formatCurrency } from '../../utils';
import { subscribeBookedSeatsForShowtime } from '../../firebase/bookingService';

interface SeatMapProps {
  showtime: Showtime;
  selectedSeats: Seat[];
  onSeatChange: (seats: Seat[]) => void;
  maxSeats?: number;
  movieTitle?: string;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  showtime,
  selectedSeats,
  onSeatChange,
  maxSeats = 8,
  movieTitle,
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [realtimeBookedLabels, setRealtimeBookedLabels] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Lắng nghe realtime các ghế đã được đặt thực tế trên Firebase Firestore & LocalStorage
  useEffect(() => {
    const unsubscribe = subscribeBookedSeatsForShowtime(
      showtime,
      (bookedLabels) => {
        setRealtimeBookedLabels(bookedLabels);

        // Kiểm tra va chạm: nếu ghế người dùng đang chọn vừa bị người khác đặt trên Firestore
        if (selectedSeats.length > 0 && bookedLabels.length > 0) {
          const conflictSeats = selectedSeats.filter((s) => {
            const lbl = getSeatLabel(s);
            return bookedLabels.includes(lbl) || bookedLabels.includes(s.id);
          });

          if (conflictSeats.length > 0) {
            const conflictLabels = conflictSeats.map((s) => getSeatLabel(s)).join(', ');
            setWarningMessage(
              `⚠️ Ghế ${conflictLabels} vừa được người khác thanh toán trước trên hệ thống! Hệ thống đã bỏ chọn ghế này.`
            );
            onSeatChange(selectedSeats.filter((s) => !conflictSeats.some((cs) => cs.id === s.id)));
          }
        }
      },
      movieTitle
    );

    return () => unsubscribe();
  }, [showtime.id, showtime.date, showtime.startTime, showtime.roomName, showtime.cinemaName, movieTitle]);

  // Cấu hình hàng ghế dựa theo loại phòng chiếu
  const roomConfig = useMemo(() => {
    const type = (showtime.roomType || '').toLowerCase();
    if (type.includes('gold') || type.includes('vip')) {
      return {
        rows: ['A', 'B', 'C', 'D', 'E', 'F'],
        coupleRows: ['A', 'B'],
        vipRows: ['C', 'D', 'E', 'F'],
        name: 'Phòng VIP Hạng Sang',
      };
    }
    if (type.includes('imax')) {
      return {
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        coupleRows: ['A', 'B'],
        vipRows: ['C', 'D', 'E', 'F'],
        name: 'Phòng IMAX Laser Trải Nghiệm Lớn',
      };
    }
    // Mặc định phòng 2D tiêu chuẩn
    return {
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      coupleRows: ['A', 'B'],
      vipRows: ['C', 'D'],
      name: 'Phòng Chiếu Tiêu Chuẩn',
    };
  }, [showtime.roomType]);

  const rows = roomConfig.rows;

  // Khởi tạo toàn bộ danh sách ghế (chỉ khóa ghế khi thực tế được đặt trên Firebase)
  const allSeats = useMemo<Seat[]>(() => {
    const seats: Seat[] = [];
    const bookedSet = new Set(realtimeBookedLabels);

    rows.forEach((row) => {
      const isCoupleRow = roomConfig.coupleRows.includes(row);
      const isVipRow = roomConfig.vipRows.includes(row);
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

      const colCount = isCoupleRow ? 6 : 12;

      for (let col = 1; col <= colCount; col++) {
        const seatObj = {
          row,
          col,
          type,
        };
        const label = getSeatLabel(seatObj);
        const seatId = `${showtime.id}-${row}${col}`;

        // Ghế chỉ bị khóa khi THỰC TẾ đã được đặt trên Firebase Firestore hoặc LocalStorage
        const isBooked = bookedSet.has(label) || bookedSet.has(seatId);

        seats.push({
          id: seatId,
          row,
          col,
          type,
          status: isBooked ? 'booked' : 'available',
          price,
        });
      }
    });

    return seats;
  }, [showtime.id, showtime.price, realtimeBookedLabels, roomConfig]);

  // Thống kê sức chứa phòng chiếu
  const stats = useMemo(() => {
    const total = allSeats.length;
    const booked = allSeats.filter((s) => s.status === 'booked').length;
    const available = total - booked;
    const percent = total > 0 ? Math.round((booked / total) * 100) : 0;
    return { total, booked, available, percent };
  }, [allSeats]);

  // Nhóm ghế theo hàng
  const seatsByRow = useMemo(() => {
    const map = new Map<string, Seat[]>();
    rows.forEach((r) => map.set(r, []));
    allSeats.forEach((seat) => {
      map.get(seat.row)?.push(seat);
    });
    return map;
  }, [allSeats, rows]);

  // Xử lý khi người dùng bấm chọn ghế
  const handleSeatClick = useCallback(
    (seat: Seat) => {
      if (seat.status === 'booked') return;

      setWarningMessage(null);
      setSuccessNotice(null);
      const isSelected = selectedSeats.some((s) => s.id === seat.id);

      if (isSelected) {
        // Hủy chọn
        onSeatChange(selectedSeats.filter((s) => s.id !== seat.id));
      } else {
        // Kiểm tra giới hạn số ghế tối đa
        if (selectedSeats.length >= maxSeats) {
          setWarningMessage(`Bạn chỉ có thể chọn tối đa ${maxSeats} ghế cho mỗi lần đặt vé.`);
          return;
        }

        // Quy tắc kiểm tra không để lại 1 ghế trống đơn độc (Orphan Seat Check)
        const rowSeats = seatsByRow.get(seat.row) || [];
        const seatIdx = rowSeats.findIndex((s) => s.id === seat.id);
        if (seatIdx !== -1 && seat.type !== 'couple') {
          // Kiểm tra bên trái
          if (seatIdx >= 2) {
            const left1 = rowSeats[seatIdx - 1];
            const left2 = rowSeats[seatIdx - 2];
            const isLeft1Empty = left1.status === 'available' && !selectedSeats.some((s) => s.id === left1.id);
            const isLeft2Occupied = left2.status === 'booked' || selectedSeats.some((s) => s.id === left2.id);
            if (isLeft1Empty && isLeft2Occupied) {
              setWarningMessage(`Lưu ý: Ghế ${getSeatLabel(left1)} bị để trống đơn độc. Rạp khuyên bạn nên chọn liền kề!`);
            }
          }
        }

        onSeatChange([...selectedSeats, seat]);
      }
    },
    [maxSeats, onSeatChange, selectedSeats, seatsByRow]
  );

  // 1. Tự động gợi ý 2 ghế VIP đẹp nhất trung tâm
  const handleAutoSelectBestVip = () => {
    setWarningMessage(null);
    const vipSeats = allSeats.filter((s) => s.type === 'vip' && s.status === 'available');

    // Tìm 2 ghế VIP liền kề gần trung tâm nhất (cột 6 & 7)
    let bestPair: Seat[] | null = null;
    for (const r of roomConfig.vipRows) {
      const rowVips = vipSeats.filter((s) => s.row === r);
      for (let i = 0; i < rowVips.length - 1; i++) {
        if (rowVips[i + 1].col === rowVips[i].col + 1) {
          // Ưu tiên cột 5,6 hoặc 6,7 hoặc 7,8
          if (rowVips[i].col >= 5 && rowVips[i].col <= 7) {
            bestPair = [rowVips[i], rowVips[i + 1]];
            break;
          }
          if (!bestPair) {
            bestPair = [rowVips[i], rowVips[i + 1]];
          }
        }
      }
      if (bestPair && bestPair[0].col >= 5 && bestPair[0].col <= 7) break;
    }

    if (bestPair) {
      onSeatChange(bestPair);
      setSuccessNotice(`✨ Đã tự động chọn 2 ghế VIP đẹp nhất trung tâm: ${bestPair.map((s) => getSeatLabel(s)).join(', ')}`);
    } else if (vipSeats.length > 0) {
      onSeatChange(vipSeats.slice(0, 2));
      setSuccessNotice(`✨ Đã chọn ghế VIP khả dụng: ${vipSeats.slice(0, 2).map((s) => getSeatLabel(s)).join(', ')}`);
    } else {
      setWarningMessage('Khu vực ghế VIP hiện đã hết chỗ trống!');
    }
  };

  // 2. Tự động chọn cặp ghế Couple ngọt ngào
  const handleAutoSelectCouple = () => {
    setWarningMessage(null);
    const availableCouples = allSeats.filter((s) => s.type === 'couple' && s.status === 'available');

    if (availableCouples.length > 0) {
      // Ưu tiên vị trí giữa (cột 3 hoặc 4)
      const centerCouple =
        availableCouples.find((s) => s.col === 3 || s.col === 4) || availableCouples[0];
      onSeatChange([centerCouple]);
      setSuccessNotice(`💕 Đã chọn ghế đôi Couple lãng mạn: ${getSeatLabel(centerCouple)}`);
    } else {
      setWarningMessage('Các ghế đôi Couple của phòng chiếu này hiện đã được đặt hết!');
    }
  };

  // 3. Tự động chọn 2 ghế thường giá tốt ở trung tâm
  const handleAutoSelectStandard = () => {
    setWarningMessage(null);
    const standardSeats = allSeats.filter((s) => s.type === 'standard' && s.status === 'available');

    // Tìm 2 ghế thường liền kề ở hàng E hoặc F
    let bestPair: Seat[] | null = null;
    const targetRows = ['E', 'F', 'G', 'H'];
    for (const r of targetRows) {
      const rowStds = standardSeats.filter((s) => s.row === r);
      for (let i = 0; i < rowStds.length - 1; i++) {
        if (rowStds[i + 1].col === rowStds[i].col + 1) {
          if (rowStds[i].col >= 5 && rowStds[i].col <= 7) {
            bestPair = [rowStds[i], rowStds[i + 1]];
            break;
          }
          if (!bestPair) bestPair = [rowStds[i], rowStds[i + 1]];
        }
      }
      if (bestPair && bestPair[0].col >= 5 && bestPair[0].col <= 7) break;
    }

    if (bestPair) {
      onSeatChange(bestPair);
      setSuccessNotice(`🎟️ Đã chọn 2 ghế tiêu chuẩn góc nhìn đẹp: ${bestPair.map((s) => getSeatLabel(s)).join(', ')}`);
    } else if (standardSeats.length > 0) {
      onSeatChange(standardSeats.slice(0, 2));
      setSuccessNotice(`🎟️ Đã chọn ghế tiêu chuẩn: ${standardSeats.slice(0, 2).map((s) => getSeatLabel(s)).join(', ')}`);
    } else {
      setWarningMessage('Khu vực ghế thường hiện đã hết chỗ!');
    }
  };

  // 4. Bỏ chọn tất cả ghế
  const handleClearSelection = () => {
    onSeatChange([]);
    setWarningMessage(null);
    setSuccessNotice(null);
  };

  // 5. Làm mới trạng thái từ Firebase
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setSuccessNotice(null);
    setTimeout(() => {
      setIsRefreshing(false);
      setSuccessNotice('🔄 Đã làm mới trạng thái ghế ngồi trực tiếp từ Firebase Firestore!');
    }, 450);
  };

  // Tổng tiền tạm tính cho các ghế đang chọn
  const subtotal = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }, [selectedSeats]);

  return (
    <div className="w-full space-y-6">
      {/* Header Info & Room Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-gray-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Armchair className="w-6 h-6 text-red-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Chọn Ghế Ngồi
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Realtime Firebase
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Phòng: <span className="text-white font-medium">{showtime.roomName}</span> ({showtime.roomType}) • Tối đa {maxSeats} ghế/lần đặt
          </p>
        </div>

        {/* Thanh thống kê trực quan phòng chiếu */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-gray-300">
            <span>Tổng: <strong className="text-white">{stats.total}</strong> ghế</span>
            <span className="text-gray-600">|</span>
            <span className="text-emerald-400">Còn trống: <strong>{stats.available}</strong></span>
            <span className="text-gray-600">|</span>
            <span className="text-red-400">Đã đặt: <strong>{stats.booked}</strong> ({stats.percent}%)</span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            title="Làm mới trạng thái từ Firebase"
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
            <span className="text-[11px] font-medium hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Bộ nút hỗ trợ chọn ghế CHỦ ĐỘNG (Active Smart Selection Bar) */}
      <div className="bg-gradient-to-r from-red-950/30 via-gray-900 to-gray-900 border border-red-900/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            Chọn Nhanh Ghế Đẹp:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoSelectBestVip}
            className="px-3 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Gợi Ý Ghế VIP Trung Tâm</span>
          </button>

          <button
            type="button"
            onClick={handleAutoSelectCouple}
            className="px-3 py-1.5 rounded-lg bg-pink-900/60 hover:bg-pink-800 border border-pink-500/40 text-pink-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>Ghế Đôi Couple</span>
          </button>

          <button
            type="button"
            onClick={handleAutoSelectStandard}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Ghế Thường Giá Tốt</span>
          </button>

          {selectedSeats.length > 0 && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/50 text-red-300 hover:text-white text-xs font-medium transition-all"
            >
              Xóa chọn ({selectedSeats.length})
            </button>
          )}
        </div>
      </div>

      {/* Thông báo thành công hoặc cảnh báo */}
      {successNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600/70 rounded-xl text-emerald-200 text-xs sm:text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            <div className="h-2 w-3/4 max-w-md mx-auto bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full shadow-[0_0_25px_rgba(239,68,68,0.9)]" />
            <div className="h-7 w-3/4 max-w-md mx-auto bg-gradient-to-b from-red-500/30 via-red-500/10 to-transparent blur-md rounded-t-full" />
          </div>
          <span className="text-[11px] font-extrabold tracking-[0.4em] text-gray-400 uppercase">
            MÀN HÌNH CHIẾU PHIM
          </span>
        </div>

        {/* Floating Tooltip khi hover ghế */}
        <div className="min-h-[28px] flex items-center justify-center mb-3">
          {hoveredSeat ? (
            <div className="bg-gray-800/90 border border-gray-700 px-3.5 py-1 rounded-lg text-xs text-gray-200 flex items-center gap-2 shadow-lg animate-fadeIn">
              <span className="font-bold text-white">{getSeatLabel(hoveredSeat)}</span>
              <span className="text-gray-500">•</span>
              <span className="text-yellow-400 font-semibold">{getSeatTypeName(hoveredSeat.type)}</span>
              <span className="text-gray-500">•</span>
              <span className="text-red-400 font-bold">{formatCurrency(hoveredSeat.price)}</span>
              <span className="text-gray-500">•</span>
              <span className={hoveredSeat.status === 'booked' ? 'text-red-400' : 'text-emerald-400 font-medium'}>
                {hoveredSeat.status === 'booked' ? 'Đã bán' : 'Còn trống'}
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic hidden sm:flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              Di chuột lên ghế để xem chi tiết vị trí và giá vé
            </div>
          )}
        </div>

        {/* Sơ đồ ghế cuộn ngang mượt mà trên mobile */}
        <div className="overflow-x-auto pb-4 pt-2 flex justify-center scrollbar-thin scrollbar-thumb-gray-700">
          <div className="inline-flex flex-col space-y-2.5 min-w-max px-2">
            {rows.map((row) => {
              const rowSeats = seatsByRow.get(row) || [];
              const isCoupleRow = roomConfig.coupleRows.includes(row);

              return (
                <div key={row} className="flex items-center justify-center space-x-2">
                  {/* Nhãn hàng ghế bên trái */}
                  <div className="w-6 text-center text-xs font-bold text-gray-400 select-none">
                    {row}
                  </div>

                  {/* Danh sách ghế trong hàng */}
                  <div className="flex items-center">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeats.some((s) => s.id === seat.id);
                      const isBooked = seat.status === 'booked';
                      const label = getSeatLabel(seat);

                      let seatClasses = '';
                      if (isBooked) {
                        seatClasses = 'bg-gray-800 text-gray-600 border border-gray-800 cursor-not-allowed opacity-60';
                      } else if (isSelected) {
                        seatClasses = 'bg-red-500 text-white ring-2 ring-red-400 shadow-lg shadow-red-500/50 scale-105 z-10';
                      } else if (seat.type === 'couple') {
                        seatClasses = 'bg-pink-700 hover:bg-pink-500 text-white cursor-pointer hover:shadow-md hover:shadow-pink-500/30';
                      } else if (seat.type === 'vip') {
                        seatClasses = 'bg-purple-700 hover:bg-purple-500 text-white cursor-pointer hover:shadow-md hover:shadow-purple-500/30';
                      } else {
                        seatClasses = 'bg-gray-700 hover:bg-blue-600 text-gray-200 cursor-pointer';
                      }

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          title={`${label} - ${getSeatTypeName(seat.type)} - ${formatCurrency(seat.price)} ${
                            isBooked ? '(Đã được đặt)' : ''
                          }`}
                          className={`h-8 rounded-t-lg m-1 text-[11px] font-semibold flex items-center justify-center transition-all duration-150 transform active:scale-90 select-none ${
                            isCoupleRow ? 'w-16' : 'w-8'
                          } ${seatClasses}`}
                        >
                          {isBooked ? '✕' : seat.type === 'couple' ? `${seat.row}${seat.col}` : seat.col}
                        </button>
                      );
                    })}
                  </div>

                  {/* Nhãn hàng ghế bên phải */}
                  <div className="w-6 text-center text-xs font-bold text-gray-400 select-none">
                    {row}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chú thích màu sắc các loại ghế */}
        <div className="mt-8 pt-6 border-t border-gray-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-t-md bg-gray-700 inline-block" />
            <span>Ghế thường ({formatCurrency(showtime.price.standard)})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-t-md bg-purple-700 inline-block" />
            <span>Ghế VIP ({formatCurrency(showtime.price.vip)})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 h-5 rounded-t-md bg-pink-700 inline-block" />
            <span>Ghế đôi Couple ({formatCurrency(showtime.price.couple)})</span>
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

      {/* Hộp tổng kết ghế đã chọn */}
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
                    className="hover:text-red-400 ml-0.5 text-sm font-bold"
                    title="Xoá ghế"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Vui lòng chọn ít nhất 1 ghế hoặc dùng các nút gợi ý nhanh ở trên</p>
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
