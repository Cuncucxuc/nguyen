import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  updatePassword as updateFirebasePassword,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile } from '../types';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword?: (newPassword: string) => Promise<void>;
}

// Chuyển mã lỗi Firebase sang tiếng Việt thân thiện
const formatFirebaseError = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.';
    case 'auth/invalid-email':
      return 'Địa chỉ email không đúng định dạng.';
    case 'auth/user-not-found':
      return 'Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc đăng ký mới.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác.';
    case 'auth/weak-password':
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    case 'auth/too-many-requests':
      return 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ít phút.';
    case 'auth/operation-not-allowed':
      return 'Tính năng đăng nhập Email/Password chưa được bật trên Firebase Console.';
    default:
      return error?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Lắng nghe trạng thái đăng nhập thời gian thực từ Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Lấy thêm thông tin chi tiết (điểm thưởng, số điện thoại) từ Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: data.displayName || firebaseUser.displayName || 'Thành viên CineViet',
              photoURL: data.photoURL || firebaseUser.photoURL || '',
              phone: data.phone || '',
              points: data.points ?? 100,
            });
          } else {
            // Nếu chưa có doc trong Firestore, tạo mới doc mặc định
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Thành viên CineViet',
              photoURL: firebaseUser.photoURL || '',
              phone: '',
              points: 100,
            };
            setUser(newProfile);
            setDoc(userDocRef, newProfile).catch((err) =>
              console.warn('Không thể tạo Firestore user document:', err)
            );
          }
          setIsAuthenticated(true);
        } catch (e) {
          console.warn('Lỗi khi tải thông tin user từ Firestore:', e);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Thành viên CineViet',
            photoURL: firebaseUser.photoURL || '',
            phone: '',
            points: 100,
          });
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Đăng nhập bằng Email & Mật khẩu
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      console.error('Firebase Login Error:', err);
      throw new Error(formatFirebaseError(err));
    }
  };

  // Đăng ký tài khoản mới bằng Email & Mật khẩu
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const createdUser = userCredential.user;

      // Cập nhật tên hiển thị trên Firebase Auth
      await updateFirebaseProfile(createdUser, {
        displayName: name,
      });

      // Lưu hồ sơ người dùng vào Firestore
      const userProfile: UserProfile = {
        uid: createdUser.uid,
        email: createdUser.email || email,
        displayName: name,
        photoURL: '',
        phone: '',
        points: 100, // Thưởng 100 điểm chào mừng
      };

      try {
        await setDoc(doc(db, 'users', createdUser.uid), userProfile);
      } catch (firestoreErr) {
        console.warn('Không thể tạo user trong Firestore:', firestoreErr);
      }

      setUser(userProfile);
      setIsAuthenticated(true);
      return true;
    } catch (err: any) {
      console.error('Firebase Register Error:', err);
      throw new Error(formatFirebaseError(err));
    }
  };

  // Đăng xuất
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Firebase Logout Error:', err);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Cập nhật thông tin hồ sơ
  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));

    if (auth.currentUser) {
      // Cập nhật lên Firebase Auth nếu có tên hiển thị hoặc avatar
      if (data.displayName || data.photoURL) {
        await updateFirebaseProfile(auth.currentUser, {
          ...(data.displayName ? { displayName: data.displayName } : {}),
          ...(data.photoURL ? { photoURL: data.photoURL } : {}),
        }).catch((e) => console.warn('Lỗi update auth profile:', e));
      }

      // Cập nhật lên Firestore
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, data);
      } catch (e) {
        console.warn('Lỗi update profile lên Firestore:', e);
      }
    }
  };

  // Đổi mật khẩu
  const changePassword = async (newPassword: string): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('Bạn chưa đăng nhập.');
    }
    try {
      await updateFirebasePassword(auth.currentUser, newPassword);
    } catch (err: any) {
      throw new Error(formatFirebaseError(err));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
