// UserSignUp.jsx
import { useEffect, useState } from "react";

export default function UserSignUp() {
  const API = import.meta.env.VITE_API_URL || "";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // load existing users
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API}/api/users`);
        if (!r.ok) throw new Error(`failed to load users (${r.status})`);
        const data = await r.json();
        if (!cancelled) setUsers(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "failed to load users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [API]);

  async function addUser(e) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("username and password are required");
      return;
    }
    setCreating(true);
    try {
      const r = await fetch(`${API}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (!r.ok) {
        const msg = await safeErrorMessage(r);
        throw new Error(msg || "create failed");
      }
      const created = await r.json(); 
      setUsers(u => [created, ...u]);
      setUsername("");
      setPassword("");
    } catch (e) {
      setError(e.message || "create failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1>Users</h1>

      <form onSubmit={addUser} style={{ marginBottom: 16, display: "grid", gap: 8, maxWidth: 360 }}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="username"
          autoComplete="username"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="password"
          autoComplete="new-password"
        />
        <button disabled={creating || !username.trim() || !password.trim()}>
          {creating ? "Creating..." : "Create user"}
        </button>
        {error ? <div style={{ color: "crimson", fontSize: 14 }}>{error}</div> : null}
      </form>

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <ul>
          {users.map(u => (
            <li key={u.UserID}>
              {u.Username} <small>({u.UserID})</small>
            </li>
          ))}
          {!users.length && <li>No users yet</li>}
        </ul>
      )}
    </div>
  );
}

// small helper for err logging
async function safeErrorMessage(r) {
  try {
    const j = await r.json();
    return j?.error || j?.message;
  } catch {
    return null;
  }
}
