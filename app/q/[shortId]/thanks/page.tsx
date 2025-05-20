import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";

export default async function AnswerThanksPage({ params }: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  
  return (
    <div className="container max-w-md px-4 py-24 flex flex-col items-center text-center">
      <Card className="w-full">
        <CardHeader className="items-center">
          <CheckCircle2Icon className="w-16 h-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl">回答ありがとうございました！</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            あなたの回答は正常に送信されました。
          </p>
          <Button asChild className="w-full">
            <Link href="/">トップページに戻る</Link>
          </Button>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground mt-8">
        <Link href="/sign-up" className="underline">
          Qlinkでアカウントを作成
        </Link>
        して、あなたも質問を投稿してみませんか？
      </p>
    </div>
  );
} 