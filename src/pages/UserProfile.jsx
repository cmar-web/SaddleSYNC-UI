// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import "../styles/profile.css";

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export default function Profile() {
  const [form, setForm] = useState({
    UserID: null,
    Username: "",
    FirstName: "",
    LastName: "",
    Email: "",
    Level: "",
    StableOwner: false, // bool toggle
  });
  const [stables, setStables] = useState([]);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const initials = useMemo(() => {
    const a = (form.FirstName || "").trim()[0] || "";
    const b = (form.LastName || "").trim()[0] || "";
    const fallback = (form.Username || "").trim()[0] || "?";
    return (a + b || fallback).toUpperCase();
  }, [form]);

  useEffect(() => {
    (async () => {
      try {
        //current user
        const me = await api("/api/auth/me");
        setForm(f => ({
          ...f,
          UserID: me.UserID,
          Username: me.Username || "",
          FirstName: me.FirstName || "",
          LastName: me.LastName || "",
          Email: me.Email || "",
          Level: me.Level || "",
          StableOwner: !!(me.StableOwner ?? false),
        }));

        // stables
        let stbs = [];
        try {
          stbs = await api("/api/stables?owner=me");
        } catch {
          const all = await api("/api/stables");
          stbs = (all || []).filter(s => (s.OwnerID ?? s.ownerId) === me.UserID);
        }
        setStables(Array.isArray(stbs) ? stbs : []);

        // horses
        let hrs = [];
        try {
          hrs = await api("/api/horses?owner=me");
        } catch {
          hrs = await api(`/api/users/${me.UserID}/horses`);
        }
        setHorses(Array.isArray(hrs) ? hrs : []);
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
      const payload = {
        FirstName: form.FirstName,
        LastName: form.LastName,
        Email: form.Email,
        Level: form.Level || null,
        StableOwner: !!form.StableOwner,
      };
      const endpoint = "/api/users/me";
      await api(endpoint, { method: "PATCH", body: JSON.stringify(payload) });
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="skeleton header-skeleton" />
        <div className="grid2">
          <div className="skeleton card-skeleton" />
          <div className="skeleton card-skeleton" />
        </div>
      </div>
    );
  }

  if (err) return <div className="form-error">{err}</div>;

  return (
    <div className="profile-container">
      {/* header */}
      <section className="profile-header">
        <div className="avatar" aria-hidden>{initials}</div>
        <div>
          <h1 className="title">My profile</h1>
          <p className="muted">@{form.Username}</p>
        </div>
      </section>

      <div className="grid2">
        {/* My Info */}
        <section className="card">
          <h2 className="section-title">My Info</h2>
          <form onSubmit={onSave} className="profile-form">
            <div className="row2">
              <div className="field">
                <label>First name</label>
                <input
                  value={form.FirstName}
                  onChange={e => setForm(f => ({ ...f, FirstName: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Last name</label>
                <input
                  value={form.LastName}
                  onChange={e => setForm(f => ({ ...f, LastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.Email}
                onChange={e => setForm(f => ({ ...f, Email: e.target.value }))}
              />
            </div>

            <div className="row2">
              <div className="field">
                <label>Rider Level</label>
                <select
                  value={form.Level || ""}
                  onChange={e => setForm(f => ({ ...f, Level: e.target.value }))}
                >
                  <option value="">Select level (optional)</option>
                  {LEVEL_OPTIONS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="field toggle-field">
                <label>Stable owner</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={!!form.StableOwner}
                    onChange={e => setForm(f => ({ ...f, StableOwner: e.target.checked }))}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>

            <div className="actions-right">
              <button className="btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* my stables - uses toggle from stableowner bit in db*/}
        {form.StableOwner && (
          <section className="card">
            <div className="section-head">
              <h2 className="section-title">My Stables</h2>
              <Link to="/stableSignUp" className="btn-ghost">+ Add stable</Link>
            </div>

            {stables.length === 0 ? (
              <EmptyState
                title="No stables yet"
                body="Create your first stable to manage listings, lessons, and boarding."
                cta={<Link to="/stableSignUp" className="btn-primary">Create stable</Link>}
              />
            ) : (
              <ul className="card-list">
                {stables.map(s => (
                  <li key={s.StableID ?? s.id} className="list-row">
                    <div className="list-body">
                      <div className="list-title">{s.StableName ?? s.name}</div>
                      <div className="list-sub">{formatAddress(s)}</div>
                    </div>
                    <div className="list-actions">
                      <Link to={`/stables/${s.StableID ?? s.id}`} className="btn-ghost">View</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {/* My horses */}
      <section className="card">
        <div className="section-head">
          <h2 className="section-title">My Horses</h2>
          <Link to="/horses/new" className="btn-ghost">+ Add horse</Link>
        </div>

        {horses.length === 0 ? (
          <EmptyState
            title="No horses added"
            body="Add a horse profile to manage care notes, boarding, and lessons."
            cta={<Link to="/horses/new" className="btn-primary">Add horse</Link>}
          />
        ) : (
          <ul className="card-grid">
            {horses.map(h => (
              <li key={h.HorseID ?? h.id} className="horse-card">
                <div className="horse-avatar" aria-hidden>
                  {(h.Name || "?")[0].toUpperCase()}
                </div>
                <div className="horse-body">
                  <div className="horse-title">{h.Name}</div>
                  <div className="horse-sub">
                    {h.Breed ? h.Breed : "—"} {h.DOB ? `• DOB: ${formatDate(h.DOB)}` : ""}
                  </div>
                </div>
                <div className="list-actions">
                  <Link to={`/horses/${h.HorseID ?? h.id}`} className="btn-ghost">Open</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* helpers */
function formatAddress(s) {
  const address = s.Address ?? s.address;
  const city = s.City ?? s.city;
  const state = s.State ?? s.state;
  const zip = s.Zipcode ?? s.zip ?? s.zipcode;
  if (!address && !city) return "—";
  return [address, [city, state].filter(Boolean).join(", "), zip]
    .filter(Boolean)
    .join(" • ");
}
function formatDate(d) {
  try {
    const dt = new Date(d);
    if (isNaN(+dt)) return d;
    return dt.toLocaleDateString();
  } catch { return d; }
}

function EmptyState({ title, body, cta }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden>🐴</div>
      <div>
        <div className="empty-title">{title}</div>
        <div className="empty-body">{body}</div>
      </div>
      <div className="empty-cta">{cta}</div>
    </div>
  );
}
