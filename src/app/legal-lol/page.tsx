'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LegalLolPage() {
  const [imageReady, setImageReady] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [entered, setEntered] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch and preload image
  useEffect(() => {
    fetch('/api/legal-lol')
      .then(res => res.json())
      .then(data => setImageSrc(data.image))
      .catch(() => setImageSrc('/legal-lol/aqil_peace.jpg'))
  }, [])

  useEffect(() => {
    if (!imageSrc) return

    const img = new Image()
    img.onload = () => setImageReady(true)
    img.onerror = () => setImageReady(true)
    img.src = imageSrc
  }, [imageSrc])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  function handleEnter() {
    const audio = new Audio('/legal-lol/rahman.mp3')
    audio.loop = true
    audioRef.current = audio
    audio.play().catch(() => {})
    setEntered(true)
  }

  // Loading state — fetching and preloading image
  if (!imageReady) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading Legal Documents...</p>
        <p className="text-xs text-muted-foreground/50">Contacting our legal team...</p>
      </div>
    )
  }

  // Ready state — image preloaded, waiting for user tap
  if (!entered) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6">
        <p className="text-sm text-muted-foreground">Your legal documents are ready.</p>
        <button
          onClick={handleEnter}
          className="text-sm text-primary animate-pulse cursor-pointer"
        >
          Tap to accept terms &amp; conditions
        </button>
      </div>
    )
  }

  // Revealed state — full-screen image + audio playing
  return (
    <>
      <title>LEGALLY BINDING AGREEMENT</title>
      <div className="min-h-screen bg-black">
        <img
          src={imageSrc!}
          alt="Legal Documentation"
          className="w-full"
        />
        <Link
          href="/login"
          className="fixed bottom-4 right-4 text-white/20 text-[10px] hover:text-white/60 transition-colors duration-200 z-10"
        >
          back to safety
        </Link>
      </div>
    </>
  )
}
