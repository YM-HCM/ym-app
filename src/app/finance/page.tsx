import { redirect } from 'next/navigation'
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
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Reimbursement Form</h1>
          <p className="text-muted-foreground mt-2">
            Submit your reimbursement request below
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <JotformEmbed
            formId="233184710128148"
            title="YM Reimbursement Form"
          />
        </div>
      </div>
    </AppShell>
  )
}
