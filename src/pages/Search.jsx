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
        if (!res.ok) throw new Error(`bad status: ${res.status}`);
        const json = await res.json();

        if (!cancelled) {
          const data = Array.isArray(json?.data)
            ? json.data.map(s => {
                const parsedOffers = (s.Offers || s.offers || "")
                  .toString()
                  .split(",")
                  .map(t => t.trim())
                  .filter(Boolean);

                return {
                  ...s,
                  id: s.StableID ?? s.id,
                  name: s.StableName ?? s.Name ?? s.name ?? "Stable",
                  city: s.City ?? s.city ?? "",
                  state: s.State ?? s.state ?? "",
                  offers: parsedOffers,
                  lat:
                    typeof s.lat === "number"
                      ? s.lat
                      : typeof s.Latitude === "number"
                      ? s.Latitude
                      : typeof s.Lat === "number"
                      ? s.Lat
                      : undefined,
                  lng:
                    typeof s.lng === "number"
                      ? s.lng
                      : typeof s.Longitude === "number"
                      ? s.Longitude
                      : typeof s.Lng === "number"
                      ? s.Lng
                      : undefined,
                  rating:
                    typeof s.rating === "number"
                      ? s.rating
                      : typeof s.Rating === "number"
                      ? s.Rating
                      : undefined,
                };
              })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, offers.join(","), params.get("page"), params.get("pageSize")]);

  const filtered = useMemo(() => {
    if (!offers.length) return stables;
    return stables.filter(s =>
      Array.isArray(s.offers) && s.offers.length
        ? offers.some(o => s.offers.includes(o))
        : true
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
            <MapEmbed
              stables={filtered}
              fallbackQuery={near || "United States"}
            />
            <SearchSidebar
              defaultNear={near}
              defaultOffers={offers}
              onSubmit={onSubmitSearch}
            />
          </div>
        </aside>

        <div className="results">
          <div className="results-card">
            <div className="results-head">
              <div>
                <h2 className="results-title">results</h2>
                <p className="results-sub">
                  {near
                    ? `${resultCount} result${resultCount === 1 ? "" : "s"} found near ${near}`
                    : "enter a location to see nearby stables"}
                </p>
              </div>
              <button type="button" className="ss-btn ss-btn-brown">
                filter
              </button>
            </div>

            <div className="ss-results-box">
              {loading && <div className="muted">loading…</div>}

              {!loading && near && filtered.length === 0 && (
                <div className="muted">no results for current filters.</div>
              )}

              {!loading && near && filtered.length > 0 && (
                <>
                  {filtered.map(s => {
                    const stableId = s.id ?? s.StableID;
                    const key = stableId ?? `${s.name}-${s.lat}-${s.lng}`;

                    return (
                      <div key={key} className="ss-result-pill">
                        <Link
                          to={`/stables/${stableId}`}
                          className="ss-result-link"
                        >
                          <StableCard stable={s} />
                        </Link>
                      </div>
                    );
                  })}
                </>
              )}

              {!near && !loading && (
                <div className="muted">
                  start by searching for a city or zip code.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
