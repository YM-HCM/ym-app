'use client'

import { Button } from '@/components/ui/button'

interface LoadMoreButtonProps {
  hasMore: boolean
  onLoadMore: () => void
}

export function LoadMoreButton({ hasMore, onLoadMore }: LoadMoreButtonProps) {
  if (!hasMore) return null

  return (
    <div className="flex justify-center pt-6">
      <Button variant="outline" onClick={onLoadMore}>
        Load more
      </Button>
    </div>
  )
}
