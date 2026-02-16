import { DollarSign } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/** Loading UI for the finance page. */
export default function FinanceLoading() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="ml-[52px] space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
