// src/pages/StableProfile.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import "../styles/stableProfile.css";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const OFFER_OPTIONS = ["Lessons", "Boarding"];
const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function StableProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useMemo(() => {
    try { return getCurrentUser() || null; } catch { return null; }
  }, []);
  const userId = user?.UserID ?? user?.userId ?? user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [stable, setStable]   = useState(null);
  const [error, setError]     = useState("");

  const [name, setName]     = useState("");
  const [phone, setPhone]   = useState("");
  const [address, setAddr]  = useState("");
  const [city, setCity]     = useState("");
  const [stateVal, setSt]   = useState("");
  const [zip, setZip]       = useState("");
  const [email, setEmail]   = useState("");
  const [offers, setOffers] = useState([]);

  const [about, setAbout] = useState("");
  const [notes, setNotes] = useState("");

  const [bannerBlobID, setBannerBlobID] = useState(null);
  const [avatarBlobID, setAvatarBlobID] = useState(null);
  const [mediaBusy, setMediaBusy] = useState(false);

  const isOwner = !!(userId && stable && stable.OwnerID === userId);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const r = await fetch(`${API}/stables/${id}`);
        if (!r.ok) throw new Error(await r.text());
        const s = await r.json();
        if (cancel) return;

        setStable(s);
        setName(s.StableName || "");
        setPhone(s.PhoneNumber || "");
        setAddr(s.Address || "");
        setCity(s.City || "");
        setSt(s.State || "");
        setZip(s.Zipcode || "");
        setEmail(s.Email || "");
        setAbout(s.About || "");
        setNotes(s.Notes || "");
        setBannerBlobID(s.BannerBlobID || null);
        setAvatarBlobID(s.AvatarBlobID || null);

        const parsedOffers = (s.Offers || "")
          .split(",")
          .map(t => t.trim())
          .filter(Boolean);
        setOffers(parsedOffers);
      } catch (e) {
        setError(e.message || "Failed to load stable");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  function toggleOffer(value) {
    if (!isOwner) return;
    setOffers(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  }

  async function saveCore(e) {
    e?.preventDefault?.();
    if (!isOwner) return;
    setError("");
    try {
      const diff = {};
      if (name     !== (stable?.StableName  || "")) diff.StableName  = name.trim();
      if (phone    !== (stable?.PhoneNumber || "")) diff.PhoneNumber = phone.trim() || null;
      if (address  !== (stable?.Address     || "")) diff.Address     = address.trim();
      if (city     !== (stable?.City        || "")) diff.City        = city.trim();
      if (stateVal !== (stable?.State       || "")) diff.State       = stateVal.trim();
      if (zip      !== (stable?.Zipcode     || "")) diff.Zipcode     = zip.trim();
      if (email    !== (stable?.Email       || "")) diff.Email       = email.trim();

      const stableOffersCsv = (stable?.Offers || "")
        .split(",")
        .map(t => t.trim())
        .filter(Boolean)
        .join(",");
      const newOffersCsv = offers.join(",");
      if (newOffersCsv !== stableOffersCsv) {
        diff.Offers = newOffersCsv;
      }

      if (!Object.keys(diff).length) return;

      const r = await fetch(`${API}/stables/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": String(userId || "")
        },
        body: JSON.stringify(diff),
      });
      if (!r.ok) throw new Error(await r.text());
      const updated = await r.json();
      setStable(updated);

      const updatedOffers = (updated.Offers || "")
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      setOffers(updatedOffers);
    } catch (e) {
      setError(e.message || "Update failed");
    }
  }

  async function savePage(e) {
    e?.preventDefault?.();
    if (!isOwner) return;
    setError("");
    try {
      const r = await fetch(`${API}/stables/${id}/page`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": String(userId || "") },
        body: JSON.stringify({ about, notes }),
      });
      if (!r.ok) throw new Error(await r.text());
    } catch (e) {
      setError(e.message || "Saving page content failed");
    }
  }

  async function upload(kind, file) {
    if (!isOwner || !file) return;
    setMediaBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${API}/stables/${id}/media/${kind}`, {
        method: "PUT",
        headers: { "x-user-id": String(userId || "") },
        body: fd,
      });
      if (!r.ok) throw new Error(await r.text());
      const json = await r.json();
      if (kind === "banner") setBannerBlobID(json.blobId || null);
      else setAvatarBlobID(json.blobId || null);
    } catch (e) {
      setError(e.message || `Uploading ${kind} failed`);
    } finally {
      setMediaBusy(false);
    }
  }

  function remove(kind) {
    if (kind === "banner") setBannerBlobID(null);
    else setAvatarBlobID(null);
  }

  if (loading) {
    return (
      <div className="sp-shell">
        <div className="sp-banner skeleton" />
        <div className="sp-inner">
          <div className="skeleton" style={{ height: 22, width: 220, marginTop: 20 }} />
          <div className="skeleton" style={{ height: 14, width: 320, marginTop: 8 }} />
        </div>
      </div>
    );
  }

  if (!stable) {
    return (
      <div className="sp-shell">
        <div className="sp-inner" style={{ paddingTop: 40 }}>
          <p className="form-error">Stable not found.</p>
          <button className="sp-btn sp-btn-brown" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  const bannerSrc = bannerBlobID ? `${API}/blobs/${bannerBlobID}` : null;
  const avatarSrc = avatarBlobID ? `${API}/blobs/${avatarBlobID}` : null;

  const hasLessons = offers.includes("Lessons");
  const hasBoarding = offers.includes("Boarding");

  return (
    <div className="sp-shell">
      <div className="sp-banner">
        {bannerSrc ? (
          <img className="sp-banner-img" src={bannerSrc} alt="Stable banner" />
        ) : (
          <div className="sp-banner-empty">Upload banner</div>
        )}

        {isOwner && (
          <div className="sp-banner-actions">
            <label className="sp-btn sp-btn-light" htmlFor="bannerInput">
              {mediaBusy ? "Working…" : "Change banner"}
            </label>
            <input
              id="bannerInput"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && upload("banner", e.target.files[0])}
            />
            {bannerBlobID && (
              <button className="sp-btn sp-btn-light" type="button" onClick={() => remove("banner")}>
                Remove
              </button>
            )}
          </div>
        )}

        <div className="sp-avatar">
          {avatarSrc ? <img src={avatarSrc} alt="Stable logo" /> : <div className="sp-avatar-empty">Logo</div>}
          {isOwner && (
            <div className="sp-avatar-actions">
              <label className="sp-avatar-edit" htmlFor="avatarInput">Edit</label>
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && upload("avatar", e.target.files[0])}
              />
              {avatarBlobID && (
                <button className="sp-avatar-remove" type="button" onClick={() => remove("avatar")} aria-label="Remove avatar">
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sp-inner">
        <div className="sp-title-block">
          <input className="sp-title" value={name} onChange={(e) => setName(e.target.value)} disabled={!isOwner} />
          <div className="sp-sub">
            <input className="sp-sub-line" placeholder="Address" value={address} onChange={(e) => setAddr(e.target.value)} disabled={!isOwner} />
            <div className="sp-sub-row">
              <input className="sp-sub-city" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} disabled={!isOwner} />
              <select className="sp-sub-state" value={stateVal} onChange={(e) => setSt(e.target.value)} disabled={!isOwner}>
                <option value="">State</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="sp-sub-zip" placeholder="Zip" value={zip} onChange={(e) => setZip(e.target.value)} disabled={!isOwner} />
            </div>
          </div>
        </div>

        <div className="sp-grid">
          <div className="sp-left">
            <div className="sp-rating">
              <div className="sp-star">★</div>
              <div className="sp-rating-text"></div>
            </div>

            <div className="sp-card">
              <h3 className="sp-section">Services offered</h3>
              <div className="sp-offers-row">
                {OFFER_OPTIONS.map(opt => (
                  <label key={opt} className="sp-offer-pill">
                    <input
                      type="checkbox"
                      checked={offers.includes(opt)}
                      disabled={!isOwner}
                      onChange={() => toggleOffer(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sp-cta-row">
              {hasLessons && (
                <Link className="sp-btn sp-btn-brown sp-btn-big" to="/lessons">
                  Riding Lessons
                </Link>
              )}
              {hasBoarding && (
                <Link className="sp-btn sp-btn-brown sp-btn-big" to="/boardingInfo">
                  Boarding Services
                </Link>
              )}
            </div>

            <div className="sp-card">
              <h3 className="sp-section">Announcements</h3>
              <textarea className="sp-input sp-textarea" rows={6} placeholder="Share news or temporary notices…" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={!isOwner} />
            </div>

            <button className="sp-btn sp-btn-ghost sp-faq">
              Frequently Asked Questions <span className="sp-arrow">→</span>
            </button>

            {isOwner && (
              <div className="sp-save-row">
                <button className="sp-btn sp-btn-brown" onClick={saveCore}>Save core details</button>
                <button className="sp-btn sp-btn-light" onClick={savePage}>Save page content</button>
                {error && <span className="sp-err">{error}</span>}
              </div>
            )}
          </div>

          <div className="sp-right">
            <div className="sp-card">
              <h3 className="sp-section">About us</h3>
              <textarea className="sp-input sp-textarea" rows={10} placeholder="info about stable, trainers, horses etc" value={about} onChange={(e) => setAbout(e.target.value)} disabled={!isOwner} />
            </div>

            <div className="sp-card">
              <div className="sp-horses-head">
                <h3 className="sp-section">Our Horses</h3>
                {isOwner && <Link className="sp-btn sp-btn-light" to={`/stables/${id}/horses/new`}>Add horse</Link>}
              </div>
              <div className="sp-muted">No horses added yet.</div>
              <div className="sp-list-cta">
                <Link className="sp-btn sp-btn-brown sp-btn-wide" to={`/stables/${id}/horses`}>See Full List</Link>
              </div>
            </div>
          </div>
        </div>

        {!isOwner && error && <div className="sp-err" style={{ marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}
