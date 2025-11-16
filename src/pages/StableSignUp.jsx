// src/pages/StableSignUp.jsx
import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import "../styles/stableSignUp.css";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
  "ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];
const isEmail = (s) => /\S+@\S+\.\S+/.test(s || "");
const OFFER_OPTIONS = ["Lessons", "Boarding"];

export default function StableSignUp() {
  const API = (import.meta.env.VITE_API_URL || "") + "/api/stables";
  const navigate = useNavigate();

  const user = useMemo(() => getCurrentUser(), []);
  const userId = user?.UserID;

  if (!userId) {
    return (
      <section className="unauth-container">
        <div className="unauth-inner">
          <h1 className="unauth-header">Put your stable on the SaddleSync map</h1>
          <p className="unauth-subtitle">
            Create a free stable profile so riders can discover your lessons and boarding
            options when they move to a new area or look for somewhere new to ride.
          </p>

          <ul className="unauth-list">
            <li>Show up when riders search for lessons or boarding near your city.</li>
            <li>Highlight disciplines, lesson levels, and boarding options you offer.</li>
            <li>Keep your contact details and offerings in one easy-to-update place.</li>
          </ul>

          <div className="unauth-actions">
            <Link className="btn btn-light" to="/userSignUp">
              Create stable owner account
            </Link>
            <Link className="btn btn-light" to="/login">
              I already have an account
            </Link>
          </div>

          <p className="unauth-footnote">
            Just here to browse? <Link to="/search">Explore stables near you</Link>.
          </p>
        </div>
      </section>
    );
  }

  const [stableName, setStableName] = useState("");
  const [phone, setPhone]           = useState("");
  const [address, setAddress]       = useState("");
  const [city, setCity]             = useState("");
  const [stateVal, setStateVal]     = useState("");
  const [zip, setZip]               = useState("");
  const [email, setEmail]           = useState(user?.Email || "");
  const [offers, setOffers]         = useState([]); 

  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState("");

  const formatZip = (zip5, zip4) => zip4 ? `${zip5}-${zip4}` : zip5;

  function toggleOffer(value) {
    setOffers(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!stableName.trim()) return setError("Stable name is required.");
    if (!address.trim())    return setError("Address is required.");
    if (!city.trim())       return setError("City is required.");
    if (!stateVal.trim())   return setError("State is required.");
    if (!zip.trim())        return setError("Zipcode is required.");
    if (!isEmail(email))    return setError("Valid email is required.");

    setSubmitting(true);

    try {
      setPhase("validating");
      const validateRes = await fetch(`${API}/validate-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street1: address.trim(),
          city: city.trim(),
          state: stateVal.trim(),
          zip: zip.trim(),
        }),
      });

      const validateData = await validateRes.json().catch(() => ({}));
      if (!validateRes.ok) {
        if (validateRes.status === 422) {
          throw new Error(validateData.error || "That address is invalid. Please check it.");
        }
        throw new Error(validateData.error || "Address validation failed.");
      }

      const std = validateData.address;
      const coords = validateData.coords;

      setPhase("creating");
      const createPayload = {
        StableName: stableName.trim(),
        OwnerID: userId,
        PhoneNumber: phone || null,
        Address: `${std.street1}${std.street2 ? " " + std.street2 : ""}`,
        City: std.city,
        State: std.state,
        Zipcode: formatZip(std.zip5, std.zip4),
        Email: email.trim(),
        Offers: offers.join(","),
      };

      const r = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user?.Token ? `Bearer ${user.Token}` : undefined,
        },
        body: JSON.stringify(createPayload),
      });

      let created;
      if (!r.ok) {
        let msg = "Create failed";
        try {
          const t = await r.text();
          msg = t || msg;
          try { msg = JSON.parse(t).error || msg; } catch {}
        } catch {}
        throw new Error(msg);
      } else {
        created = await r.json();
      }

      setPhase("saving");
      const saveRes = await fetch(`${API}/${created.StableID}/address`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: user?.Token ? `Bearer ${user.Token}` : undefined,
        },
        body: JSON.stringify({ address: std, coords }),
      });

      if (!saveRes.ok) {
        let msg = "Saving address failed";
        try {
          const t = await saveRes.text();
          msg = (JSON.parse(t).error) || t || msg;
        } catch {}
        throw new Error(msg);
      }

      navigate(`/stables/${created.StableID}`, { replace: true });

    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setPhase("");
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-stable-container">
      <div className="auth-stable-inner">
        <header className="auth-stable-header">
          <h1 className="auth-title">Register your stable</h1>
          <p className="auth-subtitle">Tell riders how to find you</p>
        </header>

        <form className="card form-card" onSubmit={onSubmit} noValidate>
          <div className="form-grid">

            <div className="form-row">
              <label htmlFor="stableName" className="label">
                Stable name <span className="req">*</span>
              </label>
              <input
                id="stableName"
                className="input"
                placeholder="Enter stable name..."
                value={stableName}
                onChange={(e) => setStableName(e.target.value)}
                required
              />
            </div>

            <div className="form-row cols-2">
              <div>
                <label htmlFor="phone" className="label">Phone</label>
                <input
                  id="phone"
                  className="input"
                  placeholder="Enter stable phone number..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                />
              </div>
              <div>
                <label htmlFor="email" className="label">
                  Email <span className="req">*</span>
                </label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  placeholder="Enter stable email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-row">
              <span className="label">Offers</span>
              <div className="offers-row">
                {OFFER_OPTIONS.map(opt => (
                  <label key={opt} className="offers-pill">
                    <input
                      type="checkbox"
                      checked={offers.includes(opt)}
                      onChange={() => toggleOffer(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="address" className="label">
                Address <span className="req">*</span>
              </label>
              <input
                id="address"
                className="input"
                placeholder="Enter address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                autoComplete="street-address"
              />
            </div>

            <div className="form-row cols-3">
              <div>
                <label htmlFor="city" className="label">
                  City <span className="req">*</span>
                </label>
                <input
                  id="city"
                  className="input"
                  placeholder="Enter city..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <label htmlFor="state" className="label">
                  State <span className="req">*</span>
                </label>
                <select
                  id="state"
                  className="input select"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  required
                  autoComplete="address-level1"
                >
                  <option value="">Select</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="zip" className="label">
                  Zip <span className="req">*</span>
                </label>
                <input
                  id="zip"
                  className="input"
                  placeholder="Enter zipcode..."
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-light" type="submit" disabled={submitting}>
                {phase === "validating" ? "Validating…" :
                 phase === "creating"   ? "Creating…"   :
                 phase === "saving"     ? "Saving address…" :
                 "Create stable"}
              </button>
              {error && <div className="form-error" role="alert">{error}</div>}
            </div>
          </div>
        </form>

        <p className="form-note">
          Changed your mind? <Link to="/">Go back home</Link>.
        </p>
      </div>
    </section>
  );
}
