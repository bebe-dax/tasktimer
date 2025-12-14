"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskBoard from "@/components/tasks/TaskBoard";
import { useAuth } from "../contexts/AuthContext";
import "../styles/home.css";

export default function Home() {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();

  // 認証チェック
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // ログアウトハンドラー
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  // ローディング中、またはuserProfileの読み込み中
  if (loading || (user && !userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクト中）
  if (!user) {
    return null;
  }

  return (
    <>
      <header>
        <h1 className="title">Task Board</h1>
        <div className="header-right">
          <span className="user-email">
            {userProfile?.displayName || user.email}
          </span>
          <button onClick={handleLogout} className="logout-button">
            ログアウト
          </button>
        </div>
      </header>
      <div className="task_list">
        <TaskBoard />
      </div>
    </>
  );
}
