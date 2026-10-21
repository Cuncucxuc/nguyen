import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Booking, UserProfile, Showtime } from '../types';

const LOCAL_STORAGE_KEY = 'cineviet_local_bookings';

/**
 * Lấy danh sách vé đã lưu trong LocalStorage (làm bộ đệm hoặc khi offline)
 */
export const getLocalBookings = (): Booking[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Lưu vé mới vào LocalStorage
 */
export const saveLocalBooking = (booking: Booking): void => {
  try {
    const current = getLocalBookings();
    const exists = current.some((b) => b.id === booking.id);
    if (!exists) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([booking, ...current]));
    }
  } catch (e) {
    console.warn('Không thể lưu vé vào LocalStorage:', e);
  }
};

/**
 * Cập nhật trạng thái vé trong LocalStorage
 */
export const updateLocalBookingStatus = (bookingId: string, status: Booking['status']): void => {
  try {
    const current = getLocalBookings();
    const updated = current.map((b) => (b.id === bookingId ? { ...b, status } : b));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Không thể cập nhật vé trong LocalStorage:', e);
  }
};

/**
 * Lưu đơn đặt vé mới lên Cloud Firestore (kèm dự phòng LocalStorage)
 */
export const saveBookingToFirestore = async (
  booking: Booking,
  user?: UserProfile | null
): Promise<boolean> => {
  // Luôn lưu local trước để đảm bảo trải nghiệm người dùng
  saveLocalBooking(booking);

  try {
    const bookingDoc = {
      ...booking,
      userId: user?.uid || 'guest',
      userEmail: user?.email || '',
      userName: user?.displayName || 'Khách đặt vé',
      updatedAt: serverTimestamp(),
    };

    const docRef = doc(db, 'bookings', booking.id);
    await setDoc(docRef, bookingDoc);
    console.log('✅ Đã lưu vé thành công lên Firestore:', booking.id);
    return true;
  } catch (error) {
    console.warn('⚠️ Lỗi khi lưu vé lên Firestore (đã lưu dự phòng trong LocalStorage):', error);
    return false;
  }
};

/**
 * Lấy danh sách vé của người dùng từ Firestore (kết hợp với vé LocalStorage)
 */
export const fetchUserBookings = async (user?: UserProfile | null): Promise<Booking[]> => {
  const localList = getLocalBookings();

  if (!user?.email && !user?.uid) {
    return localList;
  }

  try {
    const bookingsRef = collection(db, 'bookings');
    let snapshot;

    // Tìm theo userId hoặc email của người dùng
    if (user.uid && user.uid !== '1') {
      const q = query(bookingsRef, where('userId', '==', user.uid));
      snapshot = await getDocs(q);
    }

    if ((!snapshot || snapshot.empty) && user.email) {
      const qEmail = query(bookingsRef, where('userEmail', '==', user.email));
      snapshot = await getDocs(qEmail);
    }

    const firestoreList: Booking[] = [];
    if (snapshot && !snapshot.empty) {
      snapshot.forEach((d) => {
        firestoreList.push(d.data() as Booking);
      });
    }

    // Hợp nhất dữ liệu giữa Firestore và LocalStorage (ưu tiên không trùng ID)
    const map = new Map<string, Booking>();
    firestoreList.forEach((b) => map.set(b.id, b));
    localList.forEach((b) => {
      if (!map.has(b.id)) {
        map.set(b.id, b);
      }
    });

    return Array.from(map.values());
  } catch (error) {
    console.warn('⚠️ Không thể tải vé từ Firestore, sử dụng danh sách Local:', error);
    return localList;
  }
};

/**
 * Hủy vé trên Firestore và LocalStorage
 */
export const cancelBookingInFirestore = async (bookingId: string): Promise<boolean> => {
  updateLocalBookingStatus(bookingId, 'cancelled');

  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
    });
    console.log('✅ Đã cập nhật hủy vé trên Firestore:', bookingId);
    return true;
  } catch (error) {
    console.warn('⚠️ Không thể cập nhật trạng thái hủy lên Firestore:', error);
    return false;
  }
};

/**
 * Kiểm tra xem một vé đặt có thuộc về suất chiếu cụ thể hay không
 */
const isBookingMatchShowtime = (b: Booking, st: Showtime, movieTitle?: string): boolean => {
  if (b.status === 'cancelled') return false;
  // Ưu tiên so khớp ID suất chiếu trực tiếp
  if (b.showtimeId) {
    return b.showtimeId === st.id;
  }
  // So khớp dự phòng nếu vé cũ chưa có showtimeId
  const sameDate = b.date === st.date;
  const sameTime = b.startTime === st.startTime;
  const sameCinema = b.cinemaName ? b.cinemaName === st.cinemaName : false;
  const sameRoom = b.roomName ? b.roomName === st.roomName : false;
  const sameMovie = movieTitle && b.movieTitle ? b.movieTitle === movieTitle : true;
  return sameDate && sameTime && sameCinema && sameRoom && sameMovie;
};

/**
 * Lấy danh sách các ghế đã được đặt cho một suất chiếu cụ thể (kết hợp Firestore và LocalStorage)
 */
export const fetchBookedSeatsForShowtime = async (
  showtime: Showtime,
  movieTitle?: string
): Promise<string[]> => {
  const bookedSet = new Set<string>();

  // 1. Kiểm tra LocalStorage
  const localBookings = getLocalBookings();
  localBookings.forEach((b) => {
    if (isBookingMatchShowtime(b, showtime, movieTitle) && b.seatLabels) {
      b.seatLabels.forEach((lbl) => bookedSet.add(lbl));
    }
  });

  // 2. Kiểm tra Firestore
  try {
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    snapshot.forEach((d) => {
      const b = d.data() as Booking;
      if (isBookingMatchShowtime(b, showtime, movieTitle) && b.seatLabels) {
        b.seatLabels.forEach((lbl) => bookedSet.add(lbl));
      }
    });
  } catch (error) {
    console.warn('⚠️ Không thể lấy danh sách ghế đặt từ Firestore:', error);
  }

  return Array.from(bookedSet);
};

/**
 * Lắng nghe cập nhật ghế đã đặt theo thời gian thực (Real-time listener) từ Firebase Firestore
 */
export const subscribeBookedSeatsForShowtime = (
  showtime: Showtime,
  onUpdate: (bookedSeatLabels: string[]) => void,
  movieTitle?: string
): (() => void) => {
  // Đồng bộ ban đầu từ LocalStorage
  const getFromLocal = () => {
    const localBookings = getLocalBookings();
    const set = new Set<string>();
    localBookings.forEach((b) => {
      if (isBookingMatchShowtime(b, showtime, movieTitle) && b.seatLabels) {
        b.seatLabels.forEach((lbl) => set.add(lbl));
      }
    });
    return set;
  };

  try {
    const bookingsRef = collection(db, 'bookings');
    return onSnapshot(
      bookingsRef,
      (snapshot) => {
        const bookedSet = getFromLocal();
        snapshot.forEach((d) => {
          const b = d.data() as Booking;
          if (isBookingMatchShowtime(b, showtime, movieTitle) && b.seatLabels) {
            b.seatLabels.forEach((lbl) => bookedSet.add(lbl));
          }
        });
        onUpdate(Array.from(bookedSet));
      },
      (err) => {
        console.warn('⚠️ Lỗi onSnapshot Firestore booked seats:', err);
        onUpdate(Array.from(getFromLocal()));
      }
    );
  } catch (e) {
    onUpdate(Array.from(getFromLocal()));
    return () => {};
  }
};
