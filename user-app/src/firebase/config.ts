import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Lưu ý: getStorage đã bị xóa vì chưa dùng Firebase Storage ở bất kỳ component nào

// ==============================================================================
// CẤU HÌNH FIREBASE
// ==============================================================================
// Để kết nối với dự án Firebase thực tế của bạn:
// 1. Truy cập https://console.firebase.google.com/
// 2. Tạo hoặc chọn dự án của bạn -> Project Settings -> General -> Your apps
// 3. Sao chép thông số cấu hình và cập nhật vào file .env ở thư mục gốc:
//    VITE_FIREBASE_API_KEY=...
//    VITE_FIREBASE_AUTH_DOMAIN=...
//    VITE_FIREBASE_PROJECT_ID=...
//    VITE_FIREBASE_STORAGE_BUCKET=...
//    VITE_FIREBASE_MESSAGING_SENDER_ID=...
//    VITE_FIREBASE_APP_ID=...
// ==============================================================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cineviet-booking.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cineviet-booking",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cineviet-booking.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890abcdef",
};

// Khởi tạo Firebase App (sử dụng app hiện có nếu đã được khởi tạo để tránh lỗi hot-reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo các dịch vụ Firebase cần thiết
export const auth = getAuth(app);       // Authentication
export const db = getFirestore(app);    // Firestore Database

export default app;
