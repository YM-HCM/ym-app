import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout'

export default async function DocsPage() {
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
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Docs</h1>
          <p className="text-muted-foreground max-w-md">
            Halaqa topics and SOPs. Coming soon.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
