import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Landing() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stables?page=1&pageSize=6");
        const json = await res.json();
        setFeatured(Array.isArray(json?.data) ? json.data : []);
      } catch {
        setFeatured([]);
      }
    })();
  }, []);

  return (
    <section className="landing">
      {/* hero */}
      <header className="hero">
        <h1 className="hero-title">SADDLESYNC</h1>

        {/* just decorative bars under the title */}
        <div className="hero-bars" aria-hidden="true">
          <span className="bar bar-1" />
          <span className="bar bar-2" />
          <span className="bar bar-3" />
          <span className="bar bar-4" />
        </div>

        {/* navs for lessons, boarding, and stablesign up */}
        <div className="hero-ctas">
          <Link to="/search" className="btn-cta big">Find Riding Lessons or Boarding Services</Link>
          <Link to="/stableSignUp" className="btn-cta big">I’m a Stable Owner</Link>
        </div>
      </header>
    </section>
  );
}
