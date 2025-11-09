// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setSession } from "../lib/auth";
import { api } from "../lib/api";
import "../styles/auth.css"

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token } = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setSession({ user, token });
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" role="form" aria-labelledby="login-title">
        <header className="auth-header">
          <div className="auth-logo" aria-hidden>🐎</div>
          <div>
            <h1 id="login-title">Welcome back</h1>
            <p className="muted">Log in to continue to your account</p>
          </div>
        </header>

        {error ? (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              inputMode="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="ghost-btn"
                aria-label={showPass ? "Hide password" : "Show password"}
                onClick={() => setShowPass((s) => !s)}
                tabIndex={0}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="row between">
            <label className="checkbox">
              <input type="checkbox" disabled={loading} /> Remember me
            </label>
            <Link to="/forgot" className="link">
              Forgot password?
            </Link>
          </div>

          <button
            className="primary-btn"
            disabled={loading || !username || !password}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <footer className="auth-footer">
          <span className="muted">Need an account?</span>{" "}
          <Link to="/userSignUp" className="link-strong">
            Sign up
          </Link>
        </footer>
      </section>
    </main>
  );
}
