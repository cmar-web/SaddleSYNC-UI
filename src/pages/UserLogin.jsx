import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setCurrentUser } from "../lib/auth";

export default function Login() {
  const API = (import.meta.env.VITE_API_URL || "") + "/api/auth/login";
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Enter username and password.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!r.ok) throw new Error((await r.text()) || "Login failed");
      const user = await r.json();
      setCurrentUser(user);                 
      navigate("/profile", { replace: true }); 
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container auth">
      <h1 className="auth-title">Log in</h1>
      <p className="auth-subtitle">Access your stable tools</p>

      <form onSubmit={onSubmit} className="card form-card" noValidate>
        <div className="form-grid">
          <div className="form-row">
            <label htmlFor="username" className="label">Username</label>
            <input id="username" className="input" value={username}
              onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div className="form-row">
            <label htmlFor="password" className="label">Password</label>
            <input id="password" className="input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="form-actions">
            <button className="btn-brown" disabled={submitting} type="submit">
              {submitting ? "Signing in…" : "Sign in"}
            </button>
            {error && <div className="form-error" role="alert">{error}</div>}
          </div>
        </div>
      </form>

      <p className="form-note">
        New here? <Link to="/userSignUp">Create an account</Link>.
      </p>
    </section>
  );
}
