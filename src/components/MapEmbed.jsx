export default function MapEmbed({ stables = [], fallbackQuery = "USA" }) {
  // If we have lat/lngs, center map by average 
  // If none, fall back to a location search string 
  let src;
  if (stables.length > 0) {
    const { lat, lng } = stables.reduce(
      (acc, s) => ({
        lat: acc.lat + (typeof s.lat === "number" ? s.lat : 0),
        lng: acc.lng + (typeof s.lng === "number" ? s.lng : 0),
      }),
      { lat: 0, lng: 0 }
    );
    const centerLat = lat / stables.length;
    const centerLng = lng / stables.length;
    const zoom = stables.length <= 3 ? 11 : 10;
    // move to env l8r
    src = `https://www.google.com/maps/@?api=1&map_action=map&center=${centerLat},${centerLng}&zoom=${zoom}`;
  } else {
    src = `https://www.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&output=embed`;
  }

  return (
    <div className="map-embed">
      <iframe
        title="map"
        className="map-frame"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
      />
    </div>
  );
}
