import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      {/* ヒーローセクション */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12 px-4 py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="text-6xl mb-6">💬✨</div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
            Qlinkへようこそ！
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl leading-relaxed">
            匿名で気軽に質問し、みんなの意見を集めましょう。<br />
            あなたの疑問や興味を共有し、新しい発見があるかもしれません。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl px-8 py-4 text-lg font-medium shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Link href="/login">🚀 ログイン</Link>
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="border-2 border-blue-200 hover:border-sky-300 hover:bg-sky-50 rounded-xl px-8 py-4 text-lg font-medium transition-all duration-200 hover:scale-105"
          >
            <Link href="/signup">✨ 新規登録</Link>
          </Button>
        </div>
      </div>

      {/* 特徴セクション */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Qlinkの特徴
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/90 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">完全匿名</h3>
              <p className="text-gray-600">
                ログイン不要で誰でも回答できます。本音で答えやすい環境を提供します。
              </p>
            </div>
            <div className="bg-white/90 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">簡単共有</h3>
              <p className="text-gray-600">
                質問リンクを簡単にシェア。SNSで拡散して多くの意見を集められます。
              </p>
            </div>
            <div className="bg-white/90 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">リアルタイム</h3>
              <p className="text-gray-600">
                回答はリアルタイムで更新。すぐに結果を確認できます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTAセクション */}
      <div className="py-20 px-4 bg-gradient-to-r from-blue-500 to-sky-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            今すぐ始めてみませんか？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            無料で簡単に始められます
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl px-8 py-4 text-lg font-medium shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Link href="/signup">🎉 無料で始める</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 