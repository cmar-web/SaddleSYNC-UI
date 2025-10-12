// stableprofile.jsx
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function StableProfile() {
  const { id } = useParams()
  const [stable, setStable] = useState(null)

  useEffect(() => { getStableById(id).then(setStable) }, [id])

  if (!stable) return <div>Loading…</div>

  return (
    <article className="space-y-4">
      <h1 className="text-3xl font-black">{stable.name}</h1>
      <div className="text-gray-600">{stable.city} • {stable.state}</div>
      <p>{stable.description}</p>
      <div className="grid md:grid-cols-3 gap-3">
        {stable.photos?.map((src, i) => (
          <img key={i} src={src} alt={`${stable.name} ${i+1}`} className="rounded-xl w-full h-48 object-cover" />
        ))}
      </div>
      <section>
        <h3 className="font-semibold">Amenities</h3>
        <ul className="list-disc ml-6">{stable.amenities.map(a => <li key={a}>{a}</li>)}</ul>
      </section>
    </article>
  )
}
