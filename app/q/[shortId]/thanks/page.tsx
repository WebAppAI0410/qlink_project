import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function AnswerThanksPage({   
  params,  
  searchParams
}: {  
  params: Promise<{ shortId: string }>;  
  searchParams: Promise<{ warning?: string }>
}) {  
  const { shortId } = await params;  
  const { warning } = await searchParams;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* メインサンクスカード */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl border border-green-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 text-center p-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <CardTitle className="text-2xl text-gray-800 leading-relaxed">
              回答ありがとうございました！
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center p-8 space-y-6">
            <p className="text-gray-600 text-lg leading-relaxed">
              あなたの<span className="font-medium text-green-600">素敵な回答</span>が<br />
              質問者に届きました！✨
            </p>
            
            {warning && (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
                <div className="flex items-center gap-3 text-yellow-800">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-sm leading-relaxed">{decodeURIComponent(warning)}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-2xl p-6">
                <div className="text-3xl mb-2">💭</div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  きっと質問者の方が<br />
                  喜んでくれると思います！
                </p>
              </div>

              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl py-4 text-lg font-medium shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Link href="/">🏠 ホームに戻る</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* アカウント作成のCTA */}
        <Card className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 rounded-3xl">
          <CardContent className="text-center p-8">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              あなたも質問してみませんか？
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              無料でアカウントを作成して、<br />
              みんなに気軽に質問してみよう！
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                asChild 
                variant="outline"
                className="rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 px-6 py-3 font-medium transition-all duration-200"
              >
                <Link href="/login">🔑 ログイン</Link>
              </Button>
              <Button 
                asChild
                className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl px-6 py-3 font-medium shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Link href="/signup">🎉 無料でアカウント作成</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 他の質問への誘導 */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">
            他にも面白い質問がたくさん！
          </p>
          <Button 
            asChild 
            variant="ghost"
            className="rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
          >
            <Link href="/">💬 他の質問を見る</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 