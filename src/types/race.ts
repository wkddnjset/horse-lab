export type Venue = 'seoul' | 'busan' | 'jeju'

export const VENUE_LABELS: Record<Venue, string> = {
  seoul: '서울',
  busan: '부산',
  jeju: '제주',
}

export interface Race {
  id: string
  raceDate: string
  raceNumber: number
  venue: Venue
  distance: number
  trackCondition: string
  trackType: string
  startTime: string
  entriesCount: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export type RaceAccessStatus = 'free' | 'locked' | 'premium' | 'none'

export interface RaceWithAccess extends Race {
  accessStatus: RaceAccessStatus
}

export interface RaceEntry {
  id: string
  horseId: string
  horseName: string
  jockeyId: string
  jockeyName: string
  gateNumber: number
  horseWeight: number | null
  odds: number | null
}

export interface RaceDetail extends Race {
  entries: RaceEntry[]
}
