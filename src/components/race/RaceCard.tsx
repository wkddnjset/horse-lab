'use client'

import Link from 'next/link'
import { Clock, Users, Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { RaceWithAccess } from '@/types/race'

interface RaceCardProps {
  race: RaceWithAccess
}

export function RaceCard({ race }: RaceCardProps) {
  const time = race.startTime
    ? new Date(race.startTime).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '--:--'

  const isLocked = race.accessStatus === 'locked'
  const href = race.accessStatus === 'none' ? '/login' : `/race/${race.id}`

  return (
    <Link href={href}>
      <Card className={`p-4 transition-colors hover:bg-accent/30 ${isLocked ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-subtitle font-bold text-primary">
              {race.raceNumber}R
            </span>
            <div>
              <div className="flex items-center gap-2 text-caption text-muted-foreground">
                <span>{race.distance}m</span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {time}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {race.entriesCount}두
                </span>
              </div>
            </div>
          </div>

          <div>
            {race.accessStatus === 'free' && (
              <Badge variant="secondary" className="text-caption font-semibold">
                무료
              </Badge>
            )}
            {race.accessStatus === 'locked' && (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
