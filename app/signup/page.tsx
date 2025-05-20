import { signup } from '../login/actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">新規登録</h1>
          <p className="text-sm text-muted-foreground mt-2">
            すでにアカウントをお持ちの場合は{' '}
            <Link href="/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
        
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" name="password" type="password" required />
            <p className="text-xs text-muted-foreground">
              パスワードは8文字以上で、英数字と記号を含める必要があります。
            </p>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox id="terms" required />
            <Label htmlFor="terms" className="text-sm leading-tight">
              <span className="text-muted-foreground">
                <Link href="/terms" className="text-primary hover:underline">
                  利用規約
                </Link>
                と
                <Link href="/privacy" className="text-primary hover:underline">
                  プライバシーポリシー
                </Link>
                に同意します
              </span>
            </Label>
          </div>
          
          <Button formAction={signup} className="w-full">
            登録する
          </Button>
        </form>
      </div>
    </div>
  )
} 