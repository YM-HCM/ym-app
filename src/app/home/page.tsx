import { redirect } from 'next/navigation'
import { Users, DollarSign, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout'
import { PersonalContextCard, QuickActionCard } from '@/components/home'

// Mock data - will be replaced with real data from DB
const MOCK_USER_CONTEXT = {
  name: 'Ahmad Khan',
  roles: ['NNC', 'Katy NN'],
  neighborNetName: 'Katy NN',
  subregionName: 'Houston Subregion',
  yearJoined: 2021,
}

const QUICK_ACTIONS = [
  {
    href: '/people',
    icon: Users,
    title: 'People',
    description: 'Browse YM members',
  },
  {
    href: '/finance',
    icon: DollarSign,
    title: 'Finance',
    description: 'Reimbursements',
  },
  {
    href: '/docs',
    icon: FileText,
    title: 'Docs',
    description: 'Halaqa & SOPs',
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Personal Context Card */}
          <div
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '0ms' }}
          >
            <PersonalContextCard
              name={MOCK_USER_CONTEXT.name}
              roles={MOCK_USER_CONTEXT.roles}
              neighborNetName={MOCK_USER_CONTEXT.neighborNetName}
              subregionName={MOCK_USER_CONTEXT.subregionName}
              yearJoined={MOCK_USER_CONTEXT.yearJoined}
            />
          </div>

          {/* Quick Action Cards */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '150ms' }}
          >
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard
                key={action.href}
                href={action.href}
                icon={action.icon}
                title={action.title}
                description={action.description}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
