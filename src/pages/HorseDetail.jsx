import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { api } from "../lib/api";

export default function HorseDetail() {
  const { stableId, userId, horseId } = useParams();
  const navigate = useNavigate();
  const [horse, setHorse] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const me = useMemo(() => {
    try { return getCurrentUser() || null; } catch { return null; }
  }, []);
  const myId = me?.UserID ?? me?.id ?? null;
  const isOwner = myId && (Number(userId) === myId || (horse && horse.OwnerID === myId));

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const endpoint = stableId
          ? `/api/stables/${stableId}/horses/${horseId}`
          : `/api/users/${userId}/horses/${horseId}`;
        const data = await api(endpoint);
        setHorse(data);
      } catch (e) {
        setErr(e.message || "Failed to load horse");
      } finally {
        setLoading(false);
      }
    })();
  }, [stableId, userId, horseId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4">
        <div className="h-32 w-32 rounded-2xl bg-[hsl(var(--muted))] animate-pulse" />
      </main>
    );
  }

  if (err || !horse) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))] px-6 py-4 text-center space-y-3">
          <p>{err || "Horse not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))]"
          >
            Go back
          </button>
        </div>
      </main>
    );
  }

  const backHref = stableId ? `/stables/${stableId}/horses` : `/profile`;

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center font-semibold text-xl">
              {(horse.Name || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Horse</p>
              <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">{horse.Name}</h1>
            </div>
          </div>
          <Link
            to={backHref}
            className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold"
          >
            Back
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard label="Breed" value={horse.Breed} />
          <InfoCard label="Sex" value={horse.Sex} />
          <InfoCard label="Temperament" value={horse.Temperament} />
          <InfoCard label="DOB" value={formatDate(horse.DOB)} />
        </div>

        <div className="rounded-3xl border border-[hsl(var(--border))] bg-white shadow-card p-6">
          <h2 className="text-lg font-semibold text-[hsl(var(--rich-brown))] mb-2">Public visibility</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-3">
            {horse.isPublic ?? horse.IsPublic ?? horse.IsVisible ? "Visible to visitors" : "Hidden from visitors"}
          </p>
          {isOwner && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Toggle visibility from the horses list.</p>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-white shadow-card p-4">
      <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold text-[hsl(var(--rich-brown))]">{value || "-"}</p>
    </div>
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
