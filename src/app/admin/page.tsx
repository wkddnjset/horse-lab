import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, BarChart3, Users, CreditCard } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  // 최근 데이터 수집 로그
  const { data: syncLogs } = await supabase
    .from('data_sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // 오늘 예측 생성 현황
  const today = new Date().toISOString().split('T')[0]
  const { data: predLogs } = await supabase
    .from('prediction_logs')
    .select('*')
    .gte('created_at', today)

  // 활성 구독자 수
  const { count: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // 전체 사용자 수
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <>
      <Header user={{ nickname: '관리자', avatarUrl: null }} />
      <PageContainer>
        <h1 className="text-xl font-bold">관리자 대시보드</h1>

        {/* 통계 카드 */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              전체 사용자
            </div>
            <p className="mt-1 text-2xl font-bold">{totalUsers ?? 0}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CreditCard className="h-4 w-4" />
              활성 구독
            </div>
            <p className="mt-1 text-2xl font-bold">{activeSubscribers ?? 0}</p>
          </Card>
        </div>

        {/* 데이터 수집 상태 */}
        <h2 className="mt-8 flex items-center gap-2 font-semibold">
          <Database className="h-4 w-4" />
          데이터 수집 로그
        </h2>
        <div className="mt-3 space-y-2">
          {(!syncLogs || syncLogs.length === 0) ? (
            <p className="text-sm text-gray-400">수집 로그 없음</p>
          ) : (
            syncLogs.map((log: any) => (
              <Card key={log.id} className="flex items-center justify-between p-3">
                <div>
                  <span className="text-sm font-medium">{log.sync_type}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                  {log.status}
                </Badge>
              </Card>
            ))
          )}
        </div>

        {/* 예측 생성 상태 */}
        <h2 className="mt-8 flex items-center gap-2 font-semibold">
          <BarChart3 className="h-4 w-4" />
          오늘 전략 생성
        </h2>
        <div className="mt-3">
          {(!predLogs || predLogs.length === 0) ? (
            <p className="text-sm text-gray-400">오늘 생성된 예측 없음</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {['stats', 'record', 'chemistry', 'health'].map((st) => {
                const logs = predLogs.filter((l: any) => l.strategy_type === st)
                const success = logs.filter((l: any) => l.status === 'success').length
                const failed = logs.filter((l: any) => l.status === 'failed').length
                return (
                  <Card key={st} className="p-3 text-center">
                    <p className="text-xs text-gray-500">{st}</p>
                    <p className="text-lg font-bold">{success}</p>
                    {failed > 0 && (
                      <p className="text-xs text-red-500">{failed} failed</p>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </PageContainer>
    </>
  )
}
