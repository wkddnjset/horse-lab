'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function RaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-title font-bold text-foreground">경기 정보를 불러올 수 없습니다</h2>
        <p className="mt-2 text-body text-muted-foreground">
          잠시 후 다시 시도해주세요.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">다시 시도</Button>
          <Link href="/"><Button>홈으로</Button></Link>
        </div>
      </div>
    </div>
  )
}
