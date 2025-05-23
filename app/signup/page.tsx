import { signup } from '../login/actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { SocialLoginForm } from '@/components/social-login-form'

interface SignUpPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignUpPage({ searchParams: searchParamsPromise }: SignUpPageProps) {
  const searchParams = await searchParamsPromise;
  const error = searchParams?.error;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 rounded-3xl shadow-xl p-8 space-y-8 border border-blue-100">
          {/* ヘッダー */}
          <div className="text-center space-y-2">
            <div className="text-4xl mb-4">✨</div>
            <h1 className="text-2xl font-bold text-gray-800">
              Qlinkへようこそ！
            </h1>
            <p className="text-gray-600 text-sm">
              すでにアカウントをお持ちの場合は{' '}
              <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium hover:underline">
                ログイン
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">
              ❌ {error}
            </div>
          )}

          {/* ソーシャル登録 */}
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
              <Label htmlFor="password" className="text-gray-700 font-medium">
                パスワード
              </Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="••••••••"
                className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required 
              />
              <p className="text-xs text-gray-500">
                パスワードは8文字以上で、英数字と記号を含める必要があります。
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox id="terms" required className="mt-1" />
              <Label htmlFor="terms" className="text-sm leading-relaxed text-gray-600">
                <Link href="/terms" className="text-blue-500 hover:text-blue-600 hover:underline font-medium">
                  利用規約
                </Link>
                と
                <Link href="/privacy" className="text-blue-500 hover:text-blue-600 hover:underline font-medium">
                  プライバシーポリシー
                </Link>
                に同意します
              </Label>
            </div>
            
            <Button 
              formAction={signup} 
              className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-xl py-3 font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🎉 アカウントを作成
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 