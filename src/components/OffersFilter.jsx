import { useState } from "react";

export default function OffersFilter({ value = [], onChange }) {
  const [open, setOpen] = useState(false);

  const has = (k) => value.includes(k);
  const toggle = (k) => {
    const next = has(k) ? value.filter((v) => v !== k) : [...value, k];
    onChange?.(next);
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn offers-toggle"
        aria-expanded={open}
        aria-controls="offers-panel"
      >
        <span>Offers</span>
        <span>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div id="offers-panel" className="offers-panel">
          <label className="check">
            <input
              type="checkbox"
              checked={has("Lessons")}
              onChange={() => toggle("Lessons")}
            />
            <span>Riding Lessons</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={has("Boarding")}
              onChange={() => toggle("Boarding")}
            />
            <span>Boarding Services</span>
          </label>
        </div>
      )}
    </div>
  );
}
