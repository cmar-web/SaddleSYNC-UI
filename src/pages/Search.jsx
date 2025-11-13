import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "../styles/Search.css";
import SearchSidebar from "../components/SearchSidebar.jsx";
import StableCard from "../components/StableCard.jsx";
import MapEmbed from "../components/MapEmbed.jsx";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [stables, setStables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(null);

  const near = params.get("near") || "";
  const offers = (params.get("offers") || "Lessons,Boarding")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  useEffect(() => {

    if (!near) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          near,
          offers: offers.join(","),
          page: params.get("page") || "1",
          pageSize: params.get("pageSize") || "25",
        }).toString();

        const res = await fetch(`/api/stables?${qs}`);
        if (!res.ok) throw new Error(`Bad status: ${res.status}`);
        const json = await res.json();

        if (!cancelled) {
          const data = Array.isArray(json?.data)
            ? json.data.map(s => ({
                ...s,
                offers: (s.Offers || "")
                  .split(",")
                  .map(t => t.trim())
                  .filter(Boolean),
              }))
            : [];
          setStables(data);
          setTotal(Number.isFinite(json?.total) ? json.total : null);
        }
      } catch {
        if (!cancelled) {
          setStables([]);
          setTotal(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [near, offers.join(","), params.get("page"), params.get("pageSize")]);

  const filtered = useMemo(() => {
    return stables.filter(s =>
      (offers.includes("Lessons") ? s?.offers?.includes("Lessons") : true) &&
      (offers.includes("Boarding") ? s?.offers?.includes("Boarding") : true)
    );
  }, [stables, offers]);

  function onSubmitSearch({ near: newNear, offers: nextOffers }) {
    const next = new URLSearchParams(params);
    next.set("near", newNear);
    next.set("offers", nextOffers.join(","));
    next.set("page", "1");
    setParams(next, { replace: false });
  }

  const resultCount = total ?? filtered.length;

  return (
    <section className="search-layout">
      <div className="search-grid container">
        <aside>
          <div className="ss-map-card">
            <MapEmbed stables={filtered} fallbackQuery={near || "United States"} />
            <SearchSidebar
              defaultNear={near}
              defaultOffers={offers}
              onSubmit={onSubmitSearch}
            />
          </div>
        </aside>

        <div className="results">
          <div className="results-head">
            <div>
              <h2 className="results-title">Results</h2>
              <p className="results-sub">
                {near
                  ? `${resultCount} results found near ${near}`
                  : "Enter a location to see nearby stables"}
              </p>
            </div>
            <button type="button" className="ss-btn ss-btn-brown">Filter</button>
          </div>

          <div className="ss-results-box">
            {loading && <div className="muted">Loading…</div>}
            {!loading && near && filtered.length === 0 && (
              <div className="muted">No results for current filters.</div>
            )}
            {!loading && filtered.map(s => (
              <div key={s.id ?? `${s.name}-${s.lat}-${s.lng}`} className="ss-result-pill">
                <Link to={`/stables/${s.id}`} className="ss-result-link">
                  <StableCard stable={s} />
                </Link>
              </div>
            ))}
            {!near && !loading && (
              <div className="muted">Start by searching for a city or zip code.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
