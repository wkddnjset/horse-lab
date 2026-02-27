'use client'

import Link from 'next/link'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  user: { nickname: string; avatarUrl: string | null } | null
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-14 max-w-[430px] items-center justify-between px-4">
        <Link href="/" className="text-title font-bold text-primary">
          경마연구소
        </Link>
        {user ? (
          <Link href="/mypage">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-5 w-5" />
              <span className="max-w-[80px] truncate text-body">{user.nickname}</span>
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button size="sm" variant="outline">
              로그인
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
