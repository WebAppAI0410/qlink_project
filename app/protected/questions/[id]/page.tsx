import { getQuestionById, getQuestionAnswers } from "@/utils/questions";
import { getUserProfile } from "@/utils/user";
import { redirect } from "next/navigation";
import { updateQuestionStatusAction, setBestAnswerAction, toggleAnswerVisibilityAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormMessage, Message } from "@/components/form-message";
import { Share2Icon, CheckCircleIcon, EyeIcon, EyeOffIcon, Edit3Icon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function QuestionDetailPage(props: {
  params: { id: string };
  searchParams: Promise<Message>;
}) {
  const { id } = props.params;
  const searchParams = await props.searchParams;
  const userData = await getUserProfile();

  if (!userData) {
    redirect("/sign-in");
  }

  const question = await getQuestionById(id);
  if (!question) {
    notFound();
  }

  // 質問作成者のみが管理可能
  const isOwner = userData.user.id === question.user_id;
  const answers = await getQuestionAnswers(id);

  return (
    <div className="container max-w-3xl px-4 py-8">
      {searchParams.message && (
        <div className="mb-6">
          <FormMessage message={searchParams} />
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl mb-2">{question.content}</CardTitle>
            <Badge variant={question.is_open ? "default" : "secondary"}>
              {question.is_open ? "回答募集中" : "締め切り"}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            投稿者: {question.user?.display_name || question.user?.username} | 
            作成日: {new Date(question.created_at).toLocaleDateString('ja-JP')}
          </CardDescription>
        </CardHeader>
        {isOwner && (
          <CardFooter className="flex justify-between items-center border-t pt-4">
            <div className="flex gap-2">
              <form action={updateQuestionStatusAction}>
                <input type="hidden" name="question_id" value={question.id} />
                <input type="hidden" name="is_open" value={(!question.is_open).toString()} />
                <Button type="submit" variant="outline" size="sm">
                  {question.is_open ? "締め切る" : "募集を再開"}
                </Button>
              </form>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/q/${question.short_id}`} target="_blank">
                  <Share2Icon size={14} className="mr-1" /> 回答用リンク
                </Link>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <h2 className="text-xl font-semibold mb-4">回答一覧 ({answers.length}件)</h2>

      {answers.length === 0 ? (
        <p className="text-muted-foreground">まだ回答はありません。</p>
      ) : (
        <div className="space-y-4">
          {answers.map((answer) => (
            <Card key={answer.id} className={`${answer.id === question.best_answer_id ? 'border-primary' : ''} ${answer.is_hidden && !isOwner ? 'hidden' : ''}`}>
              <CardContent className="pt-6">
                <p className={`whitespace-pre-wrap ${answer.is_hidden ? 'italic text-muted-foreground' : ''}`}>
                  {answer.is_hidden ? (isOwner ? "この回答は非表示に設定されています。" : "") : answer.content}
                </p>
              </CardContent>
              {(isOwner || answer.id === question.best_answer_id) && (
                <CardFooter className="text-xs text-muted-foreground justify-between border-t pt-3 pb-3">
                  <div>
                    {answer.id === question.best_answer_id && (
                      <Badge variant="secondary" className="mr-2">
                        <CheckCircleIcon size={12} className="mr-1" /> ベストアンサー
                      </Badge>
                    )}
                    {new Date(answer.created_at).toLocaleString('ja-JP')}
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <form action={toggleAnswerVisibilityAction}>
                        <input type="hidden" name="answer_id" value={answer.id} />
                        <input type="hidden" name="question_id" value={question.id} />
                        <input type="hidden" name="is_hidden" value={(!answer.is_hidden).toString()} />
                        <Button type="submit" variant="ghost" size="sm" className="h-auto p-1">
                          {answer.is_hidden ? <EyeIcon size={14}/> : <EyeOffIcon size={14} />}
                        </Button>
                      </form>
                      {!answer.is_hidden && answer.id !== question.best_answer_id && (
                        <form action={setBestAnswerAction}>
                          <input type="hidden" name="question_id" value={question.id} />
                          <input type="hidden" name="answer_id" value={answer.id} />
                          <Button type="submit" variant="ghost" size="sm" className="h-auto p-1">
                            <CheckCircleIcon size={14} />
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 