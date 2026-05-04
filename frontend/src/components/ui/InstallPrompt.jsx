import { useState, useEffect } from 'react'
import { Download, X, Dumbbell, Share, MoreHorizontal } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true

  useEffect(() => {
    if (isInStandaloneMode || dismissed) return

    // For Android/Chrome — capture install prompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // For iOS — show guide after 3 seconds on first visit
    if (isIOS && !localStorage.getItem('fitdeck_ios_prompt_seen')) {
      setTimeout(() => setShowIOSGuide(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed, isInStandaloneMode])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowPrompt(false)
    setDismissed(true)
  }

  const dismiss = () => {
    setShowPrompt(false)
    setShowIOSGuide(false)
    setDismissed(true)
    if (isIOS) localStorage.setItem('fitdeck_ios_prompt_seen', '1')
  }

  // iOS guide
  if (showIOSGuide && !isInStandaloneMode) {
    return (
      <div className="fixed bottom-20 left-3 right-3 z-50 lg:hidden">
        <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-bold">Add Fit Check to Home Screen</p>
            </div>
            <button onClick={dismiss} className="text-gray-400 active:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white shrink-0">1</div>
              <p>Tap <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-700 rounded text-white text-xs"><Share className="w-3 h-3" /> Share</span> in Safari</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white shrink-0">2</div>
              <p>Scroll and tap <strong className="text-white">"Add to Home Screen"</strong></p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white shrink-0">3</div>
              <p>Tap <strong className="text-white">Add</strong> — Fit Check opens like a native app</p>
            </div>
          </div>
          {/* iOS arrow pointing at Safari share button */}
          <div className="mt-3 text-center">
            <div className="w-3 h-3 bg-gray-900 rotate-45 mx-auto translate-y-1.5" />
          </div>
        </div>
      </div>
    )
  }

  // Android/Chrome install banner
  if (showPrompt && !isInStandaloneMode) {
    return (
      <div className="fixed bottom-20 left-3 right-3 z-50 lg:hidden">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Install Fit Check</p>
            <p className="text-xs text-gray-500">Add to home screen for quick access</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={dismiss} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 active:text-gray-600">
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
