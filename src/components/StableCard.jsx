import TagPill from "./TagPill.jsx";

export default function StableCard({ stable }) {
  const name =
    stable?.name ??
    stable?.StableName ??
    "Stable";

  const city = stable?.city ?? stable?.City ?? "";
  const state = stable?.state ?? stable?.State ?? "";
  const locationLine =
    city && state ? `${city}, ${state}` : city || state || "";

  const normalizeOffers = (arr) =>
    (arr || [])
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => t.toLowerCase());

  const offersRaw = Array.isArray(stable?.offers)
    ? stable.offers
    : (stable?.Offers || "").toString().split(",");
  const offers = normalizeOffers(offersRaw);

  const offerLabels = offers
    .map(o => o.charAt(0).toUpperCase() + o.slice(1))
    .filter(Boolean);

  const hasLatLng =
    typeof stable?.lat === "number" && typeof stable?.lng === "number";

  const directionsHref = hasLatLng
    ? `https://www.google.com/maps?q=${stable.lat},${stable.lng}`
    : undefined;

  return (
    <div className="ss-stable-row">
      <div className="ss-stable-left">
        <div className="ss-stable-meta">
          <div className="ss-stable-name">{name}</div>
          {locationLine && (
            <div className="ss-stable-location">{locationLine}</div>
          )}
          <div className="ss-stable-tags">
            {offers.includes("lessons") && <TagPill>Lessons</TagPill>}
            {offers.includes("boarding") && <TagPill>Boarding</TagPill>}
          </div>
          {offerLabels.length > 0 && (
            <div className="ss-stable-services text-sm text-[hsl(var(--muted-foreground))] mt-1">
              Offers: {offerLabels.join(" • ")}
            </div>
          )}
          {directionsHref && (
            <div className="ss-directions">
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(directionsHref, "_blank", "noopener");
                }}
                title="Open directions in Google Maps"
              >
                Directions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
