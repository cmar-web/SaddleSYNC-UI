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
    <form className="search-form" onSubmit={handleSubmit}>
      <label className="search-label">
        <span className="search-label-text">location</span>
        <input
          className="input"
          type="text"
          placeholder="city or zip code"
          value={near}
          onChange={e => setNear(e.target.value)}
        />
      </label>

      <div className="mt-3">
        <div className="search-label-text">offers</div>
        <div className="offers-row">
          {OFFER_OPTIONS.map(opt => (
            <label key={opt} className="offer-chip">
              <input
                type="checkbox"
                checked={selectedOffers.includes(opt)}
                onChange={() => toggleOffer(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="btn primary mt-4">
        search
      </button>
    </form>
  );
}
