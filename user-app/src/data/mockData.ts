import { Movie, Cinema, Showtime, Combo, Booking, Promotion } from '../types';

export const movies: Movie[] = [
  {
    id: 'movie-1',
    title: 'Mai',
    description: 'Mai là một người phụ nữ làm nghề mát-xa luôn phải đối mặt với những lời đàm tiếu từ người xung quanh. Cuộc đời cô bắt đầu thay đổi sau khi gặp Dương - một chàng trai đào hoa kém tuổi khao khát tình yêu chân thành.',
    genre: ['Tình Cảm', 'Tâm Lý', 'Hài'],
    director: 'Trấn Thành',
    cast: ['Phương Anh Đào', 'Tuấn Trần', 'Hồng Đào', 'Trấn Thành', 'Uyển Ân'],
    poster: 'https://picsum.photos/seed/movie1/600/900',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 131,
    rating: 8.8,
    releaseDate: '2026-10-10',
    status: 'now_showing',
    language: 'Tiếng Việt - Phụ đề Tiếng Anh',
    format: ['2D', 'IMAX'],
    ageRating: 'T18',
  },
  {
    id: 'movie-2',
    title: 'Lật Mặt 7: Một Điều Ước',
    description: 'Câu chuyện cảm động về bà Hai 73 tuổi sống đơn độc nơi vùng núi cao Lạc Dương và năm người con đã trưởng thành tỏa đi khắp mọi miền đất nước mưu sinh. Một tai nạn xảy ra đặt ra bài toán ai sẽ là người chăm sóc mẹ.',
    genre: ['Tình Cảm', 'Gia Đình', 'Hài'],
    director: 'Lý Hải',
    cast: ['Thanh Hiền', 'Trương Minh Cường', 'Đinh Y Nhung', 'Quách Ngọc Tuyên', 'Ammy Minh Khuê'],
    poster: 'https://picsum.photos/seed/movie2/600/900',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 138,
    rating: 9.1,
    releaseDate: '2026-10-12',
    status: 'now_showing',
    language: 'Tiếng Việt',
    format: ['2D'],
    ageRating: 'P',
  },
  {
    id: 'movie-3',
    title: 'Đất Rừng Phương Nam',
    description: 'Hành trình tìm cha đầy gian nan và hiểm nguy của cậu bé An cùng những nghĩa sĩ phương Nam yêu nước trong thời kỳ kháng Pháp hào hùng giữa sông nước Nam Bộ.',
    genre: ['Hành Động', 'Phiêu Lưu', 'Lịch Sử'],
    director: 'Nguyễn Quang Dũng',
    cast: ['Hạo Khang', 'Tuấn Trần', 'Trấn Thành', 'Tiến Luật', 'Băng Di'],
    poster: 'https://picsum.photos/seed/movie3/600/900',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 134,
    rating: 8.2,
    releaseDate: '2026-10-05',
    status: 'now_showing',
    language: 'Tiếng Việt',
    format: ['2D', 'IMAX'],
    ageRating: 'T13',
  },
  {
    id: 'movie-4',
    title: 'Kẻ Ăn Hồn',
    description: 'Bộ phim kinh dị hé lộ nguồn gốc cổ thuật Rượu Sọ Người tại Làng Địa Ngục cổ xưa với hàng loạt cái chết kỳ bí, rùng rợn và tàn bạo không lời giải đáp.',
    genre: ['Kinh Dị', 'Bí Ẩn'],
    director: 'Trần Hữu Tấn',
    cast: ['Hoàng Hà', 'Võ Điền Gia Huy', 'Huỳnh Thanh Trực', 'NSƯT Chiều Xuân'],
    poster: 'https://picsum.photos/seed/movie4/600/900',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 109,
    rating: 7.9,
    releaseDate: '2026-10-15',
    status: 'now_showing',
    language: 'Tiếng Việt',
    format: ['2D'],
    ageRating: 'T18',
  },
  {
    id: 'movie-5',
    title: 'Godzilla x Kong: Đế Chế Mới',
    description: 'Hai quái thú huyền thoại Godzilla và Kong buộc phải gác lại bất đồng để cùng nhau chống lại mối đe dọa khổng lồ bí ẩn từ lòng Trái Đất đe dọa sự tồn vong của nhân loại.',
    genre: ['Hành Động', 'Khoa Học Viễn Tưởng', 'Phiêu Lưu'],
    director: 'Adam Wingard',
    cast: ['Rebecca Hall', 'Brian Tyree Henry', 'Dan Stevens', 'Kaylee Hottle'],
    poster: 'https://picsum.photos/seed/movie5/600/900',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 115,
    rating: 8.6,
    releaseDate: '2026-10-16',
    status: 'now_showing',
    language: 'Tiếng Anh - Phụ đề Tiếng Việt',
    format: ['2D', '3D', 'IMAX'],
    ageRating: 'T13',
  },
  {
    id: 'movie-6',
    title: 'Kung Fu Panda 4',
    description: 'Sau nhiều chiến thắng vang dội, Gấu Po được định mệnh gọi tên để trở thành Thủ lĩnh Tinh thần của Thung lũng Hòa Bình. Chú phải huấn luyện một môn đệ mới đồng thời đối đầu với Tắc Kè Bông xảo quyệt.',
    genre: ['Hoạt Hình', 'Hài', 'Phiêu Lưu'],
    director: 'Mike Mitchell',
    cast: ['Jack Black', 'Awkwafina', 'Viola Davis', 'Dustin Hoffman', 'James Hong'],
    poster: 'https://picsum.photos/seed/movie6/600/900',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 94,
    rating: 8.4,
    releaseDate: '2026-10-25',
    status: 'coming_soon',
    language: 'Lồng tiếng & Phụ đề Tiếng Việt',
    format: ['2D', '3D'],
    ageRating: 'P',
  },
  {
    id: 'movie-7',
    title: 'Dune: Hành Tinh Cát - Phần 2',
    description: 'Paul Atreides đồng hành cùng Chani và tộc người Fremen để trả thù gia tộc Harkonnen kẻ thù, đứng trước ngã rẽ định mệnh giữa tình yêu cá nhân và vận mệnh vũ trụ.',
    genre: ['Khoa Học Viễn Tưởng', 'Phiêu Lưu', 'Hành Động'],
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
    poster: 'https://picsum.photos/seed/movie7/600/900',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 166,
    rating: 9.3,
    releaseDate: '2026-10-30',
    status: 'coming_soon',
    language: 'Tiếng Anh - Phụ đề Tiếng Việt',
    format: ['2D', 'IMAX'],
    ageRating: 'T16',
  },
  {
    id: 'movie-8',
    title: 'Quỷ Cẩu',
    description: 'Tác phẩm linh dị kinh dị lấy cảm hứng từ truyền thuyết dân gian Chó Đội Nón Mê, vén màn bí mật kinh hoàng phía sau lò mổ chó gia truyền và nghiệp báo truyền đời.',
    genre: ['Kinh Dị', 'Tâm Lý'],
    director: 'Lưu Thành Luân',
    cast: ['Quang Tuấn', 'NSND Kim Xuân', 'Vân Dung', 'Nam Thư', 'Mie'],
    poster: 'https://picsum.photos/seed/movie8/600/900',
    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 108,
    rating: 7.7,
    releaseDate: '2026-11-05',
    status: 'coming_soon',
    language: 'Tiếng Việt',
    format: ['2D'],
    ageRating: 'T18',
  },
];

