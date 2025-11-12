// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setSession } from "../lib/auth";
import { api } from "../lib/api";
import "../styles/userLogin.css";

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
    <section className="container auth">
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-subtitle">Log in to continue</p>

      <form className="card form-card" onSubmit={onSubmit} noValidate>
        <div className="form-grid">
          {error && <div className="form-error" role="alert">{error}</div>}

          <div className="form-row">
            <label htmlFor="username" className="label">Username</label>
            <input
              id="username"
              className="input"
              type="text"
              inputMode="text"
              autoComplete="username"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="password" className="label">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                className="input"
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
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="row between">
            <label className="checkbox">
              <input type="checkbox" disabled={loading} /> Remember me
            </label>
            <Link to="/forgot" className="link-strong">Forgot password?</Link>
          </div>

          <div className="form-actions">
            <button
              className="btn-brown"
              disabled={loading || !username || !password}
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </div>
        </div>
      </form>

      <p className="form-note">
        Need an account? <Link to="/userSignUp">Sign up</Link>.
      </p>
    </section>
  );
}
