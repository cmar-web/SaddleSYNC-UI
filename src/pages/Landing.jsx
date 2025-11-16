import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/landing.css";
import heroImg from "../assets/horses-landing.jpg";

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
      <div className="landing-hero">
        <div className="landing-hero-bg" aria-hidden="true">
          <img
            src={heroImg}
            alt=""
            className="landing-hero-img"
          />
        </div>

        <div className="landing-hero-inner container">
          <header className="hero">
            <h1 className="hero-title">SADDLESYNC</h1>

            <p className="hero-subtitle">
              Connect with local stables, lessons, and boarding when life moves you.
            </p>

            <div className="hero-ctas">
              <Link to="/search" className="btn-cta big">
                Find Riding Lessons or Boarding Services
              </Link>
              <Link to="/stableSignUp" className="btn-cta big">
                I&apos;m a Stable Owner
              </Link>
            </div>
          </header>
        </div>
      </div>

      <div className="landing-content">
        <div className="container">
          <section className="landing-description">
            <h2 className="landing-description-title">What is SaddleSync?</h2>
            <p className="landing-description-body">
              SaddleSync helps riders and horse owners quickly get oriented in a new area.
              Whether moving to a new city or exploring a new hobby, it brings together
              local lesson programs, boarding options, and stable details in one place.
            </p>
            <p className="landing-description-body">
              Riders can browse stables, compare services, and reach out for lessons or
              boarding. Stable owners can showcase their barns, horses, and offerings so
              the right clients can find them more easily.
            </p>
          </section>

          {featured.length > 0 && (
            <section className="landing-featured">
              <h3 className="landing-featured-title">Featured stables</h3>
              <div className="landing-featured-grid">
                {featured.map((stable) => (
                  <article key={stable.StableID} className="landing-featured-card">
                    <h4 className="landing-featured-name">{stable.StableName}</h4>
                    <p className="landing-featured-location">
                      {stable.City}, {stable.State}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
