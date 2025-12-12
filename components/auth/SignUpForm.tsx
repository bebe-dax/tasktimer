'use client';
import '../../styles/auth.css';

export default function SignUpForm() {
  return (
    <form className="auth-form-space">
      <div>
        <label htmlFor="email" className="auth-label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="auth-form-input"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="auth-label">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="auth-form-input"
          required
        />
      </div>
      <button
        type="submit"
        className="auth-form-button"
      >
        Sign Up
      </button>
    </form>
  );
}