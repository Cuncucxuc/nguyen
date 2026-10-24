// ============================================================
// CÁC HÀM TIỆN ÍCH DÙNG CHUNG (SHARED UTILITIES)
// ============================================================

/**
 * Chuẩn hóa chuỗi tiếng Việt không dấu (lowercase, bỏ dấu, chuyển đ/Đ thành d)
 * Dùng để tìm kiếm phim, rạp, đạo diễn, diễn viên chính xác không phân biệt dấu.
 */
export const normalizeVietnamese = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

/**
 * Định dạng số tiền sang định dạng tiền tệ Việt Nam (VNĐ)
 * Ví dụ: 85000 -> "85.000đ"
 */
export const formatCurrency = (amount: number = 0): string => {
  return `${amount.toLocaleString('vi-VN')}đ`;
};

/**
 * Nhãn và kiểu hiển thị cho phân loại độ tuổi phim
 */
export const getAgeRatingInfo = (rating: string = 'P') => {
  const r = (rating || 'P').toUpperCase();
  if (r.includes('18')) {
    return {
      bg: 'bg-red-600 text-white',
      desc: 'Phim dành cho khán giả từ 18 tuổi trở lên (T18)',
      label: 'T18',
    };
  }
  if (r.includes('16')) {
    return {
      bg: 'bg-orange-500 text-white',
      desc: 'Phim dành cho khán giả từ 16 tuổi trở lên (T16)',
      label: 'T16',
    };
  }
  if (r.includes('13')) {
    return {
      bg: 'bg-amber-500 text-white',
      desc: 'Phim dành cho khán giả từ 13 tuổi trở lên (T13)',
      label: 'T13',
    };
  }
  return {
    bg: 'bg-emerald-600 text-white',
    desc: 'Phim được phép phổ biến rộng rãi cho mọi lứa tuổi (P)',
    label: 'P',
  };
};

/**
 * Hiển thị nhãn ghế chuẩn hóa (VD: F05, A01-A02 cho ghế đôi)
 */
export const getSeatLabel = (seat: { row: string; col: number; type?: string }): string => {
  if (seat.type === 'couple') {
    const startCol = (seat.col - 1) * 2 + 1;
    const endCol = startCol + 1;
    return `${seat.row}${startCol < 10 ? '0' : ''}${startCol}-${seat.row}${endCol < 10 ? '0' : ''}${endCol}`;
  }
  return `${seat.row}${seat.col < 10 ? '0' : ''}${seat.col}`;
};

/**
 * Tên tiếng Việt của loại ghế
 */
export const getSeatTypeName = (type?: string): string => {
  switch (type) {
    case 'couple':
      return 'Ghế Đôi';
    case 'vip':
      return 'Ghế VIP';
    default:
      return 'Ghế Thường';
  }
};

/**
 * Định dạng ngày xem (VD: "Thứ 2", "19/10")
 */
export const formatDateLabel = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { dayOfWeek: 'Ngày', dateNum: dateStr };
    }
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayOfWeek = dayNames[d.getDay()];
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return { dayOfWeek, dateNum: `${day}/${month}` };
  } catch {
    return { dayOfWeek: 'Ngày', dateNum: dateStr };
  }
};

/**
 * Kiểm tra xem một suất chiếu đã qua thời gian hiện tại hay chưa.
 * @param dateStr Ngày chiếu định dạng 'YYYY-MM-DD'
 * @param startTimeStr Giờ chiếu định dạng 'HH:MM' (24h)
 * @returns true nếu thời gian chiếu đã trôi qua so với hiện tại (quá giờ trong cùng ngày hoặc ngày cũ)
 */
export const isShowtimePast = (dateStr?: string, startTimeStr?: string): boolean => {
  if (!dateStr || !startTimeStr) return false;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  // Nếu ngày chiếu trong quá khứ -> đã hết hạn
  if (dateStr < todayStr) return true;
  // Nếu ngày chiếu trong tương lai -> còn hạn
  if (dateStr > todayStr) return false;

  // Nếu trong cùng ngày hôm nay: so sánh giờ và phút
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const [stHour, stMinute] = startTimeStr.split(':').map((val) => parseInt(val, 10));
  if (isNaN(stHour) || isNaN(stMinute)) return false;

  if (stHour < currentHour) return true;
  if (stHour === currentHour && stMinute <= currentMinute) return true;

  return false;
};

