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
        <p>Find nearby stables, lessons, and boarding services</p>
        <div style={{ marginTop: 12 }}>
          <Link className="link active" to="/search">Browse Nearby Stables</Link>
          <Link className="link active" to="/stableSignUp">I'm a stable owner</Link>
        </div>
      </header>
    </section>
  );
}



