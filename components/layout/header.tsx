'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from '@supabase/supabase-js'

export default function Header({ user }: { user: User | null }) {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold">
            Qlink
          </Link>
          {user && (
            <nav className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                ダッシュボード
              </Link>
              <Link href="/questions/new" className="text-muted-foreground hover:text-foreground">
                質問作成
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <span className="sr-only">メニューを開く</span>
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">プロフィール</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">マイ質問</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">設定</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/logout" prefetch={false}>ログアウト</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">ログイン</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">新規登録</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 