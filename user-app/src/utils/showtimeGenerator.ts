import { Showtime, Cinema } from '../types';
import { cinemas as defaultCinemas, showtimes as staticShowtimes, showtimeDates } from '../data/mockData';

// Cache để lưu các suất chiếu tự sinh cho phim mới, đảm bảo ID luôn đồng nhất
const dynamicShowtimesCache = new Map<string, Showtime[]>();

/**
 * Tự động sinh danh sách suất chiếu chuẩn cho bất kỳ bộ phim nào (kể cả phim mới thêm từ Admin)
 */
export const generateDynamicShowtimesForMovie = (
  movieId: string,
  cinemasList: Cinema[] = defaultCinemas
): Showtime[] => {
  if (dynamicShowtimesCache.has(movieId)) {
    return dynamicShowtimesCache.get(movieId)!;
  }

  const times = ['09:30', '11:45', '14:15', '16:45', '19:15', '21:30', '23:15'];
  const rooms = [
    { id: 'room-1', name: 'Phòng 01', type: '2D Digital' },
    { id: 'room-2', name: 'Phòng 02', type: 'IMAX Laser' },
    { id: 'room-3', name: 'Phòng 03', type: '3D Dolby Atmos' },
    { id: 'room-4', name: 'Phòng 04', type: 'Gold Class VIP' },
  ];

  const result: Showtime[] = [];
  let counter = 1;

  showtimeDates.forEach((date, dateIdx) => {
    cinemasList.forEach((cinema, cinemaIdx) => {
      // Mỗi rạp mỗi ngày sẽ có 3 suất chiếu phân bổ đều các khung giờ
      const timeIdx1 = (dateIdx + cinemaIdx) % times.length;
      const timeIdx2 = (timeIdx1 + 2) % times.length;
      const timeIdx3 = (timeIdx1 + 4) % times.length;

      const room1 = rooms[cinemaIdx % rooms.length];
      const room2 = rooms[(cinemaIdx + 1) % rooms.length];
      const room3 = rooms[(cinemaIdx + 2) % rooms.length];

      const standardPrice = 85000 + (cinemaIdx % 2) * 5000;
      const vipPrice = standardPrice + 25000;
      const couplePrice = standardPrice * 2 + 25000;

      const scheduleItems = [
        { time: times[timeIdx1], room: room1 },
        { time: times[timeIdx2], room: room2 },
        { time: times[timeIdx3], room: room3 },
      ];

      scheduleItems.forEach(({ time, room }) => {
        result.push({
          id: `dyn-st-${movieId}-${cinema.id}-${date}-${room.id}-${time.replace(':', '')}`,
          movieId,
          cinemaId: cinema.id,
          cinemaName: cinema.name,
          roomId: room.id,
          roomName: room.name,
          roomType: room.type,
          startTime: time,
          date,
          price: {
            standard: standardPrice,
            vip: vipPrice,
            couple: couplePrice,
          },
        });
      });
    });
  });

  dynamicShowtimesCache.set(movieId, result);
  return result;
};

/**
 * Lấy toàn bộ suất chiếu cho một bộ phim:
 * Ưu tiên suất chiếu tĩnh có sẵn, nếu chưa có (phim mới từ Admin) -> Tự động sinh lịch chiếu đầy đủ tại tất cả các rạp!
 */
export const getShowtimesForMovie = (
  movieId: string,
  cinemasList: Cinema[] = defaultCinemas
): Showtime[] => {
  if (!movieId) return [];

  // 1. Kiểm tra trong danh sách tĩnh
  const direct = staticShowtimes.filter((st) => st.movieId === movieId);
  if (direct.length > 0) {
    return direct;
  }

  // 2. Nếu là phim mới -> Tự động tạo lịch chiếu cho tất cả các rạp
  return generateDynamicShowtimesForMovie(movieId, cinemasList);
};

/**
 * Tìm kiếm 1 suất chiếu theo ID (hỗ trợ cả suất chiếu tĩnh và suất chiếu tự sinh)
 */
export const findShowtimeById = (
  showtimeId: string,
  movieId?: string
): Showtime | undefined => {
  if (!showtimeId) return undefined;

  // Tìm trong staticShowtimes trước
  const found = staticShowtimes.find((st) => st.id === showtimeId);
  if (found) return found;

  // Nếu là showtime tự sinh (bắt đầu bằng dyn-st-)
  if (showtimeId.startsWith('dyn-st-') || movieId) {
    // Trích xuất movieId nếu có
    const targetMovieId = movieId || showtimeId.split('-')[2];
    if (targetMovieId) {
      const dynList = getShowtimesForMovie(targetMovieId);
      return dynList.find((st) => st.id === showtimeId);
    }
  }

  // Quét toàn bộ cache
  for (const list of dynamicShowtimesCache.values()) {
    const f = list.find((st) => st.id === showtimeId);
    if (f) return f;
  }

  return undefined;
};
