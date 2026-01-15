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
  minHeight = 4000
}: JotformEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const scriptLoadedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasReceivedResizeRef = useRef(false)

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

    // Listen for resize messages from Jotform
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'string') return

      const args = e.data.split(':')
      if (args[0] === 'setHeight' && iframeRef.current) {
        const height = parseInt(args[1])
        if (!isNaN(height) && height > 0) {
          hasReceivedResizeRef.current = true
          iframeRef.current.style.height = height + 'px'
          // Also update container to match
          if (containerRef.current) {
            containerRef.current.style.height = height + 'px'
          }
        }
      }
    }

    window.addEventListener('message', handleMessage)

    // Fallback: Enable scrolling if auto-resize doesn't work within 3 seconds
    const fallbackTimer = setTimeout(() => {
      if (iframeRef.current && !hasReceivedResizeRef.current) {
        iframeRef.current.removeAttribute('scrolling')
        iframeRef.current.style.overflow = 'auto'
      }
    }, 3000)

    // Cleanup function
    return () => {
      clearTimeout(fallbackTimer)
      window.removeEventListener('message', handleMessage)
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [minHeight])

  return (
    <div ref={containerRef} style={{ minHeight: '500px', position: 'relative' }}>
      <iframe
        ref={iframeRef}
        id={`JotFormIFrame-${formId}`}
        title={title}
        src={`https://form.jotform.com/${formId}`}
        style={{
          width: '100%',
          height: `${minHeight}px`,
          maxWidth: '100%',
          border: 'none',
        }}
        scrolling="no"
        allow="geolocation; microphone; camera; fullscreen"
      />
    </div>
  )
}
