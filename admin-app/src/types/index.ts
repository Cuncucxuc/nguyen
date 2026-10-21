export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  director: string;
  cast: string[];
  poster: string;
  trailer: string;
  duration: number; // Phút
  rating: number;   // Thang 10
  releaseDate: string;
  status: 'now_showing' | 'coming_soon' | 'ended';
  language: string;
  format: string[]; // ['2D', '3D', 'IMAX']
  ageRating: string; // 'P', 'T13', 'T16', 'T18'
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  image: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  cinemaName: string;
  roomId: string;
  roomName: string;
  roomType: string;
  startTime: string;
  date: string;
  price: {
    standard: number;
    vip: number;
    couple: number;
  };
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  items: string[];
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  code: string;
  discount: string;
  validUntil: string;
  terms: string[];
  tag: string;
}

export interface Booking {
  id: string;
  orderId?: string;
  showtimeId?: string;
  movieId?: string;
  movieTitle: string;
  moviePoster?: string;
  cinemaId?: string;
  cinemaName: string;
  roomId?: string;
  roomName: string;
  date?: string;
  startTime?: string;
  seatLabels?: string[];
  seats?: any[];
  combos?: { name: string; quantity: number; price: number }[];
  totalPrice?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: string;
  createdAt: string;
  userEmail?: string;
  userName?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalMovies: number;
  totalCinemas: number;
  nowShowingCount: number;
  comingSoonCount: number;
  todayRevenue: number;
  todayBookings: number;
}
