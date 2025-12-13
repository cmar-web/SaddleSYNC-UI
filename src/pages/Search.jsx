import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SearchSidebar from "../components/SearchSidebar.jsx";
import StableCard from "../components/StableCard.jsx";
import MapEmbed from "../components/MapEmbed.jsx";

const SERVICE_TAGS = [
  { label: "All", value: "Lessons,Boarding" },
  { label: "Lessons", value: "Lessons" },
  { label: "Boarding", value: "Boarding" },
];

const normalizeOffers = (arr) =>
  (arr || [])
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t.toLowerCase());

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
                  .split(",");
                const normalizedOffers = normalizeOffers(parsedOffers);

                return {
                  ...s,
                  id: s.StableID ?? s.id,
                  name: s.StableName ?? s.Name ?? s.name ?? "Stable",
                  city: s.City ?? s.city ?? "",
                  state: s.State ?? s.state ?? "",
                  offers: normalizedOffers,
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
    const selected = normalizeOffers(offers);
    return stables.filter(s => {
      if (Array.isArray(s.offers) && s.offers.length) {
        const normalizedStableOffers = normalizeOffers(s.offers);
        return selected.some(o => normalizedStableOffers.includes(o));
      }
      return true;
    });
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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="container mx-auto px-6 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">
              Browse Stables
            </p>
            <h1 className="text-3xl font-serif text-[hsl(var(--rich-brown))]">Find Your Next Barn</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Search by city or zip, then filter by lessons or boarding.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {SERVICE_TAGS.map(tag => (
              <button
                key={tag.value}
                onClick={() => onSubmitSearch({ near: near || "", offers: tag.value.split(",") })}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  offers.join(",") === tag.value
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 grid lg:grid-cols-[380px,1fr] gap-6">
        <aside className="space-y-4">
          <div className="rounded-3xl overflow-hidden shadow-card border border-[hsl(var(--border))] bg-white">
            <MapEmbed
              stables={filtered}
              fallbackQuery={near || "United States"}
            />
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-white shadow-card p-4">
            <SearchSidebar
              defaultNear={near}
              defaultOffers={offers}
              onSubmit={onSubmitSearch}
            />
          </div>
        </aside>

        <div className="rounded-3xl border border-[hsl(var(--border))] bg-white shadow-elevated p-6 space-y-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Results</p>
              <h2 className="text-2xl font-serif text-[hsl(var(--rich-brown))]">
                {near
                  ? `${resultCount} result${resultCount === 1 ? "" : "s"} near ${near}`
                  : "Enter a location to start"}
              </h2>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-[hsl(var(--muted))] animate-pulse" />
              ))}
            </div>
          )}

          {!loading && near && filtered.length === 0 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--muted-foreground))]">
              No results for current filters. Try broadening offers or changing location.
            </div>
          )}

          {!loading && near && filtered.length > 0 && (
            <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
              {filtered.map(s => {
                const stableId = s.id ?? s.StableID;
                const key = stableId ?? `${s.name}-${s.lat}-${s.lng}`;

                return (
                  <Link
                    key={key}
                    to={`/stables/${stableId}`}
                    className="block rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-card hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="p-4">
                      <StableCard stable={s} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {!near && !loading && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--muted-foreground))]">
              Start by searching for a city or zip code to see nearby stables.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