export const cinemas: Cinema[] = [
  {
    id: 'cinema-1',
    name: 'CGV Vincom Center Đồng Khởi',
    address: 'Tầng 3, TTTM Vincom Center, 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cinema-2',
    name: 'Lotte Cinema Nam Sài Gòn',
    address: 'Tầng 3, Lotte Mart, 469 Nguyễn Hữu Thọ, Tân Hưng, Quận 7, TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cinema-3',
    name: 'Galaxy Cinema Nguyễn Du',
    address: '116 Nguyễn Du, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cinema-4',
    name: 'BHD Star Bitexco',
    address: 'Tầng 3 & 4, Bitexco Financial Tower, 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=800&q=80',
  },
];

export const promotions: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Happy Wednesday - Đồng Giá 50.000đ',
    description: 'Ưu đãi vé xem phim 2D đồng giá 50.000đ vào mỗi Thứ Tư hàng tuần cho mọi suất chiếu.',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
    code: 'HAPPYWED',
    discount: 'Đồng giá 50K',
    validUntil: '31/12/2026',
    terms: ['Áp dụng vào Thứ Tư hàng tuần', 'Áp dụng cho mọi rạp CineViet', 'Không áp dụng suất chiếu đặc biệt'],
    tag: 'Đồng giá',
  },
  {
    id: 'promo-2',
    title: 'Ưu Đãi Học Sinh - Sinh Viên & U22',
    description: 'Chỉ 55.000đ/vé từ Thứ Hai đến Thứ Sáu khi xuất trình thẻ HSSV hoặc CCCD dưới 22 tuổi.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    code: 'U22STUDENT',
    discount: 'Vé 55K',
    validUntil: '31/12/2026',
    terms: ['Dành cho học sinh sinh viên', 'Từ Thứ 2 đến Thứ 6', 'Mang theo thẻ HSSV khi nhận vé'],
    tag: 'HSSV',
  },
  {
    id: 'promo-3',
    title: 'Thanh Toán VNPay / MoMo Giảm Ngay 50.000đ',
    description: 'Nhập mã CINEMA50 khi thanh toán qua ví điện tử VNPay hoặc MoMo để nhận ngay ưu đãi.',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    code: 'CINEMA50',
    discount: 'Giảm 50.000đ',
    validUntil: '30/11/2026',
    terms: ['Áp dụng đơn từ 150.000đ', 'Mỗi tài khoản được dùng 2 lần/tháng', 'Áp dụng cả vé và bắp nước'],
    tag: 'Ví điện tử',
  },
  {
    id: 'promo-4',
    title: 'Combo Tiết Kiệm Bắp Nước Giảm Đến 30%',
    description: 'Thưởng thức bắp ngọt thơm lừng và nước ngọt mát lạnh với mức giá giảm 30% khi đặt trước.',
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80',
    code: 'COMBO30',
    discount: 'Giảm 30%',
    validUntil: '31/12/2026',
    terms: ['Áp dụng cho tất cả các combo bắp nước', 'Nhận ngay tại quầy Concession nhanh'],
    tag: 'Ẩm thực',
  },
  {
    id: 'promo-5',
    title: 'Quà Tặng Sinh Nhật Thành Viên',
    description: 'Tặng ngay 01 vé xem phim 2D miễn phí và 01 bắp ngọt trong tháng sinh nhật của bạn.',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    code: 'SINHNHAT',
    discount: 'Vé 0đ + Bắp',
    validUntil: '31/12/2026',
    terms: ['Dành cho thành viên đăng ký trước ngày sinh nhật', 'Có giá trị trong tháng sinh nhật'],
    tag: 'Thành viên',
  },
  {
    id: 'promo-6',
    title: 'Ưu Đãi Phim Bom Tấn Cuối Tuần - VIP10',
    description: 'Giảm 10% tổng đơn đặt vé suất chiếu IMAX và 3D thứ Bảy và Chủ Nhật.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    code: 'VIP10',
    discount: 'Giảm 10%',
    validUntil: '15/12/2026',
    terms: ['Áp dụng cho định dạng IMAX / 3D', 'Áp dụng Thứ 7 và Chủ Nhật'],
    tag: 'Cuối tuần',
  },
];


