import { login, signup } from './actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SocialLoginForm } from '@/components/social-login-form'
import { AdBanner } from '@/components/ui/ad-banner'

interface LoginPageProps {
  searchParams: Promise<{ error?: string; message?: string }>;
}

export default async function LoginPage({ searchParams: searchParamsPromise }: LoginPageProps) {
  const searchParams = await searchParamsPromise;
  const error = searchParams?.error;
  const message = searchParams?.message;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 rounded-3xl shadow-xl p-8 space-y-8 border border-blue-100">
          {/* ヘッダー */}
          <div className="text-center space-y-2">
            <div className="text-4xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-gray-800">
              おかえりなさい！
            </h1>
            <p className="text-gray-600 text-sm">
            アカウントをお持ちでない場合は{' '}
              <Link href="/signup" className="text-blue-500 hover:text-blue-600 font-medium hover:underline">
              新規登録
            </Link>
          </p>
        </div>
        
        {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">
              ❌ {error}
          </div>
        )}
        
        {message && (
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl text-sm border border-green-100">
              ✅ {message}
          </div>
        )}
        
          {/* ソーシャルログイン */}
          <div className="space-y-3">
            <SocialLoginForm provider="google" />
            <SocialLoginForm provider="twitter" />
          </div>

          {/* 区切り線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-blue-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500 font-medium">
                または
              </span>
            </div>
          </div>
          
          <form className="space-y-6">
          <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                メールアドレス
              </Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="your@email.com"
                className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required 
              />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  パスワード
                </Label>
                <Link href="/forgot-password" className="text-xs text-blue-500 hover:text-blue-600 hover:underline">
                パスワードをお忘れですか？
              </Link>
            </div>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required 
              />
          </div>
          
            <Button 
              formAction={login} 
              className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl py-3 font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🚀 ログイン
          </Button>
        </form>
        
          <div className="text-center">
            <p className="text-xs text-gray-400">
            ログインすることで、
              <Link href="/terms" className="text-blue-500 hover:underline">
              利用規約
            </Link>
            と
              <Link href="/privacy" className="text-blue-500 hover:underline">
              プライバシーポリシー
            </Link>
            に同意したことになります。
          </p>
          </div>
        </div>

        {/* 広告バナー */}
        <div className="mt-6">
          <AdBanner size="small" position="bottom" />
        </div>
      </div>
    </div>
  )
} 