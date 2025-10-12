// landing.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Landing() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/stables?page=1&pageSize=6");
      const json = await res.json();
      setFeatured(json.data ?? []);
    })();
  }, []);

  return (
    <section>
      <header style={{ marginBottom: 24 }}>
        <h1>Saddle Sync</h1>
        <p>Find nearby stables, lessons, and boarding—fast.</p>
        <div style={{ marginTop: 12 }}>
          <Link className="link active" to="/search">Browse Nearby Stables</Link>
        </div>
      </header>

      <div className="grid" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))" }}>
        {featured.map((s) => (
          <Link key={s.id} to={`/stables/${s.id}`} className="card">
            <h3 style={{ margin: 0 }}>{s.name}</h3>
            <p style={{ margin: "4px 0 0 0" }}>{s.city}, {s.state}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
