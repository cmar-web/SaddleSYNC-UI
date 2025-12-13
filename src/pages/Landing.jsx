import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--accent)/0.12),transparent_30%),radial-gradient(circle_at_80%_0%,hsl(var(--primary)/0.2),transparent_35%),var(--gradient-hero)]" />
        <div className="absolute inset-0 mix-blend-multiply">
          <img
            src={heroImg}
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        <div className="relative container mx-auto px-6 py-16 md:py-24 lg:py-28 grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 text-sm font-medium text-[hsl(var(--rich-brown))] shadow-soft">
              Welcome to SaddleSync
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight text-white drop-shadow">
              Find lessons, boarding, and stables that feel like home.
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Discover trusted programs, plan moves for your horse, and connect directly
              with barns that match your riding goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/search"
                className="px-5 py-3 rounded-xl bg-white text-[hsl(var(--primary))] font-semibold shadow-elevated hover:-translate-y-0.5 transition-transform"
              >
                Browse stables near me
              </Link>
              <Link
                to="/stableSignUp"
                className="px-5 py-3 rounded-xl border border-white/70 text-white font-semibold hover:bg-white/10 backdrop-blur"
              >
                List my stable
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-white/90">
              {[
                { label: "Riding programs", value: "Lessons" },
                { label: "Boarding availability", value: "Boarding" },
                { label: "Verified owners", value: "Owner led" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-white/10 border border-white/20">
                  <div className="text-sm uppercase tracking-wide">{item.label}</div>
                  <div className="text-lg font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-white/40 blur-3xl rounded-full" aria-hidden />
            <div className="relative bg-white shadow-elevated rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-full bg-[hsl(var(--primary)/0.12)] flex items-center justify-center text-[hsl(var(--primary))] font-serif text-xl">
                  SS
                </span>
                <div>
                  <p className="text-sm uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Your next barn</p>
                  <p className="text-lg font-semibold text-[hsl(var(--rich-brown))]">Curated matches</p>
                </div>
              </div>

              <div className="grid gap-3">
                {["Indoor/Outdoor arenas", "Lesson & lease programs", "Horse-first care"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--primary))] font-semibold">
                      ✓
                    </span>
                    <span className="text-[hsl(var(--foreground))] font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-card">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Ready to get started?</p>
                <p className="text-lg font-semibold text-[hsl(var(--rich-brown))]">Tell us where you ride.</p>
                <Link
                  to="/search"
                  className="mt-3 inline-flex items-center gap-2 text-[hsl(var(--primary))] font-semibold"
                >
                  Search by city →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* overview */}
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">
              Designed for movers & riders
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-[hsl(var(--rich-brown))]">
              SaddleSync keeps riders, horses, and barns in sync.
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-lg leading-relaxed">
              Whether you&apos;re relocating or finding your first barn, browse lesson programs, boarding
              availability, and stable profiles built by owners themselves.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {[
                { title: "Lesson-ready", body: "Filter by discipline, level, and price to find the right trainer." },
                { title: "Move-in help", body: "Boarding cards show amenities, turnout, and stall counts." },
                { title: "Owner verified", body: "Stable owners control their listings and media uploads." },
                { title: "Built for horses", body: "Track your horses and connect them to lesson/boarding requests." },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-2xl bg-[hsl(var(--card))] shadow-card border border-[hsl(var(--border))]">
                  <h3 className="font-semibold text-[hsl(var(--rich-brown))]">{item.title}</h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1.5 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))] shadow-elevated p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Active barns", value: "Hundreds" },
                { label: "States covered", value: "50" },
                { label: "Lesson types", value: "English & Western" },
                { label: "Move support", value: "Boarding ready" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-2xl bg-white/80 border border-[hsl(var(--border))]">
                  <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                  <p className="text-xl font-semibold text-[hsl(var(--rich-brown))]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* featured */}
      <div className="container mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">Featured</p>
            <h3 className="text-2xl font-serif text-[hsl(var(--rich-brown))]">Stables riders love</h3>
          </div>
          <Link
            to="/search"
            className="text-[hsl(var(--primary))] font-semibold hover:underline"
          >
            See all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--muted-foreground))] shadow-card">
            No featured stables yet. Start browsing to discover barns near you.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((stable) => (
              <article
                key={stable.StableID}
                className="rounded-2xl border border-[hsl(var(--border))] bg-white shadow-card p-5 hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xl font-semibold text-[hsl(var(--rich-brown))]">
                    {stable.StableName}
                  </h4>
                  <span className="text-xs px-3 py-1 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                    Stable
                  </span>
                </div>
                <p className="text-[hsl(var(--muted-foreground))]">
                  {stable.City}, {stable.State}
                </p>
                <Link
                  to={`/stables/${stable.StableID}`}
                  className="mt-3 inline-flex items-center gap-2 text-[hsl(var(--primary))] font-semibold"
                >
                  View profile →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
