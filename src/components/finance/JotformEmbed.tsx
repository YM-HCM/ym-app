'use client'

import { useEffect, useRef } from 'react'

interface JotformEmbedProps {
  formId: string
  title?: string
  minHeight?: number
}

export function JotformEmbed({
  formId,
  title = 'Jotform',
  minHeight = 2000
}: JotformEmbedProps) {
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    // Only load the script once
    if (scriptLoadedRef.current) return

    // Check if script is already loaded
    const existingScript = document.querySelector(
      'script[src*="for-form-embed-handler"]'
    )

    if (existingScript) {
      scriptLoadedRef.current = true
      return
    }

    // Create and load the Jotform embed handler script
    const script = document.createElement('script')
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js'
    script.async = true
    script.onload = () => {
      scriptLoadedRef.current = true
    }

    document.body.appendChild(script)

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <iframe
      id={`JotFormIFrame-${formId}`}
      title={title}
      src={`https://form.jotform.com/${formId}`}
      style={{
        width: '100%',
        minHeight: `${minHeight}px`,
        maxWidth: '100%',
        border: 'none',
      }}
      allow="geolocation; microphone; camera; fullscreen"
    />
  )
}
