import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setSession } from "../lib/auth";

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
    <main className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="bg-white shadow-elevated rounded-3xl border border-[hsl(var(--border))] p-8 md:p-10 space-y-6">
          <header className="space-y-2 text-center">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Create your account</p>
            <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">Join SaddleSync</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Set up a rider profile to find lessons and stables faster.</p>
          </header>

          {error && (
            <div className="rounded-xl border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))] px-4 py-3 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm text-[hsl(var(--muted-foreground))]">Username *</label>
                <input
                  id="username"
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  placeholder="Enter a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-[hsl(var(--muted-foreground))]">Password *</label>
                <input
                  id="password"
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  type="password"
                  placeholder="Enter a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm text-[hsl(var(--muted-foreground))]">First name</label>
                <input
                  id="firstName"
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm text-[hsl(var(--muted-foreground))]">Last name</label>
                <input
                  id="lastName"
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-[hsl(var(--muted-foreground))]">Email</label>
              <input
                id="email"
                className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <label htmlFor="level" className="text-sm text-[hsl(var(--muted-foreground))]">Riding level</label>
                <select
                  id="level"
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">Select level (optional)</option>
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] px-4 py-3 bg-[hsl(var(--card))]">
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--rich-brown))]">I am a stable owner</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Toggle on if you plan to list a barn.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="stableOwner"
                    type="checkbox"
                    className="sr-only peer"
                    checked={stableOwner}
                    onChange={(e) => setStableOwner(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[hsl(var(--muted))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[hsl(var(--primary))] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>

            <button
              className="w-full rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 shadow-soft disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Creating..." : "Sign up"}
            </button>
          </form>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Already have an account? {""}
            <Link to="/login" className="text-[hsl(var(--primary))] font-semibold">Log in</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
