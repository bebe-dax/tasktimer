"use client";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../styles/auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      router.push("/"); // ログイン成功後、ホームページへリダイレクト
    } catch (error: any) {
      console.error("ログインエラー:", error);
      // Firebase エラーメッセージを日本語化
      if (error.code === "auth/invalid-credential") {
        setError("メールアドレスまたはパスワードが間違っています。");
      } else if (error.code === "auth/user-not-found") {
        setError("ユーザーが見つかりません。");
      } else if (error.code === "auth/wrong-password") {
        setError("パスワードが間違っています。");
      } else if (error.code === "auth/invalid-email") {
        setError("メールアドレスの形式が正しくありません。");
      } else if (error.code === "auth/too-many-requests") {
        setError(
          "ログイン試行回数が多すぎます。しばらく待ってから再度お試しください。"
        );
      } else {
        setError("ログインに失敗しました。もう一度お試しください。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <h1 className="auth-title">Login</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-wrapper">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="Email"
              disabled={loading}
            />
          </div>

          <div className="auth-input-wrapper">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="Password"
              disabled={loading}
            />
          </div>

          <div className="auth-input-wrapper">
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-button"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">Need help signing in?</p>
          <Link href="/signup" className="auth-secondary-button">
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
}
