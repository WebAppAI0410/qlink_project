'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserQuestionAnalytics } from '@/utils/analytics';
import { createClient } from '@/utils/supabase/client';

interface QuestionAnalyticsProps {
  userId: string;
  isPremium: boolean;
}

interface QuestionData {
  id: string;
  content: string;
  created_at: string;
  is_open: boolean;
  view_count: number;
  answers: { count: number }[];
}

interface AnalyticsStats {
  totalQuestions: number;
  totalViews: number;
  totalAnswers: number;
  averageViewsPerQuestion: number;
  averageAnswersPerQuestion: number;
}

export function QuestionAnalytics({ userId, isPremium }: QuestionAnalyticsProps) {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    fetchAnalytics();
  }, [userId, isPremium]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const analyticsData = await getUserQuestionAnalytics(userId);
      setQuestions(analyticsData.questions);
      setStats(analyticsData.stats);
    } catch (err: any) {
      setError(err.message || 'アナリティクスデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            アナリティクス機能
          </h3>
          <p className="text-gray-600 mb-6">
            質問の閲覧数や回答数などの詳細な分析データを確認できます
          </p>
          <Badge variant="outline" className="px-4 py-2 rounded-full">
            👑 プレミアム機能
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">アナリティクスデータを読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl border-red-200">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計サマリー */}
      {stats && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              📊 アナリティクス概要
            </CardTitle>
            <CardDescription>
              あなたの質問活動の統計情報
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-2xl">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">質問数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-2xl">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalViews}
                </div>
                <div className="text-sm text-gray-600">総閲覧数</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-2xl">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.totalAnswers}
                </div>
                <div className="text-sm text-gray-600">総回答数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-2xl">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.averageViewsPerQuestion}
                </div>
                <div className="text-sm text-gray-600">平均閲覧数</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-2xl">
                <div className="text-2xl font-bold text-pink-600">
                  {stats.averageAnswersPerQuestion}
                </div>
                <div className="text-sm text-gray-600">平均回答数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 質問一覧 */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            📋 質問別データ
          </CardTitle>
          <CardDescription>
            各質問のパフォーマンス詳細
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🤔</div>
              <p className="text-gray-600">まだ質問が投稿されていません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium line-clamp-2 mb-2">
                        {question.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📅 {new Date(question.created_at).toLocaleDateString('ja-JP')}</span>
                        <Badge
                          variant={question.is_open ? "default" : "secondary"}
                          className="px-2 py-1 text-xs"
                        >
                          {question.is_open ? '🔥 募集中' : '⏰ 締切'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-4 text-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {question.view_count || 0}
                        </div>
                        <div className="text-xs text-gray-500">閲覧</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {question.answers?.[0]?.count || 0}
                        </div>
                        <div className="text-xs text-gray-500">回答</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 