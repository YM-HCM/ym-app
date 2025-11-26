'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="destructive"
      className="w-full"
    >
      Sign Out
    </Button>
  )
}
