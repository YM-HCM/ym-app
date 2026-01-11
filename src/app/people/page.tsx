import { AppShell } from '@/components/layout'
import { getPeoplePageData } from './data'
import { PeoplePageClient } from './PeoplePageClient'

export default async function PeoplePage() {
  const { people, filterCategories } = await getPeoplePageData()

  return (
    <AppShell>
      <PeoplePageClient
        initialPeople={people}
        filterCategories={filterCategories}
      />
    </AppShell>
  )
}
