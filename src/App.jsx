import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [status, setStatus] = useState('checking');
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>SADDLE SYNC</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Riding Lessons
        </button>
        
        <button onClick={() => setCount((count) => count + 1)}>
          Boarding Services        
        </button>
        <button onClick={() => setCount((count) => count + 1)}>
          I am a stable owner
        </button>
      </div>
    </>
  )
}

export default App
