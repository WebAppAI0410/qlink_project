import { getQuestionById, getQuestionAnswers } from "@/utils/questions";
import { getUserProfile } from "@/utils/user";
import { redirect, notFound } from "next/navigation";
import { updateQuestionStatusAction, setBestAnswerAction, toggleAnswerVisibilityAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormMessage, Message } from "@/components/form-message";
import { Share2Icon, CheckCircleIcon, EyeIcon, EyeOffIcon, Edit3Icon } from "lucide-react";
import Link from "next/link";
import { ShareButtons } from "./share-buttons";
import { AdBanner } from "@/components/ui/ad-banner";
import { ViewTracker } from "@/components/analytics/view-tracker";

export default async function QuestionDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Message>;
}) {
  const resolvedParams = await props.params;
  const { id } = resolvedParams;
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

  // 質問の閲覧数を記録（所有者以外の場合のみ）
  if (!isOwner) {
    // クライアントサイドで呼び出す必要があるため、コンポーネントで実装
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 py-8">
      {/* 質問閲覧数の記録 */}
      <ViewTracker 
        questionId={question.id} 
        userId={userData.user.id} 
        isOwner={isOwner} 
      />
      
      <div className="container max-w-4xl px-4 space-y-8">
      {searchParams.message && (
        <div className="mb-6">
          <FormMessage message={searchParams} />
        </div>
      )}

        {/* 質問カード */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl border border-blue-100">
          <CardHeader className="p-8">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="text-3xl mb-4">❓</div>
                <CardTitle className="text-2xl mb-4 leading-relaxed text-gray-800">
                  {question.content}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500 flex items-center gap-4">
                  <span>👤 {question.user?.display_name || question.user?.username}</span>
                  <span>📅 {new Date(question.created_at).toLocaleDateString('ja-JP')}</span>
                </CardDescription>
              </div>
              <Badge 
                variant={question.is_open ? "default" : "secondary"}
                className={`px-3 py-1 rounded-full font-medium ${
                  question.is_open 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                {question.is_open ? "🔥 回答募集中" : "⏰ 締め切り"}
            </Badge>
            </div>
          </CardHeader>
          
          {/* 共有セクション */}
          <div className="px-8 pb-4">
            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🔗 質問を共有して回答を集めよう！
              </h3>
              <ShareButtons questionShortId={question.short_id} questionContent={question.content} />
            </div>
          </div>

        {isOwner && (
            <CardFooter className="flex justify-between items-center border-t border-blue-100 p-6 bg-blue-50/50 rounded-b-3xl">
              <div className="flex gap-3">
              <form action={updateQuestionStatusAction}>
                <input type="hidden" name="question_id" value={question.id} />
                <input type="hidden" name="is_open" value={(!question.is_open).toString()} />
                  <Button 
                    type="submit" 
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    {question.is_open ? "⏰ 締め切る" : "🔥 募集を再開"}
                </Button>
              </form>
            </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="rounded-xl border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                >
                <Link href={`/q/${question.short_id}`} target="_blank">
                    <Share2Icon size={14} className="mr-2" /> 👁️ 回答画面を確認
                </Link>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

        {/* 広告バナー */}
        <AdBanner size="medium" position="top" />

        {/* 回答一覧ヘッダー */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            💬 回答一覧
          </h2>
          <p className="text-gray-600">
            {answers.length}件の回答が寄せられています
          </p>
        </div>

        {/* 回答一覧 */}
      {answers.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl border border-blue-100">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                まだ回答がありません
              </h3>
              <p className="text-gray-600 mb-6">
                上記の共有機能を使って、質問を拡散してみましょう！
              </p>
            </CardContent>
          </Card>
      ) : (
          <div className="space-y-6">
            {answers.map((answer, index) => (
              <Card 
                key={answer.id} 
                className={`bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl ${
                  answer.id === question.best_answer_id 
                    ? 'border-2 border-yellow-300 bg-yellow-50/50' 
                    : 'border border-blue-100'
                } ${answer.is_hidden && !isOwner ? 'hidden' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-sky-400 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`text-gray-800 leading-relaxed whitespace-pre-wrap ${
                        answer.is_hidden ? 'italic text-gray-500' : ''
                      }`}>
                  {answer.is_hidden ? (isOwner ? "この回答は非表示に設定されています。" : "") : answer.content}
                </p>
                    </div>
                  </div>
              </CardContent>
              {(isOwner || answer.id === question.best_answer_id) && (
                  <CardFooter className="text-sm text-gray-500 justify-between border-t border-blue-100 p-4 bg-blue-50/30 rounded-b-2xl">
                    <div className="flex items-center gap-3">
                    {answer.id === question.best_answer_id && (
                        <Badge 
                          variant="secondary" 
                          className="bg-yellow-100 text-yellow-700 border-yellow-200 rounded-full px-3 py-1"
                        >
                          <CheckCircleIcon size={12} className="mr-1" /> ⭐ ベストアンサー
                      </Badge>
                    )}
                      <span className="text-xs">
                        📅 {new Date(answer.created_at).toLocaleString('ja-JP')}
                      </span>
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <form action={toggleAnswerVisibilityAction}>
                        <input type="hidden" name="answer_id" value={answer.id} />
                        <input type="hidden" name="question_id" value={question.id} />
                        <input type="hidden" name="is_hidden" value={(!answer.is_hidden).toString()} />
                          <Button 
                            type="submit" 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-lg hover:bg-blue-100"
                            title={answer.is_hidden ? "表示する" : "非表示にする"}
                          >
                          {answer.is_hidden ? <EyeIcon size={14}/> : <EyeOffIcon size={14} />}
                        </Button>
                      </form>
                      {!answer.is_hidden && answer.id !== question.best_answer_id && (
                        <form action={setBestAnswerAction}>
                          <input type="hidden" name="question_id" value={question.id} />
                          <input type="hidden" name="answer_id" value={answer.id} />
                            <Button 
                              type="submit" 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-lg hover:bg-yellow-100"
                              title="ベストアンサーに設定"
                            >
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
    </div>
  );
} 