export const combos: Combo[] = [
  {
    id: 'combo-1',
    name: 'Bắp Rang Bơ',
    description: '1 Hộp bắp rang bơ nóng hổi thơm ngon (Vị ngọt, caramel hoặc phô mai thơm béo)',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80',
    items: ['1 Bắp rang bơ cỡ lớn'],
  },
  {
    id: 'combo-2',
    name: 'Nước Ngọt',
    description: '1 Ly nước ngọt mát lạnh có gas sảng khoái (Coca Cola, Sprite, Fanta cỡ lớn 32oz)',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    items: ['1 Ly nước ngọt lớn 32oz'],
  },
  {
    id: 'combo-3',
    name: 'Combo Solo',
    description: 'Thưởng thức điện ảnh trọn vẹn dành cho 1 người với 1 bắp lớn và 1 nước mát lạnh',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?auto=format&fit=crop&w=600&q=80',
    items: ['1 Bắp rang bơ lớn', '1 Nước ngọt lớn 32oz'],
  },
  {
    id: 'combo-4',
    name: 'Combo Couple',
    description: 'Combo hoàn hảo cho buổi hẹn hò 2 người: 1 bắp lớn thơm phức và 2 nước ngọt mát rượi',
    price: 115000,
    image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=600&q=80',
    items: ['1 Bắp rang bơ lớn', '2 Nước ngọt lớn 32oz'],
  },
  {
    id: 'combo-5',
    name: 'Combo Gia Đình',
    description: 'Gắn kết yêu thương cùng gia đình với 2 phần bắp lớn, 4 ly nước và snack giòn tan',
    price: 210000,
    image: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?auto=format&fit=crop&w=600&q=80',
    items: ['2 Bắp rang bơ lớn', '4 Nước ngọt lớn 32oz', '1 Bịch Snack khoai tây'],
  },
  {
    id: 'combo-6',
    name: 'Combo Party',
    description: 'Tiệc phim bùng nổ cùng hội bạn bè thân thiết: 3 bắp vị tùy chọn, 4 nước ngọt và 2 snack',
    price: 279000,
    image: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=600&q=80',
    items: ['3 Bắp rang bơ lớn', '4 Nước ngọt lớn 32oz', '2 Bịch Snack khoai tây cao cấp'],
  },
];

