import { login, signup } from './actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function LoginPage({ searchParams: searchParamsPromise }: LoginPageProps) {
  const searchParams = await searchParamsPromise;
  const error = searchParams?.error;
  const message = searchParams?.message;
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p className="text-sm text-muted-foreground mt-2">
            アカウントをお持ちでない場合は{' '}
            <Link href="/signup" className="text-primary hover:underline">
              新規登録
            </Link>
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
        
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">パスワード</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                パスワードをお忘れですか？
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          
          <Button formAction={login} className="w-full">
            ログイン
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            ログインすることで、
            <Link href="/terms" className="text-primary hover:underline">
              利用規約
            </Link>
            と
            <Link href="/privacy" className="text-primary hover:underline">
              プライバシーポリシー
            </Link>
            に同意したことになります。
          </p>
        </div>
      </div>
    </div>
  )
} 