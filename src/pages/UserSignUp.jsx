import { useState } from "react";
import { Link } from "react-router-dom";

const isEmail = (s) => /\S+@\S+\.\S+/.test(s || "");
// options fo r level dropdown
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export default function UserSignUp() {
  const API = (import.meta.env.VITE_API_URL || "") + "/api/users";

  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [level, setLevel]         = useState(""); 

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setOk(false);

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
    };

    setSubmitting(true);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text() || "Create failed");

      setOk(true);
      setUsername(""); setPassword("");
      setFirstName(""); setLastName(""); setEmail(""); setLevel("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container auth">
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">Rider / regular user sign up</p>

      <form onSubmit={onSubmit} className="card form-card" noValidate>
        <div className="form-grid">
          <div className="form-row">
            <label htmlFor="username" className="label">Username <span className="req">*</span></label>
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

          <div className="form-row">
            <label htmlFor="password" className="label">Password <span className="req">*</span></label>
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
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-row">
            <label htmlFor="level" className="label">Level</label>
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

          <div className="form-actions">
            <button className="btn-brown" disabled={submitting} type="submit">
              {submitting ? "Creating…" : "Sign up"}
            </button>
            {error && <div className="form-error" role="alert">{error}</div>}
            {ok && <div className="form-success" role="status">Account created!</div>}
          </div>
        </div>
      </form>

      <p className="form-note">
        Are you a stable owner? <Link to="/stableSignUp">Create a stable account</Link>.
      </p>
    </section>
  );
}
