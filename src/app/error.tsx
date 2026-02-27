'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
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
        <h2 className="mt-4 text-title font-bold text-foreground">오류가 발생했습니다</h2>
        <p className="mt-2 text-body text-muted-foreground">
          잠시 후 다시 시도해주세요.
        </p>
        <Button onClick={reset} className="mt-6">
          다시 시도
        </Button>
      </div>
    </div>
  )
}
