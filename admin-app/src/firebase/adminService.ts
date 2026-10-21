import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { Movie, Cinema, Combo, Promotion, Booking, DashboardStats } from '../types';

// ==========================================
// 1. QUẢN LÝ PHIM (MOVIES)
// ==========================================
export const subscribeMovies = (onData: (movies: Movie[]) => void) => {
  const colRef = collection(db, 'movies');
  return onSnapshot(colRef, (snapshot) => {
    const list: Movie[] = [];
    snapshot.forEach((d) => list.push(d.data() as Movie));
    // Sắp xếp phim mới lên trước
    onData(list);
  }, (err) => {
    console.error('Lỗi tải phim từ Firestore:', err);
  });
};

export const saveMovie = async (movie: Movie): Promise<boolean> => {
  try {
    const docRef = doc(db, 'movies', movie.id);
    // Lọc bỏ các trường undefined để tránh lỗi Firestore
    const cleanMovie: any = {};
    Object.entries(movie).forEach(([key, val]) => {
      if (val !== undefined) {
        cleanMovie[key] = val;
      }
    });
    await setDoc(docRef, cleanMovie, { merge: true });
    console.log('✅ Đã lưu phim thành công lên Firestore:', movie.id);
    return true;
  } catch (err) {
    console.error('Lỗi lưu phim:', err);
    return false;
  }
};

export const deleteMovie = async (movieId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'movies', movieId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Lỗi xóa phim:', err);
    return false;
  }
};

// ==========================================
// 2. QUẢN LÝ ĐƠN ĐẶT VÉ (BOOKINGS)
// ==========================================
export const subscribeBookings = (onData: (bookings: Booking[]) => void) => {
  const colRef = collection(db, 'bookings');
  return onSnapshot(colRef, (snapshot) => {
    const list: Booking[] = [];
    snapshot.forEach((d) => list.push(d.data() as Booking));
    // Sắp xếp theo ngày tạo mới nhất
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onData(list);
  }, (err) => {
    console.error('Lỗi tải vé từ Firestore:', err);
  });
};

export const updateBookingStatus = async (
  bookingId: string,
  status: Booking['status']
): Promise<boolean> => {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, { status });
    return true;
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái vé:', err);
    return false;
  }
};

// ==========================================
// 3. QUẢN LÝ RẠP CHIẾU (CINEMAS)
// ==========================================
export const subscribeCinemas = (onData: (cinemas: Cinema[]) => void) => {
  const colRef = collection(db, 'cinemas');
  return onSnapshot(colRef, (snapshot) => {
    const list: Cinema[] = [];
    snapshot.forEach((d) => list.push(d.data() as Cinema));
    onData(list);
  });
};

export const saveCinema = async (cinema: Cinema): Promise<boolean> => {
  try {
    const docRef = doc(db, 'cinemas', cinema.id);
    await setDoc(docRef, cinema, { merge: true });
    return true;
  } catch (err) {
    console.error('Lỗi lưu rạp:', err);
    return false;
  }
};

export const deleteCinema = async (cinemaId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'cinemas', cinemaId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Lỗi xóa rạp:', err);
    return false;
  }
};

// ==========================================
// 4. QUẢN LÝ COMBOS BẮP NƯỚC (COMBOS)
// ==========================================
export const subscribeCombos = (onData: (combos: Combo[]) => void) => {
  const colRef = collection(db, 'combos');
  return onSnapshot(colRef, (snapshot) => {
    const list: Combo[] = [];
    snapshot.forEach((d) => list.push(d.data() as Combo));
    onData(list);
  });
};

export const saveCombo = async (combo: Combo): Promise<boolean> => {
  try {
    const docRef = doc(db, 'combos', combo.id);
    await setDoc(docRef, combo, { merge: true });
    return true;
  } catch (err) {
    console.error('Lỗi lưu combo:', err);
    return false;
  }
};

export const deleteCombo = async (comboId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'combos', comboId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Lỗi xóa combo:', err);
    return false;
  }
};

// ==========================================
// 5. QUẢN LÝ KHUYẾN MÃI (PROMOTIONS)
// ==========================================
export const subscribePromotions = (onData: (promotions: Promotion[]) => void) => {
  const colRef = collection(db, 'promotions');
  return onSnapshot(colRef, (snapshot) => {
    const list: Promotion[] = [];
    snapshot.forEach((d) => list.push(d.data() as Promotion));
    onData(list);
  });
};

export const savePromotion = async (promotion: Promotion): Promise<boolean> => {
  try {
    const docRef = doc(db, 'promotions', promotion.id);
    await setDoc(docRef, promotion, { merge: true });
    return true;
  } catch (err) {
    console.error('Lỗi lưu khuyến mãi:', err);
    return false;
  }
};

export const deletePromotion = async (promoId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'promotions', promoId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Lỗi xóa khuyến mãi:', err);
    return false;
  }
};
