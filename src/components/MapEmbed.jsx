// src/components/MapEmbed.jsx
export default function MapEmbed({ stables = [], fallbackQuery = "United States" }) {
  const firstWithCoords = Array.isArray(stables)
    ? stables.find(
        s => typeof s.lat === "number" && typeof s.lng === "number"
      )
    : null;

  let src;
  if (firstWithCoords) {
    src = `https://www.google.com/maps?q=${firstWithCoords.lat},${firstWithCoords.lng}&z=10&output=embed`;
  } else {
    const q = encodeURIComponent(fallbackQuery || "United States");
    src = `https://www.google.com/maps?q=${q}&z=4&output=embed`;
  }

  return (
    <div className="map-embed">
      <iframe
        className="map-frame"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="stable map"
      />
    </div>
  );
}
