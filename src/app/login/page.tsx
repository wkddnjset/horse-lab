import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton'
import { PageContainer } from '@/components/layout/PageContainer'

export default function LoginPage() {
  return (
    <PageContainer className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-heading font-bold text-primary">경마연구소</h1>
          <p className="mt-2 text-body text-muted-foreground">
            전략별 근거 있는 Top3 추천
          </p>
        </div>

        <div className="space-y-4">
          <KakaoLoginButton />
          <p className="text-caption text-muted-foreground">
            로그인 시 서비스 이용약관에 동의하게 됩니다
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
