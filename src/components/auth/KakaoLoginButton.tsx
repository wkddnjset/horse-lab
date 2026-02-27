'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function KakaoLoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <Button
      onClick={handleLogin}
      className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FDD835] font-medium text-base h-12"
    >
      카카오로 시작하기
    </Button>
  )
}
