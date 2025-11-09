export default function Rating({ value }) {
  const num = Number(value);
  const label = Number.isFinite(num) ? num.toFixed(1) : "–";
  return (
    <div className="ss-rating" aria-label={`rating ${label} out of 5`}>
      <svg viewBox="0 0 24 24" className="ss-star" aria-hidden="true">
        <path d="M12 .587l3.668 7.431 8.207 1.193-5.938 5.79 1.401 8.168L12 18.896l-7.338 3.873 1.401-8.168L.125 9.211l8.207-1.193L12 .587z"/>
      </svg>
      <span className="ss-rating-val">{label}</span>
    </div>
  );
}
