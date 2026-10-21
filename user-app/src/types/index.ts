// ============================================================
// ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU DÙNG CHUNG TRONG ỨNG DỤNG
// ============================================================

/** Thông tin cơ bản của một bộ phim */
export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  director: string;
  cast: string[];
  poster: string;
  trailer: string;
  duration: number; // Đơn vị: phút
  rating: number;   // Thang điểm 10
  releaseDate: string;
  status: 'now_showing' | 'coming_soon' | 'ended';
  language: string;
  format: string[]; // Ví dụ: ['2D', 'IMAX', '3D']
  ageRating: string; // Ví dụ: 'T18', 'P', 'T13'
}

/** Thông tin rạp chiếu phim */
export interface Cinema {
  id: string;
  name: string;
  address: string;
  image: string;
}

/** Suất chiếu phim tại một rạp cụ thể */
export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  cinemaName: string;
  roomId: string;
  roomName: string;
  roomType: string; // Ví dụ: '2D Digital', 'IMAX Laser'
  startTime: string; // Định dạng 'HH:MM'
  date: string;      // Định dạng 'YYYY-MM-DD'
  price: {
    standard: number; // Giá ghế thường (VNĐ)
    vip: number;      // Giá ghế VIP (VNĐ)
    couple: number;   // Giá ghế đôi (VNĐ)
  };
}

/** Thông tin một ghế trong phòng chiếu */
export interface Seat {
  id: string;
  row: string; // Hàng ghế, ví dụ: 'A', 'B'
  col: number; // Cột ghế (số)
  type: 'standard' | 'vip' | 'couple';
  status: 'available' | 'held' | 'booked';
  price: number; // Đơn vị: VNĐ
}

/** Combo bắp nước */
export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number; // Đơn vị: VNĐ
  image: string;
  items: string[];
}

/** Combo đã được chọn kèm số lượng */
export interface SelectedCombo {
  combo: Combo;
  quantity: number;
}

/**
 * Thông tin đơn đặt vé.
 * Dùng `date` + `startTime` để hiển thị ngày/giờ chiếu.
 * Dùng `seatLabels` để hiển thị nhãn ghế (ví dụ: ['F05', 'F06']).
 * Dùng `totalPrice` cho tổng tiền thanh toán.
 */
export interface Booking {
  id: string;
  orderId?: string;  // Mã đơn hàng (định dạng: CV-YYYYMMDD-XXX)
  showtimeId?: string; // ID suất chiếu liên kết
  movieId?: string;
  movieTitle: string;
  moviePoster: string;
  cinemaId?: string;
  cinemaName: string;
  roomId?: string;
  roomName: string;
  date?: string;       // Ngày chiếu (YYYY-MM-DD)
  startTime?: string;  // Giờ chiếu (HH:MM)
  seatLabels?: string[]; // Nhãn ghế hiển thị, ví dụ: ['E07', 'E08']
  seats?: Seat[];        // Đối tượng ghế đầy đủ (từ luồng đặt vé mới)
  combos?: { name: string; quantity: number; price: number }[];
  totalPrice?: number; // Tổng tiền thanh toán (VNĐ)
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: string;
  createdAt: string;
}

/** Thông tin hồ sơ người dùng */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phone: string;
  points: number; // Điểm tích lũy thành viên
}

/** Thông tin chương trình khuyến mãi */
export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  code: string;       // Mã khuyến mãi để nhập khi thanh toán
  discount: string;  // Mô tả mức giảm (ví dụ: 'Giảm 50.000đ')
  validUntil: string;
  terms: string[];   // Điều kiện áp dụng
  tag: string;
}

