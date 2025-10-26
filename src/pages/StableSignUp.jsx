import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";

const isEmail = (s) => /\S+@\S+\.\S+/.test(s || "");

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

export default function StableSignUp() {
  const API = (import.meta.env.VITE_API_URL || "") + "/api/stables";
  const navigate = useNavigate();

  const user = useMemo(() => getCurrentUser(), []);
  const userId = user?.UserID;

  // if not logged in, show a guard
  if (!userId) {
    return (
      <section className="container auth">
        <h1 className="auth-title">Register your stable</h1>
        <div className="card" style={{ padding: "1rem" }}>
          <p>You need an account to create a stable.</p>
          <p className="form-actions">
            <Link className="btn-brown" to="/userSignUp">Create a rider account</Link>
          </p>
        </div>
      </section>
    );
  }

  // form state
  const [stableName, setStableName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setOk(false);

    if (!stableName.trim()) return setError("Stable name is required.");
    if (!address.trim())    return setError("Address is required.");
    if (!city.trim())       return setError("City is required.");
    if (!stateVal.trim())   return setError("State is required.");
    if (!zip.trim())        return setError("Zipcode is required.");
    if (!isEmail(email))    return setError("A valid email is required.");

    const payload = {
      StableName: stableName.trim(),
      ...(phone.trim() ? { PhoneNumber: phone.trim() } : {}),
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
        headers: {
          "Content-Type": "application/json",
          // dev-auth header  read by backend middleware
          "x-user-id": String(userId),
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error((await r.text()) || "Create failed");

      setOk(true);
      setStableName(""); setPhone(""); setAddress(""); setCity("");
      setStateVal(""); setZip(""); setEmail("");

      // go to profile or somewhere appropriate
      navigate("/stables/stableProfile", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container auth">
      <h1 className="auth-title">Register your stable</h1>
      <p className="auth-subtitle">Logged in as <strong>{user?.Username || `User #${userId}`}</strong></p>

      <form onSubmit={onSubmit} className="card form-card" noValidate>
        <div className="form-grid">
          <div className="form-row">
            <label htmlFor="stableName" className="label">Stable name <span className="req">*</span></label>
            <input id="stableName" className="input" placeholder="Enter the name of your stable..." value={stableName} onChange={(e) => setStableName(e.target.value)} required />
          </div>

          <div className="form-row">
            <label htmlFor="phone" className="label">Phone (optional)</label>
            <input id="phone" className="input" type="tel" placeholder="Enter business phone number..." value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="form-row">
            <label htmlFor="address" className="label">Address <span className="req">*</span></label>
            <input id="address" className="input" placeholder="Enter address..." value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>

          <div className="form-row cols-3">
            <div>
              <label htmlFor="city" className="label">City <span className="req">*</span></label>
              <input id="city" className="input" placeholder="Enter city..." value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="state" className="label">State <span className="req">*</span></label>
              <select id="state" className="input select" value={stateVal} onChange={(e) => setStateVal(e.target.value)} required>
                <option value="">Select state</option>
                {STATES.map((abbrev) => <option key={abbrev} value={abbrev}>{abbrev}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="zip" className="label">Zipcode <span className="req">*</span></label>
              <input id="zip" className="input" placeholder="Enter zipcode..." value={zip} onChange={(e) => setZip(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="email" className="label">Email <span className="req">*</span></label>
            <input id="email" className="input" type="email" placeholder="Enter business email..." value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div className="form-actions">
            <button className="btn-brown" disabled={submitting} type="submit">
              {submitting ? "Creating…" : "Create stable"}
            </button>
            {error && <div className="form-error" role="alert">{error}</div>}
            {ok && <div className="form-success" role="status">Stable created!</div>}
          </div>
        </div>
      </form>
    </section>
  );
}
