export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by name, city, discipline…"
        className="flex-1 px-3 py-2 rounded-xl border"
      />
      <button onClick={onSubmit} className="px-4 py-2 rounded-xl bg-black text-white">Search</button>
    </div>
  )
}
