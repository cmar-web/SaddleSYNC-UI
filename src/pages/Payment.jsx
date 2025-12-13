import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import bg from "../assets/payment_horse.jpg";

const API_PREFIX = "/api";

export default function Payment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");
  const amount = params.get("amount") || "";
  const service = params.get("service") || "Service";
  const stableId = params.get("stableId");
  const serviceId = params.get("serviceId");

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info"); // info | success | error
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!bookingId || !stableId || !serviceId) {
      setMessageTone("error");
      setMessage("Missing booking details. Please return and start the booking again.");
      return;
    }
    setMessage("");
    setSubmitting(true);
    try {
      console.info("[payment] confirming booking", { bookingId, stableId, serviceId });
      await api(`${API_PREFIX}/stables/${stableId}/services/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          Status: "confirmed",
          PaidAt: new Date().toISOString(),
        }),
      });
      console.info("[payment] booking confirmed");
      setMessageTone("success");
      setMessage("Payment submitted and booking confirmed.");
      const redirect = stableId ? `/stables/${stableId}` : "/profile";
      setTimeout(() => navigate(redirect), 800);
    } catch (err) {
      console.error("Payment confirmation failed", err);
      setMessageTone("error");
      setMessage(err?.message || "Unable to confirm booking.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-4 py-10 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
        aria-hidden="true"
      />
      <div className="relative container mx-auto max-w-md">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-elevated border border-[hsl(var(--border))] p-6 space-y-6">
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">Checkout</p>
            <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">Payment details</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Complete your booking for <span className="font-semibold text-[hsl(var(--rich-brown))]">{service}</span>
              {amount ? ` • $${Number(amount).toFixed(2)}` : ""}{bookingId ? ` • Booking #${bookingId}` : ""}
            </p>
          </div>

          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm border ${
                messageTone === "error"
                  ? "border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)]"
                  : "border-[hsl(var(--accent))] text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)]"
              }`}
            >
              {message}
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-[hsl(var(--muted-foreground))]">Name on card</label>
              <input
                className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[hsl(var(--muted-foreground))]">Card number</label>
              <input
                className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                inputMode="numeric"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-[hsl(var(--muted-foreground))]">Expiry</label>
                <input
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[hsl(var(--muted-foreground))]">CVC</label>
                <input
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  inputMode="numeric"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[hsl(var(--muted-foreground))]">ZIP</label>
                <input
                  className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                  placeholder="ZIP"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 shadow-soft disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Confirming..." : "Submit payment"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
