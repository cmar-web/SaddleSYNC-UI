// src/pages/StableSignUp.jsx
import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, authHeaders } from "../lib/auth";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
  "ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];
const isEmail = (s) => /\S+@\S+\.\S+/.test(s || "");

export default function StableSignUp() {
  const API = (import.meta.env.VITE_API_URL || "") + "/api/stables";
  const navigate = useNavigate();

  const user = useMemo(() => getCurrentUser(), []);
  const userId = user?.UserID;

  // gate if not logged in
  if (!userId) {
    return (
      <section className="container auth">
        <h1 className="auth-title">Register your stable</h1>
        <div className="card" style={{ padding: "1rem" }}>
          <p>You need to be logged in to create a stable.</p>
          <p className="form-actions">
            <Link className="btn-brown" to="/login">Log in</Link>
            <Link className="btn btn-light" to="/userSignUp">Create an account</Link>
          </p>
        </div>
      </section>
    );
  }

  // form fields
  const [stableName, setStableName] = useState("");
  const [phone, setPhone]           = useState("");
  const [address, setAddress]       = useState("");
  const [city, setCity]             = useState("");
  const [stateVal, setStateVal]     = useState("");
  const [zip, setZip]               = useState("");
  const [email, setEmail]           = useState(user?.Email || "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // matches controller validications
    if (!stableName.trim()) return setError("Stable name is required.");
    if (!address.trim())    return setError("Address is required.");
    if (!city.trim())       return setError("City is required.");
    if (!stateVal.trim())   return setError("State is required.");
    if (!zip.trim())        return setError("Zipcode is required.");
    if (!isEmail(email))    return setError("Valid email is required.");

    // payload
    const payload = {
      StableName: stableName.trim(),
      OwnerID: userId,
      PhoneNumber: phone || null,
      Address: address.trim(),
      City: city.trim(),
      State: stateVal.trim(),
      Zipcode: zip.trim(),
      Email: email.trim(),
    };

    setSubmitting(true);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        let msg = "Create failed";
        try {
          const t = await r.text();
          msg = t || msg;
  
          try { msg = JSON.parse(t).error || msg; } catch {}
        } catch {}
        throw new Error(msg);
      }

      const created = await r.json(); //contains id from output
      navigate(`/stables/${created.StableID}`, { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container auth">
      <h1 className="auth-title">Register your stable</h1>
      <p className="auth-subtitle">Tell riders how to find you</p>

      <form className="card form-card" onSubmit={onSubmit} noValidate>
        <div className="form-grid">

          <div className="form-row">
            <label htmlFor="stableName" className="label">Stable name <span className="req">*</span></label>
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
              <label htmlFor="email" className="label">Email <span className="req">*</span></label>
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
            <label htmlFor="address" className="label">Address <span className="req">*</span></label>
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
              <label htmlFor="city" className="label">City <span className="req">*</span></label>
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
              <label htmlFor="state" className="label">State <span className="req">*</span></label>
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
              <label htmlFor="zip" className="label">Zip <span className="req">*</span></label>
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
            <button className="btn-brown" type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create stable"}
            </button>
            {error && <div className="form-error" role="alert">{error}</div>}
          </div>
        </div>
      </form>

      <p className="form-note">
        Changed your mind? <Link to="/">Go back home</Link>.
      </p>
    </section>
  );
}
