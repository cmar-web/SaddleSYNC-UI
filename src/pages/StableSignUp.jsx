// StableSignUp.jsx
import { useEffect, useState } from "react";

export default function StableSignUp() {
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/api/users")
      .then(r => r.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  async function addUser(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const r = await fetch(import.meta.env.VITE_API_URL + "/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!r.ok) throw new Error("Create failed");
      const created = await r.json();
      setUsers(u => [created, ...u]);
      setName("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1>Users</h1>

      <form onSubmit={addUser} style={{ marginBottom: 16 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
        />
        <button disabled={creating || !name.trim()}>
          {creating ? "Adding..." : "Add"}
        </button>
      </form>

      <ul>
        {users.map(u => (
          <li key={u.Id}>{u.Name} <small>({u.Id})</small></li>
        ))}
      </ul>
    </div>
  );
}
