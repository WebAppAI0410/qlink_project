import { getUserProfile } from "@/utils/user";
import { createQuestionAction } from "@/app/actions";
import { redirect } from "next/navigation";
import { FormMessage, Message } from "@/components/form-message";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NewQuestionPage(props: {
  searchParams: Promise<Message>;
}) {
  const userData = await getUserProfile();
  const searchParams = await props.searchParams;
  
  // ユーザーがログインしていない場合はログインページにリダイレクト
  if (!userData) {
    redirect("/sign-in");
  }
  
  return (
    <div className="container max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">新しい質問を作成</h1>
        <p className="text-muted-foreground">
          質問を作成して匿名の回答を募集することができます
        </p>
      </div>
      
      {searchParams.message && (
        <div className="mb-6">
          <FormMessage message={searchParams} />
        </div>
      )}
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <form action={createQuestionAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">質問内容</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="例: 私の考えたアプリのアイデアはどう思いますか？"
              className="min-h-[200px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              最大1000文字まで入力できます
            </p>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/protected">キャンセル</Link>
            </Button>
            <Button type="submit">質問を作成</Button>
          </div>
        </form>
      </div>
    </div>
  );
} 