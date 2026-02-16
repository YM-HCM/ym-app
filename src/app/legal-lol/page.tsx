'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LegalLolPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    fetch('/api/legal-lol')
      .then(res => res.json())
      .then(data => setImageSrc(data.image))
      .catch(() => setImageSrc('/legal-lol/aqil_peace.jpg'))

    const timer = setTimeout(() => setRevealed(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!revealed || !imageSrc) return

    const audio = new Audio('/legal-lol/rahman.mp3')
    audio.loop = true
    audio.play().catch(() => {})

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [revealed, imageSrc])

  if (!revealed || !imageSrc) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading Legal Documents...</p>
        <p className="text-xs text-muted-foreground/50">Contacting our legal team...</p>
      </div>
    )
  }

  return (
    <>
      <title>LEGALLY BINDING AGREEMENT</title>
      <div className="min-h-screen bg-black">
        <img
          src={imageSrc}
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
