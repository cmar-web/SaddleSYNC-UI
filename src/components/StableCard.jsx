import { Link } from 'react-router-dom'
export default function StableCard({ stable }) {
  return (
    <Link to={`/stables/${stable.id}`} className="block rounded-xl border bg-white p-4 hover:shadow">
      <div className="flex gap-3">
        <img src={stable.cover} alt={stable.name} className="w-24 h-24 object-cover rounded-lg" />
        <div>
          <h3 className="font-semibold">{stable.name}</h3>
          <div className="text-gray-600 text-sm">{stable.city}, {stable.state}</div>
          <div className="text-sm mt-1">{stable.disciplines.join(', ')}</div>
        </div>
      </div>
    </Link>
  )
}
