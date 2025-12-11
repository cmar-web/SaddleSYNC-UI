// src/components/SearchSidebar.jsx
import { useEffect, useState } from "react";

const OFFER_OPTIONS = ["Lessons", "Boarding"];

export default function SearchSidebar({
  defaultNear = "",
  defaultOffers = OFFER_OPTIONS,
  onSubmit,
}) {
  const [near, setNear] = useState(defaultNear);
  const [selectedOffers, setSelectedOffers] = useState(defaultOffers);

  useEffect(() => {
    setNear(defaultNear);
  }, [defaultNear]);

  useEffect(() => {
    setSelectedOffers(defaultOffers);
  }, [defaultOffers]);

  function toggleOffer(value) {
    setSelectedOffers(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cleanedOffers =
      selectedOffers.length > 0 ? selectedOffers : OFFER_OPTIONS;

    onSubmit({
      near: near.trim(),
      offers: cleanedOffers,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
          Location
        </span>
        <input
          className="w-full rounded-xl border border-[hsl(var(--border))] px-3 py-2"
          type="text"
          placeholder="City or zip code"
          value={near}
          onChange={e => setNear(e.target.value)}
        />
      </label>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Offers</div>
        <div className="flex flex-wrap gap-2">
          {OFFER_OPTIONS.map(opt => (
            <label
              key={opt}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium cursor-pointer ${
                selectedOffers.includes(opt)
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]"
                  : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]"
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={selectedOffers.includes(opt)}
                onChange={() => toggleOffer(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 shadow-soft"
      >
        Search
      </button>
    </form>
  );
}
