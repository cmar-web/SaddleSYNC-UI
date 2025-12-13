import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setSession } from "../lib/auth";
import { api } from "../lib/api";

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
    <main className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="bg-white shadow-elevated rounded-3xl border border-[hsl(var(--border))] p-8 space-y-6">
          <header className="space-y-2 text-center">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Welcome back</p>
            <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">Log in to SaddleSync</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              See your profile, horses, and saved stables.
            </p>
          </header>

          {error && (
            <div className="rounded-xl border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))] px-4 py-3 text-sm" role="alert">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-[hsl(var(--muted-foreground))]">Username</label>
              <input
                id="username"
                className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                type="text"
                inputMode="text"
                autoComplete="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-[hsl(var(--muted-foreground))]">Password</label>
              <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                <input
                  id="password"
                  className="flex-1 outline-none"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="text-[hsl(var(--primary))] font-semibold"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" disabled={loading} className="rounded" /> Remember me
              </label>
              <Link to="/forgot" className="text-[hsl(var(--primary))] font-semibold">
                Forgot password?
              </Link>
            </div>

            <button
              className="w-full rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 shadow-soft disabled:opacity-60"
              disabled={loading || !username || !password}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Need an account? {""}
            <Link to="/userSignUp" className="text-[hsl(var(--primary))] font-semibold">
              Sign up
            </Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
