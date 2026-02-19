import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AppShell } from '@/components/layout'
import { getPeoplePageData } from './data'
import { PeoplePageClient } from './PeoplePageClient'

export const metadata: Metadata = {
  title: 'People | Young Muslims App',
  description: 'Browse and search the Young Muslims directory',
}

export default async function PeoplePage() {
  const { people, filterCategories } = await getPeoplePageData()

  return (
    <AppShell>
      <Suspense>
        <PeoplePageClient
          initialPeople={people}
          filterCategories={filterCategories}
        />
      </Suspense>
    </AppShell>
  )
}
