import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton for PersonalContextCard
 */
function PersonalContextCardSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="pt-6 flex flex-col items-center">
        {/* Name */}
        <Skeleton className="h-7 w-40 mb-2" />
        {/* Roles */}
        <Skeleton className="h-4 w-48 mb-3" />
        {/* Location */}
        <Skeleton className="h-4 w-36 mb-1" />
        {/* Since year */}
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton for QuickActionCard
 */
function QuickActionCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center">
        {/* Icon circle */}
        <Skeleton className="h-12 w-12 rounded-full mb-3" />
        {/* Title */}
        <Skeleton className="h-5 w-16 mb-1" />
        {/* Description */}
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  )
}

/**
 * Full page skeleton for the home page.
 * Matches the layout of the actual home page content.
 */
export function HomePageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Personal Context Card Skeleton */}
        <PersonalContextCardSkeleton />

        {/* Quick Action Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickActionCardSkeleton />
          <QuickActionCardSkeleton />
          <QuickActionCardSkeleton />
        </div>
      </div>
    </div>
  )
}
