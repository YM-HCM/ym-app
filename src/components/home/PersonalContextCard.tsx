import { Card, CardContent } from '@/components/ui/card'

interface PersonalContextCardProps {
  name: string
  roles: string[]
  neighborNetName: string
  subregionName: string
}

/**
 * Displays the user's identity within YM.
 *
 * Shows name, current roles, NeighborNet, and Subregion.
 * Uses a subtle gradient background for visual distinction.
 */
export function PersonalContextCard({
  name,
  roles,
  neighborNetName,
  subregionName,
}: PersonalContextCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="pt-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {name}
        </h2>

        {roles.length > 0 && (
          <p className="mt-1 text-sm font-medium text-primary">
            {roles.join(' · ')}
          </p>
        )}

        <p className="mt-2 text-sm text-muted-foreground">
          {neighborNetName} · {subregionName}
        </p>
      </CardContent>
    </Card>
  )
}
