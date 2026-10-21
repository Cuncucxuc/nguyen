import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';

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

async function run() {
  console.log('🚀 Đang đồng bộ toàn bộ dữ liệu lên Firebase Firestore...');
  const { movies, cinemas, combos, promotions } = await import('../src/data/mockData.ts');

  // 1. Phim (Movies)
  console.log(`\n🎬 Đang tải ${movies.length} phim lên Firestore...`);
  for (const m of movies) {
    await setDoc(doc(db, 'movies', m.id), m, { merge: true });
  }
  console.log(`✅ Đã lưu ${movies.length} phim.`);

  // 2. Rạp chiếu (Cinemas)
  console.log(`\n🏢 Đang tải ${cinemas.length} rạp chiếu lên Firestore...`);
  for (const c of cinemas) {
    await setDoc(doc(db, 'cinemas', c.id), c, { merge: true });
  }
  console.log(`✅ Đã lưu ${cinemas.length} cụm rạp.`);

  // 3. Combo bắp nước (Combos)
  console.log(`\n🍿 Đang tải ${combos.length} combo bắp nước lên Firestore...`);
  for (const cb of combos) {
    await setDoc(doc(db, 'combos', cb.id), cb, { merge: true });
  }
  console.log(`✅ Đã lưu ${combos.length} combo bắp nước.`);

  // 4. Khuyến mãi (Promotions)
  console.log(`\n🎁 Đang tải ${promotions.length} mã ưu đãi / khuyến mãi lên Firestore...`);
  for (const p of promotions) {
    await setDoc(doc(db, 'promotions', p.id), p, { merge: true });
  }
  console.log(`✅ Đã lưu ${promotions.length} chương trình khuyến mãi.`);

  console.log('\n========================================');
  console.log('🎉 TẤT CẢ DỮ LIỆU ĐÃ ĐỒNG BỘ 100% LÊN FIREBASE FIRESTORE!');
  console.log('========================================');
}

run().then(() => process.exit(0)).catch((err) => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
