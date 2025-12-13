import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const toBool = (v) => {
  if (v === true || v === 1) return true;
  if (typeof v === "string") {
    const norm = v.trim().toLowerCase();
    return norm === "1" || norm === "true" || norm === "yes";
  }
  return false;
};

export default function Profile() {
  const [form, setForm] = useState({
    UserID: null,
    Username: "",
    FirstName: "",
    LastName: "",
    Email: "",
    Level: "",
    StableOwner: false,
  });
  const [stables, setStables] = useState([]);
  const [horses, setHorses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const upcomingBookings = useMemo(() => {
    const list = (bookings || [])
      .filter((b) => {
        const status = (b.Status || "").toString().toLowerCase();
        if (status === "cancelled" || status === "canceled") return false;
        if (status === "completed") return false;
        return true;
      })
      .map((b) => {
        const tsRaw =
          b.StartTime ||
          b.ScheduledFor ||
          b.SlotStartTime ||
          b.CreatedAt ||
          null;
        const typeLabel = (b.Type || "").toString().toLowerCase();
        const prettyType = typeLabel ? typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1) : "Booking";
        const idLabel = b.ResourceID || b.ServiceID || b.LessonID || b.BoardingID || b.BookingID;
        const title =
          b.ServiceName ||
          b.Name ||
          (typeLabel === "service" ? `Service #${idLabel || ""}`.trim() : `${prettyType} ${idLabel ? `#${idLabel}` : ""}`.trim());
        const stableLabel = b.StableName || b.Location || "";
        const ts = tsRaw ? Date.parse(tsRaw) : null;
        return {
          id: b.BookingID ?? b.id,
          title,
          ts,
          dateLabel: ts ? new Date(ts).toLocaleString() : "Scheduled",
          location: stableLabel || "Stable",
          type: b.Status || prettyType,
        };
      })
      .sort((a, b) => (a.ts ?? Infinity) - (b.ts ?? Infinity))
      .slice(0, 5);
    return list;
  }, [bookings]);

  const initials = useMemo(() => {
    const a = (form.FirstName || "").trim()[0] || "";
    const b = (form.LastName || "").trim()[0] || "";
    const fallback = (form.Username || "").trim()[0] || "?";
    return (a + b || fallback).toUpperCase();
  }, [form]);

  useEffect(() => {
    (async () => {
      try {
        const me = await api("/api/auth/me");
        setForm((f) => ({
          ...f,
          UserID: me.UserID,
          Username: me.Username || "",
          FirstName: me.FirstName || "",
          LastName: me.LastName || "",
          Email: me.Email || "",
          Level: me.Level || "",
          StableOwner: toBool(me.StableOwner ?? me.stableOwner),
        }));

        let stbs = [];
        try {
          const stablesRes = await api("/api/stables?page=1&pageSize=100");
          stbs = Array.isArray(stablesRes?.data)
            ? stablesRes.data.filter((s) => (s.OwnerID ?? s.ownerId ?? s.ownerID) === me.UserID)
            : [];
        } catch {
          stbs = [];
        }
        setStables(stbs);

        try {
          const hrs = await api(`/api/users/${me.UserID}/horses`);
          setHorses(Array.isArray(hrs) ? hrs : []);
        } catch {
          setHorses([]);
        }
        try {
          const base = await api(`/api/users/${me.UserID}/bookings`);
          const future = await api(`/api/users/${me.UserID}/bookings?futureOnly=true`);
          console.info("[profile] bookings base", base);
          console.info("[profile] bookings future", future);
          const normalize = (v) =>
            (Array.isArray(v) && v) ||
            (Array.isArray(v?.data) && v.data) ||
            (Array.isArray(v?.bookings) && v.bookings) ||
            (Array.isArray(v?.results) && v.results) ||
            [];
          const combined = [...normalize(base), ...normalize(future)];
          const deduped = [];
          const seen = new Set();
          combined.forEach((b) => {
            const key = b.BookingID ?? b.id ?? `${b.Type || ""}-${b.ResourceID || ""}-${b.StartTime || ""}`;
            if (key && seen.has(key)) return;
            if (key) seen.add(key);
            deduped.push(b);
          });
          console.info("[profile] bookings combined", deduped);
          setBookings(deduped);
        } catch (err) {
          console.warn("[profile] bookings fetch failed", err);
          setBookings([]);
        }
      } catch (e) {
        setErr(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave(e) {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      if (!form.UserID) throw new Error("Missing user id");
      const role = toBool(form.StableOwner) ? "StableOwner" : "User";
      const payload = {
        firstName: form.FirstName?.trim() || null,
        lastName: form.LastName?.trim() || null,
        email: form.Email?.trim() || null,
        level: form.Level || null,
        StableOwner: toBool(form.StableOwner) ? 1 : 0,
        stableOwner: toBool(form.StableOwner) ? 1 : 0, // keep lowercase for backends that expect it
        Role: role,
      };
      const endpoint = `/api/users/${form.UserID}`;
      const updated = await api(endpoint, { method: "PUT", body: JSON.stringify(payload) });
      setForm((prev) => ({
        ...prev,
        ...updated,
        StableOwner: toBool(updated?.StableOwner ?? updated?.stableOwner),
      }));
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10">
        <div className="container mx-auto space-y-4">
          <div className="h-24 rounded-3xl bg-[hsl(var(--muted))] animate-pulse" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-48 rounded-2xl bg-[hsl(var(--muted))] animate-pulse" />
            <div className="h-48 rounded-2xl bg-[hsl(var(--muted))] animate-pulse" />
          </div>
          <div className="h-40 rounded-2xl bg-[hsl(var(--muted))] animate-pulse" />
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
        <header className="flex items-center gap-4 bg-white rounded-3xl shadow-card border border-[hsl(var(--border))] p-6">
          <div className="h-14 w-14 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center text-xl font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">@{form.Username}</p>
            <h1 className="text-2xl font-serif text-[hsl(var(--rich-brown))]">My profile</h1>
          </div>
        </header>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
          <div className="space-y-6">
            <section className="bg-white rounded-3xl shadow-card border border-[hsl(var(--border))] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">My info</h2>
                <button
                  className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold disabled:opacity-60"
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>

              <form className="space-y-4" onSubmit={onSave}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">First name</label>
                    <input
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      value={form.FirstName}
                      onChange={(e) => setForm((f) => ({ ...f, FirstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Last name</label>
                    <input
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      value={form.LastName}
                      onChange={(e) => setForm((f) => ({ ...f, LastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[hsl(var(--muted-foreground))]">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                    value={form.Email}
                    onChange={(e) => setForm((f) => ({ ...f, Email: e.target.value }))}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-2">
                    <label className="text-sm text-[hsl(var(--muted-foreground))]">Rider Level</label>
                    <select
                      className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                      value={form.Level || ""}
                      onChange={(e) => setForm((f) => ({ ...f, Level: e.target.value }))}
                    >
                      <option value="">Select level (optional)</option>
                      {LEVEL_OPTIONS.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] px-4 py-3 bg-[hsl(var(--card))]">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--rich-brown))]">Stable owner</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Enable if you manage barns.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!form.StableOwner}
                        onChange={(e) => setForm((f) => ({ ...f, StableOwner: e.target.checked }))}
                      />
                      <div className="w-11 h-6 bg-[hsl(var(--muted))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[hsl(var(--primary))] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </form>
            </section>

            {form.StableOwner && (
              <section className="bg-white rounded-3xl shadow-card border border-[hsl(var(--border))] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">My Stables</h2>
                  <Link to="/stableSignUp" className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold">
                    + Add stable
                  </Link>
                </div>
                {stables.length === 0 ? (
                  <EmptyState
                    title="No stables yet"
                    body="Create your first stable to manage listings."
                    cta={<Link to="/stableSignUp" className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold">Create stable</Link>}
                  />
                ) : (
                  <ul className="divide-y divide-[hsl(var(--border))]">
                    {stables.map((s) => (
                      <li key={s.StableID ?? s.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[hsl(var(--rich-brown))]">{s.StableName ?? s.name}</div>
                          <div className="text-sm text-[hsl(var(--muted-foreground))]">{formatAddress(s)}</div>
                        </div>
                        <Link to={`/stables/${s.StableID ?? s.id}`} className="text-[hsl(var(--primary))] font-semibold">View</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            <section className="bg-white rounded-3xl shadow-card border border-[hsl(var(--border))] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">My Horses</h2>
                <Link to="/createHorse" className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))] font-semibold">
                  + Add horse
                </Link>
              </div>

              {horses.length === 0 ? (
                <EmptyState
                  title="No horses added"
                  body="Add a horse profile to manage care notes and services."
                  cta={<Link to="/createHorse" className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold">Add horse</Link>}
                />
              ) : (
                <ul className="grid md:grid-cols-2 gap-4">
                  {horses.map((h) => (
                    <li key={h.HorseID ?? h.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-card flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center font-semibold">
                        {(h.Name || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[hsl(var(--rich-brown))]">{h.Name}</div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                          {h.Breed ? h.Breed : "-"} {h.DOB ? `* DOB: ${formatDate(h.DOB)}` : ""}
                        </div>
                      </div>
                      <Link to={`/users/${form.UserID}/horses/${h.HorseID ?? h.id}`} className="text-[hsl(var(--primary))] font-semibold">Open</Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <section className="bg-white rounded-3xl shadow-card border border-[hsl(var(--border))] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[hsl(var(--rich-brown))]">Upcoming bookings</h2>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">Soon</div>
              </div>

              {upcomingBookings.length === 0 ? (
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-[hsl(var(--muted-foreground))]">
                  No upcoming lessons or boarding yet. When you book services, they will appear here.
                </div>
              ) : (
                <ul className="space-y-3">
                  {upcomingBookings.map((b) => (
                    <li key={b.id} className="flex items-center gap-3">
                      <div className="text-sm text-[hsl(var(--muted-foreground))]">{b.dateLabel}</div>
                      <div>
                        <div className="font-semibold text-[hsl(var(--rich-brown))]">{b.title}</div>
                        <div className="text-sm text-[hsl(var(--muted-foreground))]">{b.location} * {b.type}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2">
                <Link to="/services/upcoming" className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))]">View upcoming</Link>
                <Link to="/services/history" className="px-3 py-2 rounded-lg text-[hsl(var(--primary))]">Past services</Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function formatAddress(s) {
  const address = s.Address ?? s.address;
  const city = s.City ?? s.city;
  const state = s.State ?? s.state;
  const zip = s.Zipcode ?? s.zip ?? s.zipcode;
  if (!address && !city) return "-";
  return [address, [city, state].filter(Boolean).join(", "), zip]
    .filter(Boolean)
    .join(" * ");
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

function EmptyState({ title, body, cta }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--primary))] font-semibold" aria-hidden>
        SS
      </div>
      <div className="flex-1">
        <div className="font-semibold text-[hsl(var(--rich-brown))]">{title}</div>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">{body}</div>
      </div>
      {cta && <div>{cta}</div>}
    </div>
  );
}
