import { ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { VENUE_LABELS, type Race } from '@/types/race'

interface RaceHeaderProps {
  race: Race
}

export function RaceHeader({ race }: RaceHeaderProps) {
  return (
    <div className="space-y-2">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-body text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5" />
        돌아가기
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-heading font-bold">{race.raceNumber}R</h1>
        <div className="flex items-center gap-2 text-body text-muted-foreground">
          <Badge variant="outline" className="gap-1 text-caption">
            <MapPin className="h-3.5 w-3.5" />
            {VENUE_LABELS[race.venue]}
          </Badge>
          <span>{race.distance}m</span>
          <span className="capitalize">{race.trackType}</span>
        </div>
      </div>
    </div>
  )
}
