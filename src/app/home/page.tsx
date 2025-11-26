import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignOutButton } from './SignOutButton'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Welcome!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Email:</span> {user.email}
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">User ID:</span> {user.id}
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Created:</span>{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  )
}
