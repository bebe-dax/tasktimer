"use client";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../styles/auth.css";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    if (!email || !password || !confirmPassword) {
      setError("すべての項目を入力してください。");
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
      router.push("/"); // 登録成功後、ホームページへリダイレクト
    } catch (error: any) {
      console.error("ユーザー登録エラー:", error);
      // Firebase エラーメッセージを日本語化
      if (error.code === "auth/email-already-in-use") {
        setError("このメールアドレスは既に使用されています。");
      } else if (error.code === "auth/invalid-email") {
        setError("メールアドレスの形式が正しくありません。");
      } else if (error.code === "auth/weak-password") {
        setError("パスワードが弱すぎます。より強力なパスワードを設定してください。");
      } else {
        setError("ユーザー登録に失敗しました。もう一度お試しください。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <h1 className="auth-title">SignUp</h1>

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
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              placeholder="Confirm password"
              disabled={loading}
            />
          </div>

          <div className="auth-input-wrapper">
            <button type="submit" disabled={loading} className="auth-submit-button">
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            既にアカウントをお持ちですか？{" "}
            <Link href="/login" className="auth-link">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}