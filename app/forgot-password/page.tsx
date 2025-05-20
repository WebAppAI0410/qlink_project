import { forgotPasswordAction } from './actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  const error = searchParams.error
  const message = searchParams.message
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">パスワードをお忘れですか？</h1>
          <p className="text-sm text-muted-foreground mt-2">
            登録したメールアドレスを入力してください。パスワードリセットのためのリンクを送信します。
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
        
        {message && (
          <div className="p-4 bg-green-100 text-green-800 rounded-md">
            {message}
          </div>
        )}
        
        <form action={forgotPasswordAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          
          <input type="hidden" name="origin" value={origin} />
          
          <Button type="submit" className="w-full">
            リセットリンクを送信
          </Button>
          
          <div className="text-center">
            <Link href="/login" className="text-primary hover:underline text-sm">
              ログインページに戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 