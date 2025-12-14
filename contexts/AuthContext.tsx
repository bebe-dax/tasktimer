"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  createUserDocument,
  getUserDocument,
  updateLastLogin,
  updateUserDocument,
} from "../lib/firestoreUserOperations";
import type { FirestoreUser } from "../lib/types";

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  userProfile: FirestoreUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<Omit<FirestoreUser, "uid" | "createdAt">>
  ) => Promise<void>;
}

// コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Firestoreからユーザープロフィールを取得
        const profile = await getUserDocument(user.uid);
        setUserProfile(profile);

        // 最終ログイン日時を更新
        await updateLastLogin(user.uid);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    // クリーンアップ
    return unsubscribe;
  }, []);

  // ログイン機能
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("ログインエラー:", error);
      throw error;
    }
  };

  // ユーザー登録機能（Firestoreにも保存）
  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Firestoreにユーザードキュメントを作成
      await createUserDocument(userCredential.user.uid, email);
    } catch (error) {
      console.error("ユーザー登録エラー:", error);
      throw error;
    }
  };

  // ログアウト機能
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("ログアウトエラー:", error);
      throw error;
    }
  };

  // プロフィール更新機能
  const updateProfile = async (
    updates: Partial<Omit<FirestoreUser, "uid" | "createdAt">>
  ) => {
    if (!user) throw new Error("ユーザーがログインしていません");

    await updateUserDocument(user.uid, updates);

    // ローカルステートも更新
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// カスタムフック：認証コンテキストを使用
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}