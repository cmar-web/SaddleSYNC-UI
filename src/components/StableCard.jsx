import TagPill from "./TagPill.jsx";
import Rating from "./Rating.jsx";

function StableAvatar() {
  return (
    <div className="ss-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="ss-avatar-ico">
        <path d="M16.4 3.2c-2.7-.8-5.6.7-6.9 3.2-.9 1.8-.9 3.9-.2 5.7-1.3.7-2.3 1.9-2.7 3.3-.1.3.1.6.4.6h1.5c.2 0 .4-.1.5-.3.6-1.7 2.2-2.9 4.1-2.9h.7c.3 0 .6-.3.5-.6-.3-1.1-.3-2.3.2-3.3.8-1.7 2.7-2.6 4.5-2.1.3.1.6-.2.6-.5-.2-1.3-1.2-2.5-2.7-3.1z" />
      </svg>
    </div>
  );
}

export default function StableCard({ stable }) {
  const name =
    stable?.name ??
    stable?.StableName ??
    "Stable";

  const city = stable?.city ?? stable?.City ?? "";
  const state = stable?.state ?? stable?.State ?? "";
  const locationLine =
    city && state ? `${city}, ${state}` : city || state || "";

  const offers = Array.isArray(stable?.offers)
    ? stable.offers
    : (stable?.Offers || "")
        .toString()
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

  const hasLatLng =
    typeof stable?.lat === "number" && typeof stable?.lng === "number";

  const directionsHref = hasLatLng
    ? `https://www.google.com/maps?q=${stable.lat},${stable.lng}`
    : undefined;

  return (
    <div className="ss-stable-row">
      <div className="ss-stable-left">
        <StableAvatar />
        <div className="ss-stable-meta">
          <div className="ss-stable-name">{name}</div>
          {locationLine && (
            <div className="ss-stable-location">{locationLine}</div>
          )}
          <div className="ss-stable-tags">
            {offers.includes("Lessons") && <TagPill>Lessons</TagPill>}
            {offers.includes("Boarding") && <TagPill>Boarding</TagPill>}
          </div>
        </div>
      </div>

      <div className="ss-stable-right">
        <Rating value={stable?.rating} />
        {directionsHref && (
          <a
            className="ss-btn ss-btn-ghost"
            href={directionsHref}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            title="open directions in google maps"
          >
            directions
          </a>
        )}
      </div>
    </div>
  );
}
