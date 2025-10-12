// search.jsx
import { useEffect, useState } from 'react'
import { useLocationContext } from '../context/LocationContext.jsx'
import SearchBar from '../components/SearchBar.jsx'
import StableCard from '../components/StableCard.jsx'
import { searchStables } from '../lib/api.js'

export default function Search() {
  const { coords, askForLocation } = useLocationContext()
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (!coords) askForLocation() }, [])

  async function handleSearch(q) {
    setLoading(true)
    const data = await searchStables({ q, coords })
    setResults(data)
    setLoading(false)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Nearby Stables</h2>
      <SearchBar value={term} onChange={setTerm} onSubmit={() => handleSearch(term)} />
      {loading && <div>Loading</div>}
      {!loading && results.length === 0 && <div className="text-gray-500">No results.</div>}
      <div className="grid md:grid-cols-2 gap-4">
        {results.map(s => <StableCard key={s.id} stable={s} />)}
      </div>
    </section>
  )
}
