'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { AdBanner } from '@/components/ui/ad-banner';
import { usePremium } from '@/lib/hooks/use-premium';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PremiumBadge } from '@/components/ui/premium-badge';

interface Profile {
  username: string;
  display_name: string | null;
  profile_pic_url: string | null;
  avatar_url?: string;
}

interface Question {
  id: string;
  content: string;
  created_at: string;
  is_open: boolean;
  short_id: string;
  answers?: { count: number }[];
}

interface Answer {
  id: string;
  content: string;
  created_at: string;
  question: {
    id: string;
    content: string;
    short_id: string;
  };
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'questions' | 'answers'>('home');
  const [isLoading, setIsLoading] = useState(true);
  
  // 質問作成用の状態
  const [questionContent, setQuestionContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();
  const maxLength = 1000;
  const remainingChars = maxLength - questionContent.length;
  
  // プレミアム状態を取得
  const { isPremium } = usePremium(user);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      // プロフィール情報を取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }
      
      // 質問一覧を取得
      const { data: questionsData } = await supabase
    .from('questions')
        .select(`
          *,
          answers(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (questionsData) {
        setQuestions(questionsData);
      }
      
      // 回答一覧を取得
      const { data: answersData } = await supabase
        .from('answers')
        .select(`
          *,
          question:questions(id, content, short_id)
        `)
    .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (answersData) {
        setAnswers(answersData);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [supabase, router]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionContent.trim() || !user) return;
    
    setIsCreating(true);
    setCreateError('');
    
    try {
      const shortId = Math.random().toString(36).substring(2, 12);
      
      const { data, error: insertError } = await supabase
        .from('questions')
        .insert({
          content: questionContent.trim(),
          user_id: user.id,
          short_id: shortId,
        })
        .select(`
          *,
          answers(count)
        `)
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      // 質問一覧を更新
      setQuestions(prev => [data, ...prev]);
      setQuestionContent('');
      setShowPreview(false);
      
      // 質問詳細画面に遷移
      router.push(`/protected/questions/${data.id}`);
      
    } catch (error: any) {
      console.error('質問作成エラー:', error);
      setCreateError(error.message || '質問の作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const openQuestions = questions.filter(q => q.is_open).length;
  const totalAnswers = questions.reduce((sum, q) => sum + (q.answers?.[0]?.count || 0), 0);
  const myAnswers = answers.length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="text-4xl">🏠</div>
          <h1 className="text-3xl font-bold text-gray-800">
            おかえりなさい、{profile?.display_name || profile?.username || 'ユーザー'}さん！
          </h1>
        </div>

        {/* ユーザー情報カード */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-blue-200 shadow-lg">
                  <AvatarImage 
                    src={profile?.avatar_url || undefined} 
                    alt={profile?.display_name || profile?.username || 'ユーザー'} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-sky-400 text-white text-2xl font-bold">
                    {(profile?.display_name || profile?.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isPremium && (
                  <div className="absolute -bottom-1 -right-1">
                    <PremiumBadge size="sm" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {profile?.display_name || profile?.username || 'ユーザー'}
                  </h2>
                  {isPremium && <PremiumBadge size="md" />}
                </div>
                <p className="text-gray-600 mb-4">
                  Qlinkで質問と回答を通じて、新しい発見をしよう！
                </p>
                <div className="flex gap-3">
                  <Button 
                    asChild 
                    className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <Link href="/protected/questions/new">✍️ 質問を作成</Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline"
                    className="rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    <Link href="/protected/profile">👤 プロフィール</Link>
                  </Button>
                  {!isPremium && (
                    <Button 
                      asChild 
                      variant="outline"
                      className="rounded-xl border-2 border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50 text-yellow-600 transition-all duration-200"
                    >
                      <Link href="/premium">👑 プレミアム</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* タブナビゲーション */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'home'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              🏠 ホーム
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'questions'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              📝 質問一覧 ({totalQuestions})
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'answers'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              💬 回答一覧 ({myAnswers})
            </button>
          </div>
        </div>

        {/* ホームタブ */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* 統計カード */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-xl font-bold text-blue-600">{totalQuestions}</div>
                  <p className="text-sm text-gray-600">作成した質問</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="text-xl font-bold text-green-600">{openQuestions}</div>
                  <p className="text-sm text-gray-600">回答受付中</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">💬</div>
                  <div className="text-xl font-bold text-purple-600">{totalAnswers}</div>
                  <p className="text-sm text-gray-600">受け取った回答</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">✍️</div>
                  <div className="text-xl font-bold text-orange-600">{myAnswers}</div>
                  <p className="text-sm text-gray-600">投稿した回答</p>
                </CardContent>
              </Card>
            </div>

            {/* 広告バナー */}
            <AdBanner size="medium" position="top" isPremium={isPremium} />

            {/* 質問作成フォーム */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  ✨ 新しい質問を作成
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {createError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                    ❌ {createError}
                  </div>
                )}
                
                <form onSubmit={handleCreateQuestion} className="space-y-4">
                  {!showPreview ? (
                    <div className="space-y-3">
                      <Label htmlFor="content" className="text-gray-700 font-medium">
                        質問内容
                      </Label>
                      <Textarea
                        id="content"
                        value={questionContent}
                        onChange={(e) => setQuestionContent(e.target.value)}
                        placeholder="例: 私の考えたアプリのアイデアはどう思いますか？"
                        className="min-h-[120px] rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                        maxLength={maxLength}
                        required
                      />
      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          💡 具体的で分かりやすい質問ほど、良い回答が集まります
                        </p>
                        <p className={`text-xs font-medium ${
                          remainingChars < 50 ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          残り {remainingChars} 文字
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label className="text-gray-700 font-medium">プレビュー</Label>
                      <div className="bg-gray-50 rounded-xl p-4 min-h-[120px]">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {questionContent || 'ここに質問内容が表示されます...'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreview(!showPreview)}
                      className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                      disabled={!questionContent.trim()}
                    >
                      {showPreview ? '✏️ 編集' : '👀 プレビュー'}
                    </Button>
                    
                    <Button 
                      type="submit"
                      disabled={isCreating || !questionContent.trim()}
                      className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      {isCreating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>作成中...</span>
                        </div>
                      ) : (
                        '🚀 質問を作成'
                      )}
        </Button>
      </div>
                </form>
              </CardContent>
            </Card>

            {/* 最近の質問 */}
            {questions.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">📋 最近の質問</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {questions.slice(0, 3).map((question) => (
                    <Link
              key={question.id}
                      href={`/protected/questions/${question.id}`}
                      className="block p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors duration-200"
                    >
                      <p className="font-medium text-gray-800 line-clamp-2 mb-2">
                        {question.content}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          question.is_open 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {question.is_open ? '🔥 回答受付中' : '⏰ 締め切り済み'}
                  </span>
                        <span className="text-gray-500">
                          💬 {question.answers?.[0]?.count || 0}件の回答
                  </span>
                </div>
              </Link>
                  ))}
                  {questions.length > 3 && (
                    <button
                      onClick={() => setActiveTab('questions')}
                      className="w-full p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                    >
                      すべての質問を見る →
                    </button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 質問一覧タブ */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {questions.length > 0 ? (
              questions.map((question) => (
                <Card
                  key={question.id}
                  className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                >
                  <CardContent className="p-6">
                    <Link href={`/protected/questions/${question.id}`} className="block space-y-4">
                      <p className="text-lg font-medium text-gray-800 line-clamp-3 leading-relaxed">
                        {question.content}
                      </p>
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            question.is_open 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {question.is_open ? '🔥 回答受付中' : '⏰ 締め切り済み'}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            💬 {question.answers?.[0]?.count || 0}件の回答
                          </span>
            </div>
                        <span className="text-sm text-gray-500">
                          {new Date(question.created_at).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
        </div>
                    </Link>
                  </CardContent>
                </Card>
              ))
      ) : (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🤔</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    まだ質問がありません
                  </h3>
                  <p className="text-gray-600 mb-6">
                    ホームタブで最初の質問を作成してみましょう！
                  </p>
                  <Button 
                    onClick={() => setActiveTab('home')}
                    className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl px-6 py-3 font-medium shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    🚀 質問を作成する
          </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 回答一覧タブ */}
        {activeTab === 'answers' && (
          <div className="space-y-4">
            {answers.length > 0 ? (
              answers.map((answer) => (
                <Card
                  key={answer.id}
                  className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-blue-600 font-medium mb-2">質問:</p>
                        <p className="text-gray-800 line-clamp-2">
                          {answer.question.content}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-2">あなたの回答:</p>
                        <p className="text-gray-800 leading-relaxed">
                          {answer.content}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <Link
                          href={`/q/${answer.question.short_id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                        >
                          質問ページを見る →
                        </Link>
                        <span className="text-sm text-gray-500">
                          {new Date(answer.created_at).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">💭</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    まだ回答がありません
                  </h3>
                  <p className="text-gray-600 mb-6">
                    他の人の質問に回答してみましょう！
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      )}
      </div>
    </div>
  );
} 