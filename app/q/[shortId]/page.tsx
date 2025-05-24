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
import { Metadata } from "next";// 動的OG画像を使用するメタデータ生成export async function generateMetadata({ params }: {  params: Promise<{ shortId: string }>;}): Promise<Metadata> {  const { shortId } = await params;    // Edge Function生成の画像URLを設定  const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/og/${shortId}`;  return {    title: `質問 - Qlink`,    description: "匿名回答募集プラットフォーム",    openGraph: {      title: `質問 - Qlink`,      description: "匿名回答募集プラットフォーム",      type: 'article',      images: [ogImageUrl],    },    twitter: {      card: 'summary_large_image',      title: `質問 - Qlink`,      description: "匿名回答募集プラットフォーム",      images: [ogImageUrl],    },  };}

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
    <div className="container max-w-xl px-4 py-12">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-4">
          <span className="text-2xl font-bold">Qlink</span> 
        </Link>
        <h1 className="text-xl font-semibold">匿名で回答する</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">質問:</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            投稿者: {question.user?.display_name || question.user?.username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{question.content}</p>
        </CardContent>
      </Card>

      {/* 広告バナー */}
      <div className="mb-6">
        <AdBanner size="medium" position="top" />
      </div>

      {message && (
        <div className="mb-6">
          <FormMessage message={message} />
        </div>
      )}

      {searchParams.success ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="mb-4">回答ありがとうございました！</p>
            <Button asChild variant="outline">
              <Link href="/">トップページへ</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <form action={createAnonymousAnswerAction} className="space-y-6">
              <input type="hidden" name="question_id" value={question.id} />
              <input type="hidden" name="short_id" value={question.short_id} />
              <div className="space-y-2">
                <Label htmlFor="content">回答内容</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="回答を入力してください"
                  className="min-h-[150px]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  最大500文字まで入力できます
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit">回答を送信</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          <Link href="/sign-up" className="underline">
            アカウントを作成して質問する
          </Link>
        </p>
      </div>
    </div>
  );
} 