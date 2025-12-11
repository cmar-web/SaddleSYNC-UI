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
          {directionsHref && (
            <div className="ss-directions">
              <a
                className="ss-btn ss-btn-ghost"
                href={directionsHref}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                title="open directions in google maps"
              >
                Directions
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
