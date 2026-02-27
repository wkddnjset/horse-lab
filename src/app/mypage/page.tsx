'use client'

import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Crown, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function MyPage() {
  const { profile, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <>
        <Header user={null} />
        <PageContainer>
          <div className="py-16 text-center text-muted-foreground">로딩 중...</div>
        </PageContainer>
        <MobileNav />
      </>
    )
  }

  return (
    <>
      <Header user={profile ? { nickname: profile.nickname, avatarUrl: profile.avatarUrl } : null} />
      <PageContainer>
        <h1 className="text-title font-bold">마이페이지</h1>

        <Card className="mt-6 p-6">
          <div className="flex items-center gap-4">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="프로필"
                className="h-14 w-14 rounded-full"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-subtitle font-bold text-secondary-foreground">
                {profile?.nickname?.[0] || '?'}
              </div>
            )}
            <div>
              <p className="text-subtitle font-semibold">{profile?.nickname || '사용자'}</p>
              {profile?.subscriptionStatus === 'premium' ? (
                <Badge className="mt-1 gap-1 bg-primary text-primary-foreground">
                  <Crown className="h-3.5 w-3.5" />
                  프리미엄
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-1">무료</Badge>
              )}
            </div>
          </div>
        </Card>

        <div className="mt-6 space-y-2">
          <Link href="/subscription">
            <Button variant="outline" className="w-full justify-start text-body">
              구독 관리
            </Button>
          </Link>
        </div>

        <Separator className="my-6" />

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-body text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          로그아웃
        </Button>
      </PageContainer>
      <MobileNav />
    </>
  )
}
