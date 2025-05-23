'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';

export default function NewQuestionPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  const maxLength = 1000;
  const remainingChars = maxLength - content.length;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('ログインが必要です');
      }
      
      // 短縮IDを生成
      const shortId = Math.random().toString(36).substring(2, 12);
      
      const { data, error: insertError } = await supabase
        .from('questions')
        .insert({
          content: content.trim(),
          user_id: user.id,
          short_id: shortId,
        })
        .select()
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      router.push(`/protected/questions/${data.id}`);
    } catch (error: any) {
      console.error('質問作成エラー:', error);
      setError(error.message || '質問の作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="text-4xl">✨</div>
          <h1 className="text-3xl font-bold text-gray-800">
            新しい質問を作成
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            あなたの疑問や興味を質問にして、みんなの意見を聞いてみましょう！<br />
            匿名で回答してもらえるので、本音の意見が集まります。
          </p>
        </div>
        
        {error && (
          <Card className="bg-red-50 border-red-200 rounded-2xl">
            <CardContent className="p-4">
              <p className="text-red-600 text-center">❌ {error}</p>
            </CardContent>
          </Card>
        )}
        
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl border border-blue-100">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800">
              {showPreview ? '📖 プレビュー' : '✍️ 質問を入力'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!showPreview ? (
                <div className="space-y-4">
                  <Label htmlFor="content" className="text-gray-700 font-medium text-lg">
                    質問内容
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="例: 私の考えたアプリのアイデアはどう思いますか？詳しく教えてください！"
                    className="min-h-[200px] rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-lg leading-relaxed"
                    maxLength={maxLength}
                    required
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      💡 具体的で分かりやすい質問ほど、良い回答が集まります
                    </p>
                    <p className={`text-sm font-medium ${
                      remainingChars < 50 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      残り {remainingChars} 文字
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Label className="text-gray-700 font-medium text-lg">
                    プレビュー
                  </Label>
                  <div className="bg-blue-50 rounded-xl p-6 min-h-[200px] border border-blue-100">
                    <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                      {content || 'ここに質問内容が表示されます...'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    この内容で質問を作成します
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 px-6 py-3 font-medium transition-all duration-200"
                  disabled={!content.trim()}
                >
                  {showPreview ? '✏️ 編集に戻る' : '👀 プレビュー'}
                </Button>
                
                <Button 
                  variant="outline" 
                  asChild
                  className="rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-6 py-3 font-medium transition-all duration-200"
                >
                  <Link href="/dashboard">キャンセル</Link>
                </Button>
                
                <Button 
                  type="submit"
                  disabled={isLoading || !content.trim()}
                  className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl px-8 py-3 font-medium shadow-lg transition-all duration-200 hover:scale-105"
                >
                  {isLoading ? (
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
        
        {/* ヒント */}
        <Card className="bg-blue-50/80 border-blue-200 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span>💡</span> 良い質問のコツ
            </h3>
            <ul className="space-y-2 text-blue-700">
              <li>• 具体的で分かりやすい内容にする</li>
              <li>• 背景や状況を簡潔に説明する</li>
              <li>• 回答者が答えやすい形で質問する</li>
              <li>• 複数の観点からの意見を求める</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 