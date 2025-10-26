import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, clearCurrentUser } from "../lib/auth";

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export default function UserProfile() {
  const API = (import.meta.env.VITE_API_URL || "") + "/api";
  const navigate = useNavigate();

  // get current session
  const sessionUser = useMemo(() => getCurrentUser(), []);
  const userId = sessionUser?.UserID;

  // gate if not logged in
  if (!userId) {
    return (
      <section className="container auth">
        <h1 className="auth-title">Your profile</h1>
        <div className="card" style={{ padding: "1rem" }}>
          <p>You need to be logged in to view your profile.</p>
          <p className="form-actions">
            <Link className="btn-brown" to="/login">Log in</Link>
            <Link className="btn btn-light" to="/userSignUp">Create an account</Link>
          </p>
        </div>
      </section>
    );
  }

  // form state
  const [base, setBase] = useState(null); // server truth we compare against
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState(""); // blank means "don’t change"
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [level, setLevel]         = useState("");

  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  // owned stables
  const [stables, setStables] = useState([]);
  const [loadingStables, setLoadingStables] = useState(true);

  // load latest user profile
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API}/users/${userId}`);
        const data = await r.json();
        if (cancelled) return;
        setBase(data);
        setUsername(data.Username || "");
        setFirstName(data.FirstName || "");
        setLastName(data.LastName || "");
        setEmail(data.Email || "");
        setLevel(data.Level || "");
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, [API, userId]);

  // load owned stables
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API}/stables`);
        const arr = await r.json();
        if (cancelled) return;
        const mine = Array.isArray(arr) ? arr.filter(s => s.OwnerID === userId) : [];
        setStables(mine);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStables(false);
      }
    })();
    return () => { cancelled = true; };
  }, [API, userId]);

  async function onSave(e) {
    e.preventDefault();
    if (!base) return;
    setError("");
    setOk(false);

    // Build a minimal diff payload; only send fields that changed.
    const diff = {};
    if (username.trim() !== (base.Username || "")) diff.username = username.trim();
    if (password.trim()) diff.password = password; // only when provided
    if (firstName !== (base.FirstName || "")) diff.firstName = firstName; // empty string clears to NULL (your controller handles it)
    if (lastName  !== (base.LastName  || "")) diff.lastName  = lastName;
    if (email     !== (base.Email     || "")) diff.email     = email;
    if (level     !== (base.Level     || "")) diff.level     = level;

    if (Object.keys(diff).length === 0) {
      setOk(true);
      return;
    }

    setSaving(true);
    try {
      // If your route uses PATCH instead, change method to 'PATCH'
      const r = await fetch(`${API}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diff),
      });
      if (!r.ok) throw new Error((await r.text()) || "Update failed");
      const updated = await r.json();
      setBase(updated);
      setPassword(""); // clear password field
      setOk(true);

      // keep session in sync (Navbar, etc.)
      setCurrentUser(updated);
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    const sure = window.confirm("Delete your account? This cannot be undone.");
    if (!sure) return;
    try {
      const r = await fetch(`${API}/users/${userId}`, { method: "DELETE" });
      if (r.status !== 204 && !r.ok) {
        throw new Error((await r.text()) || "Delete failed");
      }
      clearCurrentUser();
      navigate("/", { replace: true });
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  }

  return (
    <section className="container profile">
      <h1 className="auth-title">Your profile</h1>

      <div className="profile-grid">
        {/* Profile form */}
        <form className="card form-card" onSubmit={onSave} noValidate>
          <h2 className="section-title">Account</h2>
          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="username" className="label">Username</label>
              <input id="username" className="input" value={username}
                     onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </div>

            <div className="form-row">
              <label htmlFor="password" className="label">Password</label>
              <input id="password" className="input" type="password" value={password}
                     onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
                     placeholder="Leave blank to keep current password" />
            </div>

            <div className="form-row cols-2">
              <div>
                <label htmlFor="firstName" className="label">First name</label>
                <input id="firstName" className="input" value={firstName}
                       onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
              </div>
              <div>
                <label htmlFor="lastName" className="label">Last name</label>
                <input id="lastName" className="input" value={lastName}
                       onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="email" className="label">Email</label>
              <input id="email" className="input" type="email" value={email}
                     onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>

            <div className="form-row">
              <label htmlFor="level" className="label">Level</label>
              <select id="level" className="input select" value={level}
                      onChange={(e) => setLevel(e.target.value)}>
                <option value="">Select level (optional)</option>
                {LEVEL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="form-actions">
              <button className="btn-brown" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              {ok && <div className="form-success" role="status">Saved!</div>}
              {error && <div className="form-error" role="alert">{error}</div>}
            </div>
          </div>
        </form>

        {/* Owned stables */}
        <div className="card" style={{ padding: "1rem" }}>
          <h2 className="section-title">Your stables</h2>
          {loadingStables ? (
            <div className="skeleton" style={{ height: 16, width: 180 }} />
          ) : stables.length === 0 ? (
            <>
              <p>You don’t own any stables yet.</p>
              <Link className="btn-brown" to="/stableSignUp">Create a stable</Link>
            </>
          ) : (
            <div className="stable-list">
              {stables.map(s => (
                <Link key={s.StableID} to={`/stables/${s.StableID}`} className="stable-item">
                  <div className="stable-name">{s.StableName}</div>
                  <div className="stable-meta">
                    {s.City}, {s.State} · #{s.StableID}
                  </div>
                </Link>
              ))}
              <div style={{ marginTop: ".75rem" }}>
                <Link className="btn-brown" to="/stableSignUp">Create another stable</Link>
              </div>
            </div>
          )}
        </div>
  
      </div>
    </section>
  );
}
