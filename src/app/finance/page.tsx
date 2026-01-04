import { redirect } from 'next/navigation'
import { DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout'

export default async function FinancePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
          <p className="text-muted-foreground max-w-md">
            Reimbursements and financial tools. Coming soon.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
