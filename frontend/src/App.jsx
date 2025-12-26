import { useState } from 'react'
import HeroSection from './components/HeroSection/HeroSection'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-container">
      <HeroSection />
    </div>
  )
}

export default App