// Tạo danh sách 7 ngày chiếu bắt đầu từ hôm nay
export const getShowtimeDates = (): string[] => {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
};

export const showtimeDates: string[] = getShowtimeDates();

const generateShowtimes = (): Showtime[] => {
  const dates = showtimeDates;
  const times = ['09:15', '11:30', '14:00', '16:30', '19:00', '21:15', '23:00'];
  const nowShowingMovieIds = ['movie-1', 'movie-2', 'movie-3', 'movie-4', 'movie-5'];
  const rooms = [
    { id: 'room-1', name: 'Phòng 01', type: '2D Digital' },
    { id: 'room-2', name: 'Phòng 02', type: 'IMAX Laser' },
    { id: 'room-3', name: 'Phòng 03', type: '3D Dolby Atmos' },
    { id: 'room-4', name: 'Phòng 04', type: 'Gold Class VIP' },
  ];

  const result: Showtime[] = [];
  let counter = 1;

  dates.forEach((date, dateIdx) => {
    cinemas.forEach((cinema, cinemaIdx) => {
      nowShowingMovieIds.forEach((movieId, movieIdx) => {
        // Chọn giờ chiếu luân phiên
        const timeIndex1 = (dateIdx + cinemaIdx + movieIdx) % times.length;
        const timeIndex2 = (timeIndex1 + 3) % times.length;
        const room = rooms[(cinemaIdx + movieIdx) % rooms.length];

        const standardPrice = 80000 + (cinemaIdx % 2) * 5000;
        const vipPrice = standardPrice + 25000;
        const couplePrice = standardPrice * 2 + 30000;

        result.push({
          id: `showtime-${counter++}`,
          movieId,
          cinemaId: cinema.id,
          cinemaName: cinema.name,
          roomId: room.id,
          roomName: room.name,
          roomType: room.type,
          startTime: times[timeIndex1],
          date,
          price: {
            standard: standardPrice,
            vip: vipPrice,
            couple: couplePrice,
          },
        });

        result.push({
          id: `showtime-${counter++}`,
          movieId,
          cinemaId: cinema.id,
          cinemaName: cinema.name,
          roomId: room.id,
          roomName: room.name,
          roomType: room.type,
          startTime: times[timeIndex2],
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

  return result;
};

export const showtimes: Showtime[] = generateShowtimes();

// Dữ liệu mẫu lịch sử đặt vé của người dùng
export const sampleBookings: Booking[] = [
  {
    id: 'booking-1',
    orderId: 'CV-20261018-001',
    movieTitle: 'Mai',
    moviePoster: 'https://picsum.photos/seed/movie1/600/900',
    cinemaName: 'CGV Vincom Center Đồng Khởi',
    roomName: 'Phòng 02 (IMAX Laser)',
    date: '2026-10-18',
    startTime: '19:00',
    seatLabels: ['F05', 'F06'],
    combos: [
      { name: 'Combo Couple', quantity: 1, price: 115000 },
    ],
    totalPrice: 325000,
    status: 'confirmed',
    paymentMethod: 'VNPAY',
    createdAt: '2026-10-18T10:30:00Z',
  },
  {
    id: 'booking-2',
    orderId: 'CV-20261015-089',
    movieTitle: 'Lật Mặt 7: Một Điều Ước',
    moviePoster: 'https://picsum.photos/seed/movie2/600/900',
    cinemaName: 'Galaxy Cinema Nguyễn Du',
    roomName: 'Phòng 01 (2D Digital)',
    date: '2026-10-15',
    startTime: '20:15',
    seatLabels: ['E07', 'E08', 'E09'],
    combos: [
      { name: 'Combo Gia Đình', quantity: 1, price: 210000 },
    ],
    totalPrice: 465000,
    status: 'completed',
    paymentMethod: 'MoMo',
    createdAt: '2026-10-14T14:20:00Z',
  },
  {
    id: 'booking-3',
    orderId: 'CV-20261012-045',
    movieTitle: 'Godzilla x Kong: Đế Chế Mới',
    moviePoster: 'https://picsum.photos/seed/movie5/600/900',
    cinemaName: 'BHD Star Bitexco',
    roomName: 'Phòng 03 (3D Dolby Atmos)',
    date: '2026-10-12',
    startTime: '16:30',
    seatLabels: ['G11', 'G12'],
    combos: [
      { name: 'Combo Solo', quantity: 2, price: 85000 },
    ],
    totalPrice: 380000,
    status: 'completed',
    paymentMethod: 'Thẻ tín dụng (Visa/Mastercard)',
    createdAt: '2026-10-11T09:15:00Z',
  },
  {
    id: 'booking-4',
    orderId: 'CV-20261008-012',
    movieTitle: 'Đất Rừng Phương Nam',
    moviePoster: 'https://picsum.photos/seed/movie3/600/900',
    cinemaName: 'Lotte Cinema Nam Sài Gòn',
    roomName: 'Phòng 04 (Gold Class VIP)',
    date: '2026-10-08',
    startTime: '14:00',
    seatLabels: ['C04', 'C05'],
    combos: [],
    totalPrice: 210000,
    status: 'completed',
    paymentMethod: 'ShopeePay',
    createdAt: '2026-10-07T18:45:00Z',
  },
  {
    id: 'booking-5',
    orderId: 'CV-20261001-077',
    movieTitle: 'Kẻ Ăn Hồn',
    moviePoster: 'https://picsum.photos/seed/movie4/600/900',
    cinemaName: 'CGV Vincom Center Đồng Khởi',
    roomName: 'Phòng 01 (2D Digital)',
    date: '2026-10-01',
    startTime: '21:30',
    seatLabels: ['H08'],
    combos: [
      { name: 'Bắp Rang Bơ', quantity: 1, price: 55000 },
      { name: 'Nước Ngọt', quantity: 1, price: 35000 },
    ],
    totalPrice: 175000,
    status: 'cancelled',
    paymentMethod: 'MoMo',
    createdAt: '2026-09-30T22:10:00Z',
  },
];
