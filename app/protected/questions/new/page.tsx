'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { AdBanner } from '@/components/ui/ad-banner';
import { usePremium, getCharacterLimit } from '@/lib/hooks/use-premium';
import { useEffect } from 'react';
import { X, ImageIcon, Crown } from 'lucide-react';
import { PremiumBadge } from '@/components/ui/premium-badge';

export default function NewQuestionPage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();
  
  // プレミアム状態を取得
  const { isPremium } = usePremium(user);
  const maxLength = getCharacterLimit(isPremium, 'question');
  const remainingChars = maxLength - content.length;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);
  
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
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxImages = isPremium ? 4 : 0;
    
    if (!isPremium) {
      setError('画像添付はプレミアム会員限定の機能です');
      return;
    }
    
    if (images.length + files.length > maxImages) {
      setError(`画像は最大${maxImages}枚まで添付できます`);
      return;
    }
    
    const newImages = [...images, ...files];
    const newUrls = [...imageUrls, ...files.map(file => URL.createObjectURL(file))];
    
    setImages(newImages);
    setImageUrls(newUrls);
    setError('');
  };
  
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = imageUrls.filter((_, i) => i !== index);
    
    // Clean up URL
    if (imageUrls[index]) {
      URL.revokeObjectURL(imageUrls[index]);
    }
    
    setImages(newImages);
    setImageUrls(newUrls);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-4">
          <div className="text-4xl">✨</div>
          <h1 className="text-3xl font-bold text-gray-800">
            新しい質問を作成
          </h1>
          <p className="text-gray-600">
            質問を投稿して、みんなの意見を聞いてみましょう
          </p>
        </div>
      
        {error && (
          <Card className="bg-red-50 border-red-200 rounded-2xl">
            <CardContent className="p-4">
              <p className="text-red-600 text-center">❌ {error}</p>
            </CardContent>
          </Card>
      )}
      
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800 flex items-center justify-center gap-2">
              {showPreview ? (
                <><span>📖</span> プレビュー</>
              ) : (
                <><span>✍️</span> 質問を入力</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!showPreview ? (
                <div className="space-y-4">
                  <Label htmlFor="content" className="text-gray-700 font-medium">
                    質問内容
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="例: 私の考えたアプリのアイデアはどう思いますか？詳しく教えてください！"
                    className="min-h-[200px] rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    maxLength={maxLength}
                    required
                  />
                  
                  {/* 画像添付セクション（プレミアム限定） */}
                  {isPremium && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                          <ImageIcon size={18} />
                          画像を添付
                        </Label>
                        <PremiumBadge size="sm" />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`添付画像 ${index + 1}`}
                              className="w-full h-24 object-cover rounded-xl border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        
                        {images.length < 4 && (
                          <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <div className="text-center">
                              <ImageIcon size={20} className="mx-auto text-gray-400 mb-1" />
                              <span className="text-xs text-gray-500">画像を追加</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        📸 最大4枚まで画像を添付できます（プレミアム限定機能）
                      </p>
                    </div>
                  )}
                  
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
                    <p className="leading-relaxed text-gray-800 whitespace-pre-wrap">
                      {content || 'ここに質問内容が表示されます...'}
                    </p>
                    
                    {/* プレビューの画像表示 */}
                    {imageUrls.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {imageUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`添付画像 ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    )}
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

        {/* 広告バナー - 一時的に無効化 */}
        {/* <AdBanner size="medium" position="bottom" isPremium={isPremium} /> */}
        
        {/* ヒント */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <span>💡</span> 良い質問のコツ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📝</span>
                  <span className="font-medium">具体的な内容</span>
                </div>
                <p className="text-sm text-gray-600">
                  背景や状況を簡潔に説明しましょう
                </p>
              </div>
              
              <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎯</span>
                  <span className="font-medium">答えやすい形式</span>
                </div>
                <p className="text-sm text-gray-600">
                  回答者が答えやすい質問にしましょう
                </p>
              </div>
              
              <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👥</span>
                  <span className="font-medium">多角的な視点</span>
                </div>
                <p className="text-sm text-gray-600">
                  複数の観点からの意見を求めましょう
                </p>
              </div>
              
              {isPremium && (
                <div className="p-4 rounded-xl border-2 border-yellow-200 bg-yellow-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📸</span>
                    <span className="font-medium">画像で補足</span>
                    <PremiumBadge size="sm" />
                  </div>
                  <p className="text-sm text-gray-600">
                    画像を使って内容をより伝わりやすく
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 