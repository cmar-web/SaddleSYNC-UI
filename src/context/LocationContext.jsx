import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)
export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(null)
  const askForLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => console.warn('oops geo error', err),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }
  return <Ctx.Provider value={{ coords, askForLocation }}>{children}</Ctx.Provider>
}
export const useLocationContext = () => useContext(Ctx)
