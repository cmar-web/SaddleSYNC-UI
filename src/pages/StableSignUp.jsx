import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser } from "../lib/auth";
import { api } from "../lib/api";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
  "ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];
const isEmail = (s) => /\S+@\S+\.\S+/.test(s || "");
const OFFER_OPTIONS = ["Lessons", "Boarding"];

export default function StableSignUp() {
  const API = "/api/stables";
  const navigate = useNavigate();

  const user = useMemo(() => getCurrentUser(), []);
  const userId = user?.UserID;

  if (!userId) {
    return (
      <section className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl shadow-elevated border border-[hsl(var(--border))] p-8 space-y-4 max-w-xl w-full text-center">
          <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">Put your stable on SaddleSync</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Create a stable owner account to list your barn.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link className="px-4 py-2 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--rich-brown))]" to="/userSignUp">Create owner account</Link>
            <Link className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" to="/login">I already have an account</Link>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Just browsing? <Link to="/search" className="text-[hsl(var(--primary))] font-semibold">Explore stables</Link>.</p>
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
  const [warning, setWarning] = useState("");

  const zip5 = zip.trim().slice(0, 5);

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
    setWarning("");

    if (!stableName.trim()) return setError("Stable name is required.");
    if (!address.trim())    return setError("Address is required.");
    if (!city.trim())       return setError("City is required.");
    if (!stateVal.trim())   return setError("State is required.");
    if (!zip.trim())        return setError("Zipcode is required.");
    if (!isEmail(email))    return setError("Valid email is required.");

    setSubmitting(true);

    let std = {
      street1: address.trim(),
      city: city.trim(),
      state: stateVal.trim(),
      zip5: zip.trim(),
    };
    let coords = null;
    let validated = false;

    try {
      setPhase("validating");
      const validateData = await api(`${API}/validate-address`, {
        method: "POST",
        body: JSON.stringify({
          street1: address.trim(),
          city: city.trim(),
          state: stateVal.trim(),
          zip: zip.trim(),
        }),
      });

      if (validateData?.address) {
        std = validateData.address;
        validated = true;
      }
      if (validateData?.coords) {
        coords = validateData.coords;
      }

      setPhase("creating");
      const createPayload = {
        StableName: stableName.trim(),
        PhoneNumber: phone || null,
        Address: `${std.street1}${std.street2 ? " " + std.street2 : ""}`,
        City: std.city,
        State: std.state,
        Zipcode: formatZip(std.zip5 || zip5, std.zip4),
        Email: email.trim(),
        Offers: offers.join(","),
      };

      const created = await api(API, {
        method: "POST",
        body: JSON.stringify(createPayload),
      });

      if (validated || coords) {
        setPhase("saving");
        try {
          await api(`${API}/${created.StableID}/address`, {
            method: "PUT",
            body: JSON.stringify({ address: std, coords }),
          });
        } catch {
          // non-blocking: stable already created
          setWarning("Stable created, but address confirmation could not be saved.");
        }
      }

      navigate(`/stables/${created.StableID}`, { replace: true });

    } catch (err) {
      if (!validated) {
        // If validation fails (e.g., 422), try creating without confirmed address
        try {
          setWarning(err.message || "Address validation failed; using provided address.");
          setPhase("creating");
          const createPayload = {
            StableName: stableName.trim(),
            PhoneNumber: phone || null,
            Address: address.trim(),
            City: city.trim(),
            State: stateVal.trim(),
            Zipcode: zip5,
            Email: email.trim(),
            Offers: offers.join(","),
          };
          const created = await api(API, {
            method: "POST",
            body: JSON.stringify(createPayload),
          });
          navigate(`/stables/${created.StableID}`, { replace: true });
          return;
        } catch (createErr) {
          setError(createErr.message || err.message || "Something went wrong");
        }
      } else {
        setError(err.message || "Something went wrong");
      }
    } finally {
      setPhase("");
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen bg-[hsl(var(--background))] px-4 py-10">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-3xl shadow-elevated border border-[hsl(var(--border))] p-8 md:p-10 space-y-6">
          <header className="space-y-2 text-center">
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Register your stable</p>
            <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">Tell riders how to find you</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Keep your contact details and offerings in one easy-to-update place.</p>
          </header>

          {error && (
            <div className="rounded-xl border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))] px-4 py-3 text-sm" role="alert">
              {error}
            </div>
          )}
          {warning && !error && (
            <div className="rounded-xl border border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--accent))] px-4 py-3 text-sm" role="alert">
              {warning}
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="stableName" className="text-sm text-[hsl(var(--muted-foreground))]">Stable name *</label>
              <input
                id="stableName"
                className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                placeholder="Enter stable name"
                value={stableName}
                onChange={(e) => setStableName(e.target.value)}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm text-[hsl(var(--muted-foreground))]">Phone</label>
                <input
                  id="phone"
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  placeholder="Enter stable phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-[hsl(var(--muted-foreground))]">Email *</label>
                <input
                  id="email"
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  type="email"
                  placeholder="Enter stable email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Offers</span>
              <div className="flex flex-wrap gap-2">
                {OFFER_OPTIONS.map(opt => (
                  <label key={opt} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                    offers.includes(opt)
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]"
                  }`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={offers.includes(opt)}
                      onChange={() => toggleOffer(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm text-[hsl(var(--muted-foreground))]">Address *</label>
              <input
                id="address"
                className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                autoComplete="street-address"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm text-[hsl(var(--muted-foreground))]">City *</label>
                <input
                  id="city"
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  autoComplete="address-level2"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm text-[hsl(var(--muted-foreground))]">State *</label>
                <select
                  id="state"
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  required
                  autoComplete="address-level1"
                >
                  <option value="">Select</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="zip" className="text-sm text-[hsl(var(--muted-foreground))]">Zip *</label>
                <input
                  id="zip"
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  placeholder="Zipcode"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>
            </div>

            <div className="pt-2">
              <button className="w-full rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 shadow-soft" type="submit" disabled={submitting}>
                {phase === "validating" ? "Validating..." :
                 phase === "creating"   ? "Creating..."   :
                 phase === "saving"     ? "Saving address..." :
                 "Create stable"}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Changed your mind? <Link to="/" className="text-[hsl(var(--primary))] font-semibold">Go back home</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
