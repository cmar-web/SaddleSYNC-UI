import { useEffect, useState } from "react";
import OffersFilter from "./OffersFilter.jsx";

export default function SearchSidebar({ defaultNear, defaultOffers, onSubmit }) {
  const [near, setNear] = useState(defaultNear || "");
  const [offers, setOffers] = useState(defaultOffers?.length ? defaultOffers : ["Lessons", "Boarding"]);

  useEffect(() => setNear(defaultNear || ""), [defaultNear]);
  useEffect(() => setOffers(defaultOffers?.length ? defaultOffers : ["Lessons", "Boarding"]), [defaultOffers]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit?.({ near, offers });
  }

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        value={near}
        onChange={e => setNear(e.target.value)}
        placeholder="Search by City or Zipcode"
        className="input"
        aria-label="Search by City or Zipcode"
      />
      <OffersFilter value={offers} onChange={setOffers} />
      <button className="btn primary" type="submit">Search</button>
    </form>
  );
}
