import { useEffect, useState } from 'react'
import { Dumbbell } from 'lucide-react'

export default function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1600)
    const doneTimer = setTimeout(() => onDone(), 2100)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-teal-600 transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated logo ring */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-24 h-24 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '1.5s' }} />
        <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-2xl">
          <Dumbbell className="w-10 h-10 text-teal-600" strokeWidth={2.5} />
        </div>
      </div>

      {/* Brand name */}
      <h1 className="text-3xl font-bold text-white tracking-tight">Fit Check</h1>
      <p className="text-teal-200 text-sm font-medium mt-1 tracking-widest uppercase">by Anmol</p>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-10">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-white/60"
            style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
