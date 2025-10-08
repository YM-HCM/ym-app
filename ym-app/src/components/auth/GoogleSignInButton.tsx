'use client'

import Script from 'next/script'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

const ALLOWED_DOMAIN = 'youngmuslims.com'

declare global {
  interface Window {
    google: any
    handleSignInWithGoogle: (response: any) => void
  }
}

interface GoogleSignInButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  size?: 'large' | 'medium' | 'small'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function GoogleSignInButton({
  text = 'signin_with',
  size = 'large',
  shape = 'rectangular',
  theme = 'outline',
  onSuccess,
  onError
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const handleSignInWithGoogle = async (response: any) => {
    setIsLoading(true)
    try {
      // Decode the JWT to check the email domain before sending to Supabase
      const payload = JSON.parse(atob(response.credential.split('.')[1]))

      // Verify email domain
      if (!payload.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
        const errorMsg = `Access restricted to @${ALLOWED_DOMAIN} accounts only`
        onError?.(errorMsg)
        setIsLoading(false)
        return
      }

      // Sign in with Supabase using the ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      })

      if (error) throw error

      console.log('Successfully logged in with Google:', data.user?.email)
      onSuccess?.()
    } catch (error: any) {
      console.error('Google sign in error:', error)
      onError?.(error.message || 'Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  const initializeGoogleSignIn = () => {
    if (!window.google || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error('Google client not loaded or Client ID not configured')
      return
    }

    // Make the callback function globally available
    window.handleSignInWithGoogle = handleSignInWithGoogle

    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: window.handleSignInWithGoogle, // Direct function reference
      use_fedcm_for_prompt: true, // Chrome third-party cookie compatibility
      hosted_domain: ALLOWED_DOMAIN, // Hint to Google to show only organization accounts
    })

    // Render the sign-in button
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        type: 'standard',
        text: 'continue_with',
        size: 'large',
        shape: 'rectangular',
        theme: 'outline',
        width: '280',
        logo_alignment: 'left'
      }
    )

    setScriptLoaded(true)
  }

  useEffect(() => {
    if (scriptLoaded) {
      initializeGoogleSignIn()
    }
  }, [scriptLoaded])

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptLoaded(true)}
      />

      <div className="w-full flex justify-center">
        {/* Placeholder while Google button loads */}
        {!scriptLoaded && (
          <div className="w-full py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 font-medium text-center">
            Loading Google Sign In...
          </div>
        )}

        {/* Google Sign-In Button Container */}
        <div
          id="google-signin-button"
          className={`${!scriptLoaded ? 'hidden' : ''} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-sm text-gray-600">
              Signing in...
            </div>
          </div>
        )}
      </div>
    </>
  )
}