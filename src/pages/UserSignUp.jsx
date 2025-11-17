import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setSession } from "../lib/auth";
import "../styles/userSignUp.css";

const isEmail = (s) => /\S+@\S+\.\S+/.test(s || "");
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export default function UserSignUp() {
  const navigate = useNavigate();

  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [level, setLevel]         = useState("");
  const [stableOwner, setStableOwner] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username.trim()) return setError("Username is required.");
    if (!password.trim()) return setError("Password is required.");
    if (email && !isEmail(email)) return setError("Please enter a valid email.");

    const payload = {
      username: username.trim(),
      password,
      ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
      ...(lastName.trim()  ? { lastName: lastName.trim() }   : {}),
      ...(email.trim()     ? { email: email.trim() }         : {}),
      ...(level.trim()     ? { level: level.trim() }         : {}),
      stableOwner: stableOwner ? 1 : 0,
    };

    setSubmitting(true);
    try {
      const { user, token } = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSession({ user, token });
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="user-signup-container">
      <div className="user-signup-inner">
        <header className="user-signup-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Set up a rider profile to find lessons and stables faster.
          </p>
        </header>

        <form onSubmit={onSubmit} className="card form-card" noValidate>
          <div className="form-grid">
            <div className="form-row cols-2">
              <div>
                <label htmlFor="username" className="label">
                  Username <span className="req">*</span>
                </label>
                <input
                  id="username"
                  className="input"
                  placeholder="Enter a username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="label">
                  Password <span className="req">*</span>
                </label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="Enter a password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="form-row cols-2">
              <div>
                <label htmlFor="firstName" className="label">First name</label>
                <input
                  id="firstName"
                  className="input"
                  placeholder="Enter first name..."
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="label">Last name</label>
                <input
                  id="lastName"
                  className="input"
                  placeholder="Enter last name..."
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-row cols-2">
              <div>
                <label htmlFor="level" className="label">Riding level</label>
                <select
                  id="level"
                  className="input select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">Select level (optional)</option>
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="toggle-cell">
                <span className="label">I&apos;m a stable owner</span>
                <label className="switch">
                  <input
                    id="stableOwner"
                    type="checkbox"
                    checked={stableOwner}
                    onChange={(e) => setStableOwner(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-brown" disabled={submitting} type="submit">
                {submitting ? "Creating…" : "Sign up"}
              </button>
              {error && <div className="form-error" role="alert">{error}</div>}
            </div>
          </div>
        </form>

        <p className="form-note user-signup-note">
          Already have an account? <Link to="/login">Log in</Link>.
        </p>
      </div>
    </section>
  );
}