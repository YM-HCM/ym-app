import { redirect } from 'next/navigation'
import { DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout'
import { JotformEmbed } from '@/components/finance/JotformEmbed'

export default async function FinancePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Page Header */}
          <div
            className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '0ms' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  YM Finance Requests Form
                </h1>
                <p className="text-sm text-muted-foreground">
                  Submit your reimbursement request
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Form */}
          <div
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '100ms' }}
          >
            <JotformEmbed
              formId="233184710128148"
              title="YM Reimbursement Form"
            />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
