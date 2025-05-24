import { getQuestionByShortId } from "@/utils/questions";
import { createAnonymousAnswerAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdBanner } from "@/components/ui/ad-banner";
import { Metadata } from "next";

// 動的OG画像を使用するメタデータ生成
export async function generateMetadata({ params }: {  
  params: Promise<{ shortId: string }>;
}): Promise<Metadata> {  
  const { shortId } = await params;    
  
  // Edge Function生成の画像URLを設定  
  const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og/${shortId}`;  
  return {    
    title: `質問 - Qlink`,    
    description: "匿名回答募集プラットフォーム",    
    openGraph: {      
      title: `質問 - Qlink`,      
      description: "匿名回答募集プラットフォーム",      
      type: 'article',      
      images: [ogImageUrl],    
    },    
    twitter: {      
      card: 'summary_large_image',      
      title: `質問 - Qlink`,      
      description: "匿名回答募集プラットフォーム",      
      images: [ogImageUrl],    
    },  
  };
}

export default async function AnonymousAnswerPage(props: {
  params: Promise<{ shortId: string }>;
  searchParams: Promise<{ message?: string; success?: string }>;
}) {
  const { shortId } = await props.params;
  const searchParams = await props.searchParams;
  const question = await getQuestionByShortId(shortId);

  if (!question || !question.is_open) {
    notFound();
  }

  // 検索パラメータからメッセージオブジェクトを構築
  const message: Message | undefined = searchParams.message ? {
    message: searchParams.message,
    ...(searchParams.success ? { success: searchParams.message } : { error: searchParams.message })
  } : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* ヘッダー */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="container max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
              <div className="text-2xl">💬</div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
                Qlink
              </span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">🎭</span>
              <span>匿名で回答中</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl px-4 py-8 space-y-8">
        {/* 質問表示カード */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl border border-blue-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 p-8">
            <div className="text-center space-y-4">
              <div className="text-4xl">❓</div>
              <CardTitle className="text-sm text-blue-600 font-medium">
                誰かからの質問です
              </CardTitle>
              <CardDescription className="text-xs text-blue-500">
                👤 {question.user?.display_name || question.user?.username} さんより
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-xl leading-relaxed text-gray-800 whitespace-pre-wrap">
                {question.content}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 広告バナー */}
        <AdBanner size="medium" position="top" />

        {message && (
          <div className="max-w-2xl mx-auto">
            <FormMessage message={message} />
          </div>
        )}

        {searchParams.success ? (
          /* 成功画面 */
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl border border-green-200 max-w-2xl mx-auto">
            <CardContent className="text-center p-12">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                回答ありがとうございました！
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                あなたの回答が質問者に届きました。<br />
                きっと喜んでもらえると思います！
              </p>
              <div className="space-y-4">
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl px-8 py-3 font-medium shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Link href="/">🏠 ホームに戻る</Link>
                </Button>
                <div className="text-center">
                  <Link 
                    href="/signup" 
                    className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4 transition-colors"
                  >
                    ✨ アカウントを作成して質問する
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* 回答フォーム */
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl border border-blue-100 max-w-2xl mx-auto">
            <CardHeader className="text-center p-8">
              <div className="text-4xl mb-4">💭</div>
              <CardTitle className="text-2xl text-gray-800">
                あなたの考えを教えてください
              </CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                匿名なので、気軽に本音で回答してくださいね！<br />
                質問者の参考になるような答えをお願いします。
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form action={createAnonymousAnswerAction} className="space-y-6">
                <input type="hidden" name="question_id" value={question.id} />
                <input type="hidden" name="short_id" value={question.short_id} />
                
                <div className="space-y-4">
                  <Label htmlFor="content" className="text-gray-700 font-medium text-lg">
                    💬 あなたの回答
                  </Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="例: 私だったら〇〇すると思います。理由は..."
                    className="min-h-[180px] rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-lg leading-relaxed resize-none"
                    maxLength={500}
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span>💡</span>
                      詳しく、分かりやすく答えると喜ばれます
                    </p>
                    <p className="text-sm text-gray-400">
                      最大500文字
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl px-8 py-4 text-lg font-medium shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    🚀 回答を送信
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      💡 匿名なので個人情報は一切記録されません
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ボトムCTA */}
        <Card className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 rounded-3xl max-w-2xl mx-auto">
          <CardContent className="text-center p-8">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              あなたも質問してみませんか？
            </h3>
            <p className="text-gray-600 mb-6">
              無料でアカウント作成して、みんなに質問してみよう！
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                asChild 
                variant="outline"
                className="rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 px-6 py-3 font-medium"
              >
                <Link href="/login">🔑 ログイン</Link>
              </Button>
              <Button 
                asChild
                className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl px-6 py-3 font-medium shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Link href="/signup">🎉 無料で始める</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 