import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { api } from "../lib/api";

export default function StableHorses() {
  const { id } = useParams();
  const [stable, setStable] = useState(null);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const user = useMemo(() => {
    try { return getCurrentUser() || null; } catch { return null; }
  }, []);
  const userId = user?.UserID ?? user?.id ?? null;
  const isOwner = stable && userId && stable.OwnerID === userId;

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const s = await api(`/api/stables/${id}`);
        setStable(s);
        const list = await api(`/api/stables/${id}/horses`);
        setHorses(Array.isArray(list) ? list : []);
      } catch (e) {
        setErr(e.message || "Failed to load horses");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function togglePublic(horseId, current) {
    try {
      const updated = await api(`/api/stables/${id}/horses/${horseId}`, {
        method: "PUT",
        body: JSON.stringify({ isPublic: current ? 0 : 1 }),
      });
      setHorses((prev) =>
        prev.map((h) =>
          (h.HorseID ?? h.id) === horseId ? { ...h, ...updated } : h
        )
      );
    } catch (e) {
      setErr(e.message || "Failed to update visibility");
    }
  }

  const visibleHorses = isOwner
    ? horses
    : horses.filter(h => {
        const v = h.isPublic ?? h.IsPublic ?? h.IsVisible ?? h.isVisible;
        return v === undefined ? true : !!v;
      });

  if (loading) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10">
        <div className="container mx-auto space-y-4">
          <div className="h-14 rounded-2xl bg-[hsl(var(--muted))] animate-pulse" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-[hsl(var(--muted))] animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))] px-6 py-4">
          {err}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Stable horses</p>
            <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">
              {stable?.StableName || "Stable"} - Horses
            </h1>
          </div>
          <Link
            to={`/stables/${id}`}
            className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold"
          >
            Back to profile
          </Link>
        </div>

        {visibleHorses.length === 0 ? (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white shadow-card p-6 text-[hsl(var(--muted-foreground))]">
            {isOwner
              ? "No horses added yet."
              : "No public horses available for this stable."}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleHorses.map(h => {
              const horseId = h.HorseID ?? h.id;
              const isPublic = h.isPublic ?? h.IsPublic ?? h.IsVisible ?? h.isVisible ?? false;
              return (
                <div key={horseId} className="rounded-2xl border border-[hsl(var(--border))] bg-white shadow-card p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center font-semibold">
                      {(h.Name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-[hsl(var(--rich-brown))]">{h.Name}</div>
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">
                        {h.Breed || "-"} {h.DOB ? `• DOB: ${formatDate(h.DOB)}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    Temperament: {h.Temperament || "N/A"}
                  </div>

                  {isOwner && (
                    <label className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm">
                      <span className="text-[hsl(var(--rich-brown))]">Publicly viewable</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!isPublic}
                        onChange={() => togglePublic(horseId, !!isPublic)}
                      />
                    </label>
                  )}
                  <div className="flex justify-end">
                    <Link
                      to={`/stables/${id}/horses/${horseId}`}
                      className="text-[hsl(var(--primary))] font-semibold text-sm"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function formatDate(d) {
  try {
    const dt = new Date(d);
    if (isNaN(+dt)) return d;
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}
