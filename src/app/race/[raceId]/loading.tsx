export default function RaceLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="mt-4 text-body text-muted-foreground">경기 정보를 불러오는 중...</p>
      </div>
    </div>
  )
}
