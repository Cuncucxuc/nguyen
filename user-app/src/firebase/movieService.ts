import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Movie } from '../types';
import { movies as initialMovies } from '../data/mockData';

const COLLECTION_NAME = 'movies';

/**
 * Lấy danh sách tất cả phim từ Firestore (hoặc fallback về dữ liệu mẫu nếu offline hoặc trống)
 */
export const getMoviesFromFirestore = async (): Promise<Movie[]> => {
  try {
    const moviesRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(moviesRef);

    if (snapshot.empty) {
      console.info('ℹ️ Firestore collection "movies" trống, sử dụng dữ liệu mặc định');
      return initialMovies;
    }

    const firestoreMovies: Movie[] = [];
    snapshot.forEach((docSnap) => {
      firestoreMovies.push(docSnap.data() as Movie);
    });

    return firestoreMovies;
  } catch (error) {
    console.warn('⚠️ Lỗi khi tải phim từ Firestore (sử dụng dữ liệu dự phòng):', error);
    return initialMovies;
  }
};

/**
 * Lấy chi tiết một bộ phim theo ID
 */
export const getMovieByIdFromFirestore = async (movieId: string): Promise<Movie | undefined> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, movieId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Movie;
    }
  } catch (error) {
    console.warn(`⚠️ Lỗi khi lấy phim ID ${movieId} từ Firestore:`, error);
  }
  return initialMovies.find((m) => m.id === movieId);
};

/**
 * Tải danh sách phim lên Firestore (seed dữ liệu)
 */
export const seedMoviesToFirestore = async (
  moviesToSeed: Movie[] = initialMovies
): Promise<{ success: boolean; count: number }> => {
  try {
    let count = 0;
    for (const movie of moviesToSeed) {
      const docRef = doc(db, COLLECTION_NAME, movie.id);
      await setDoc(docRef, movie, { merge: true });
      count++;
    }
    console.log(`✅ Đã đồng bộ thành công ${count} bộ phim lên Firestore!`);
    return { success: true, count };
  } catch (error) {
    console.error('❌ Lỗi khi đồng bộ phim lên Firestore:', error);
    return { success: false, count: 0 };
  }
};

/**
 * Lắng nghe cập nhật danh sách phim realtime từ Firestore
 */
export const subscribeMovies = (
  onData: (movies: Movie[]) => void,
  onError?: (error: Error) => void
) => {
  try {
    const moviesRef = collection(db, COLLECTION_NAME);
    return onSnapshot(
      moviesRef,
      (snapshot) => {
        if (snapshot.empty) {
          onData(initialMovies);
          return;
        }
        const list: Movie[] = [];
        snapshot.forEach((d) => list.push(d.data() as Movie));
        onData(list);
      },
      (err) => {
        console.warn('⚠️ Lỗi realtime listener Firestore movies:', err);
        onError?.(err);
        onData(initialMovies);
      }
    );
  } catch (err) {
    onData(initialMovies);
    return () => {};
  }
};
