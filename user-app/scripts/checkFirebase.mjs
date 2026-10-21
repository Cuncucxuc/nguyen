import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function check() {
  const collections = ['movies', 'cinemas', 'combos', 'promotions', 'bookings'];
  console.log('🔍 Kiểm tra trạng thái dữ liệu trên Firebase Firestore:\n');
  for (const col of collections) {
    try {
      const snap = await getDocs(collection(db, col));
      console.log(`- Collection '${col}': ${snap.size} documents`);
      if (snap.size > 0 && col === 'movies') {
        const ids = snap.docs.map(d => `${d.id} (${d.data().title})`);
        console.log(`  Danh sách (${snap.size} phim):\n   • ${ids.join('\n   • ')}\n`);
      }
    } catch (e) {
      console.log(`- Collection '${col}': lỗi - ${e.message}`);
    }
  }
}

check().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
