import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const firebaseConfig = {
  apiKey: 'AIzaSyDhd9Ig8chIHb5p8BSv1-M7N16_7gvyeDk',
  authDomain: 'xemphim-c8996.firebaseapp.com',
  projectId: 'xemphim-c8996',
  storageBucket: 'xemphim-c8996.firebasestorage.app',
  messagingSenderId: '950932331829',
  appId: '1:950932331829:web:16506cca025f12f00d407c'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Import movies from compiled or source
async function run() {
  console.log('🚀 Đang kết nối Firebase và chuẩn bị tải phim...');
  
  // We can import mockData directly if node supports TS, or read mockData
  // Since ts-node or vite is available, or we can dynamic import mockData:
  const { movies } = await import('../src/data/mockData.ts');

  console.log(`📦 Bắt đầu tải ${movies.length} bộ phim lên Firestore collection 'movies'...`);
  let count = 0;
  for (const movie of movies) {
    const docRef = doc(db, 'movies', movie.id);
    await setDoc(docRef, movie, { merge: true });
    count++;
    console.log(`[${count}/${movies.length}] ✅ Đã lưu: ${movie.title} (${movie.id})`);
  }

  const snap = await getDocs(collection(db, 'movies'));
  console.log(`\n🎉 HOÀN TẤT! Tổng số phim hiện có trong Firestore: ${snap.size}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Lỗi khi tải phim:', err);
  process.exit(1);
});
