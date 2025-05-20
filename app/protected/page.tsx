import { getUserProfile } from "@/utils/user";
import { getUserQuestions } from "@/utils/questions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon, MailIcon } from "lucide-react";

export default async function Dashboard() {
  const userData = await getUserProfile();
  
  // ユーザーがログインしていない場合はログインページにリダイレクト
  if (!userData) {
    redirect("/sign-in");
  }
  
  const { user, profile } = userData;
  
  // ユーザーの質問一覧を取得
  const questions = await getUserQuestions(user.id);

  return (
    <div className="container max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Button asChild>
          <Link href="/protected/questions/new" className="flex items-center gap-2">
            <PlusIcon size={16} />
            <span>新しい質問を作成</span>
          </Link>
        </Button>
      </div>
      
      <div className="bg-card rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {profile.display_name ? profile.display_name[0].toUpperCase() : profile.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold">{profile.display_name || profile.username}</h2>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">あなたの質問一覧</h2>
      
      {questions.length === 0 ? (
        <div className="bg-card rounded-lg p-6 text-center shadow-sm">
          <p className="mb-4 text-muted-foreground">まだ質問が作成されていません</p>
          <Button asChild>
            <Link href="/protected/questions/new">最初の質問を作成する</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <Link 
              href={`/protected/questions/${question.id}`} 
              key={question.id}
              className="bg-card hover:bg-accent/5 rounded-lg p-4 shadow-sm transition-colors"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {new Date(question.created_at).toLocaleDateString('ja-JP')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  question.is_open 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {question.is_open ? '回答募集中' : '締め切り'}
                </span>
              </div>
              
              <p className="line-clamp-2 mb-2">{question.content}</p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MailIcon size={14} />
                <span>{question._count?.answers || 0} 件の回答</span>
      </div>
            </Link>
          ))}
      </div>
      )}
    </div>
  );
}
