import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const toDataUrl = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });

export default function StableProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = (import.meta.env.VITE_API_URL || "") + "/api";
  const user = useMemo(() => getCurrentUser(), []);
  const userId = user?.UserID;

  const bannerKey   = `stable:${id}:banner`;
  const avatarKey   = `stable:${id}:avatar`;
  const aboutKey    = `stable:${id}:about`;
  const notesKey    = `stable:${id}:notes`;
  const horsesKey   = `stable:${id}:horses`;

  const [loading, setLoading] = useState(true);
  const [stable, setStable] = useState(null);
  const [error, setError] = useState("");

  // form fields 
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity]       = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip]         = useState("");
  const [email, setEmail]     = useState("");

  // local only (until we add endpoints)
  const [banner, setBanner] = useState(localStorage.getItem(bannerKey) || "");
  const [avatar, setAvatar] = useState(localStorage.getItem(avatarKey) || "");
  const [about, setAbout]   = useState(localStorage.getItem(aboutKey) || "");
  const [notes, setNotes]   = useState(localStorage.getItem(notesKey) || "");
  const [horses, setHorses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(horsesKey) || "[]"); }
    catch { return []; }
  });

  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  const isOwner = !!(userId && stable && stable.OwnerID === userId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const r = await fetch(`${API}/stables/${id}`);
        if (!r.ok) throw new Error(await r.text());
        const s = await r.json();
        if (cancelled) return;
        setStable(s);
       
        setName(s.StableName || "");
        setPhone(s.PhoneNumber || "");
        setAddress(s.Address || "");
        setCity(s.City || "");
        setStateVal(s.State || "");
        setZip(s.Zipcode || "");
        setEmail(s.Email || "");
      } catch (e) {
        setError(e.message || "Failed to load stable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [API, id]);

  async function saveCore(e) {
    e?.preventDefault?.();
    if (!isOwner) return;
    setOk(false);
    setSaving(true);
    try {
      // only send changed fields
      const diff = {};
      if (name       !== (stable.StableName   || "")) diff.StableName = name;
      if (phone      !== (stable.PhoneNumber  || "")) diff.PhoneNumber = phone || null;
      if (address    !== (stable.Address      || "")) diff.Address = address;
      if (city       !== (stable.City         || "")) diff.City = city;
      if (stateVal   !== (stable.State        || "")) diff.State = stateVal;
      if (zip        !== (stable.Zipcode      || "")) diff.Zipcode = zip;
      if (email      !== (stable.Email        || "")) diff.Email = email;

      if (Object.keys(diff).length === 0) {
        setOk(true);
        return;
      }

      const r = await fetch(`${API}/stables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": String(userId || "") },
        body: JSON.stringify(diff),
      });
      if (!r.ok) throw new Error(await r.text());
      const updated = await r.json();
      setStable(updated);
      setOk(true);
    } catch (e) {
      setError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function onChooseBanner(file) {
    const data = await toDataUrl(file);
    setBanner(data);
    localStorage.setItem(bannerKey, data);
  }
  async function onChooseAvatar(file) {
    const data = await toDataUrl(file);
    setAvatar(data);
    localStorage.setItem(avatarKey, data);
  }

  function removeBanner() {
    setBanner(""); localStorage.removeItem(bannerKey);
  }
  function removeAvatar() {
    setAvatar(""); localStorage.removeItem(avatarKey);
  }

  function saveLocal() {
    localStorage.setItem(aboutKey, about);
    localStorage.setItem(notesKey, notes);
    localStorage.setItem(horsesKey, JSON.stringify(horses));
    setOk(true);
  }

  function addHorse() {
    setHorses([...horses, { name: "", years: "" }]);
  }
  function updateHorse(i, key, val) {
    const next = horses.slice();
    next[i] = { ...next[i], [key]: val };
    setHorses(next);
  }
  function removeHorse(i) {
    const next = horses.slice(); next.splice(i, 1); setHorses(next);
  }

  if (loading) {
    return (
      <section className="container">
        <div className="skeleton" style={{ height: 220, borderRadius: 12, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 16, width: 180 }} />
      </section>
    );
  }

  if (!stable) {
    return (
      <section className="container">
        <p className="form-error">Stable not found.</p>
        <button className="btn-brown" onClick={() => navigate(-1)}>Go back</button>
      </section>
    );
  }

  return (
    <section className="container stable-profile">
      {/* banner and profilepic */}
      <div className="stable-banner" style={{ background: "var(--bar-sage)" }}>
        {banner ? (
          <img className="stable-banner__img" src={banner} alt="Stable banner" />
        ) : (
          <div className="stable-banner__placeholder">
            <span>Upload banner</span>
          </div>
        )}

        {isOwner && (
          <div className="banner-actions">
            <label className="btn-light" htmlFor="bannerInput">Change banner</label>
            <input id="bannerInput" type="file" accept="image/*" hidden
                   onChange={(e) => e.target.files?.[0] && onChooseBanner(e.target.files[0])} />
            {banner && <button type="button" className="btn-light" onClick={removeBanner}>Remove</button>}
          </div>
        )}

        <div className="stable-avatar">
          {avatar ? (
            <img src={avatar} alt="Stable logo" />
          ) : (
            <div className="stable-avatar__placeholder">Logo</div>
          )}

          {isOwner && (
            <>
              <label className="avatar-edit" htmlFor="avatarInput">Edit</label>
              <input id="avatarInput" type="file" accept="image/*" hidden
                     onChange={(e) => e.target.files?.[0] && onChooseAvatar(e.target.files[0])} />
              {avatar && <button type="button" className="avatar-remove" onClick={removeAvatar}>✕</button>}
            </>
          )}
        </div>
      </div>

      {/* name + address */}
      <div className="stable-title">
        <input
          className="stable-title__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isOwner}
        />
        <div className="stable-sub">
          <input
            className="stable-sub__input"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={!isOwner}
          />
          <div className="stable-sub__row">
            <input
              className="stable-sub__city"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!isOwner}
            />
            <select
              className="stable-sub__state"
              value={stateVal}
              onChange={(e) => setStateVal(e.target.value)}
              disabled={!isOwner}
            >
              <option value="">State</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              className="stable-sub__zip"
              placeholder="Zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              disabled={!isOwner}
            />
          </div>
        </div>
      </div>

      {/* main grid */}
      <div className="stable-grid">
        <div className="col-left">
          <div className="rating-row">
            <div className="star">★</div>
            <div className="rating-text">4.5 (20 reviews)</div>
          </div>

          <div className="grid-buttons">
            <Link className="btn-brown" to="/lessons">Riding Lessons</Link>
            <Link className="btn-brown" to="/boarding">Boarding Services</Link>
          </div>

          <div className="card">
            <h3 className="section-title">Announcements</h3>
            <textarea
              className="input textarea"
              rows={6}
              placeholder="Share news or temporary notices…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!isOwner}
            />
          </div>

          <Link className="cta-nav faq-link" to="/faq">
            <span>Frequently Asked Questions</span><span className="arrow">→</span>
          </Link>
        </div>

        <div className="col-right">
          <div className="card">
            <h3 className="section-title">About us</h3>
            <textarea
              className="input textarea"
              rows={10}
              placeholder="info about stable, trainers, horses etc"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              disabled={!isOwner}
            />
          </div>

          <div className="card">
            <div className="horses-head">
              <h3 className="section-title">Our Horses</h3>
              {isOwner && <button className="btn-light" type="button" onClick={addHorse}>Add horse</button>}
            </div>
            <div className="horses-list">
              {horses.length === 0 && <div className="muted">No horses added yet.</div>}
              {horses.map((h, i) => (
                <div className="horse-pill" key={i}>
                  <input
                    className="pill-name"
                    placeholder="Name"
                    value={h.name}
                    onChange={(e) => updateHorse(i, "name", e.target.value)}
                    disabled={!isOwner}
                  />
                  <input
                    className="pill-years"
                    placeholder="years"
                    value={h.years}
                    onChange={(e) => updateHorse(i, "years", e.target.value)}
                    disabled={!isOwner}
                  />
                  {isOwner && (
                    <button className="pill-remove" type="button" onClick={() => removeHorse(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: ".5rem" }}>
              <Link className="btn-brown" to="/horses">See Full List</Link>
            </div>
          </div>
        </div>
      </div>

      {/* save row */}
      {isOwner ? (
        <div className="save-row">
          <button className="btn-brown" onClick={saveCore} disabled={saving}>
            {saving ? "Saving…" : "Save core details"}
          </button>
          <button className="btn-light" onClick={saveLocal}>Save page content</button>
          {ok && <span className="form-success" style={{ marginLeft: 8 }}>Saved!</span>}
          {error && <span className="form-error" style={{ marginLeft: 8 }}>{error}</span>}
        </div>
      ) : (
        <div className="muted">Viewing as guest (youre not the owner of this stable).</div>
      )}
    </section>
  );
}
