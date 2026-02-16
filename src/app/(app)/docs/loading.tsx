import { FileText } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/** Loading UI for the docs page. */
export default function DocsLoading() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>

        {/* SOPs Section */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
