import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

// センシティブ内容を伏せ字にする関数
function sanitizeForOGImage(content: string, isSensitive: boolean): string {
  if (!isSensitive) return content;
  
  // センシティブキーワードを部分的に伏せ字に置換
  const sensitiveWords = [
    'エロ', 'セックス', 'ポルノ', '死ね', '殺す', 'バカ', 'アホ', 'クズ', 'ゴミ',
    'うざい', 'きもい', 'ブス', 'デブ', '最悪'
  ];
  
  let sanitizedContent = content;
  
  sensitiveWords.forEach(word => {
    if (sanitizedContent.includes(word)) {
      // 単語の最初と最後の文字を残して中間を●で置換
      if (word.length <= 2) {
        const replacement = '●'.repeat(word.length);
        sanitizedContent = sanitizedContent.replace(new RegExp(word, 'g'), replacement);
      } else {
        const firstChar = word.charAt(0);
        const lastChar = word.charAt(word.length - 1);
        const middleLength = word.length - 2;
        const replacement = firstChar + '●'.repeat(middleLength) + lastChar;
        sanitizedContent = sanitizedContent.replace(new RegExp(word, 'g'), replacement);
      }
    }
  });
  
  return sanitizedContent;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  try {
    const { shortId } = await params;
    const supabase = await createClient();

    // 質問データを取得（画像URLも含む）
    const { data: question } = await supabase
      .from('questions')
      .select('content, is_sensitive, image_urls')
      .eq('short_id', shortId)
      .single();

    if (!question) {
      // 質問が見つからない場合のデフォルト画像
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f8ff',
              fontSize: 32,
              fontWeight: 400,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div style={{ marginBottom: 20, fontSize: 48 }}>🦉</div>
            <div style={{ color: '#4a90e2' }}>質問が見つかりません</div>
            <div style={{ fontSize: 24, color: '#7bb3f0', marginTop: 10 }}>Qlink</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // 質問文をサニタイズ
    const displayContent = sanitizeForOGImage(question.content, question.is_sensitive || false);
    
    // 文字数に応じてフォントサイズを調整
    const fontSize = displayContent.length > 100 ? 36 : displayContent.length > 50 ? 44 : 52;
    
    // 画像URLがあるかチェック
    const hasImages = question.image_urls && Array.isArray(question.image_urls) && question.image_urls.length > 0;
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#f8fbff',
            border: '12px solid #87ceeb',
            borderRadius: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          {/* 背景の装飾 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 50%, #e6f3ff 100%)',
            borderRadius: '12px',
            zIndex: 0,
          }} />

          {/* 左半分: 画像エリア */}
          {hasImages && (
            <div style={{
              width: '50%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '40px',
              gap: '20px',
            }}>
              {question.image_urls.slice(0, 2).map((imageUrl: string, index: number) => (
                <div key={index} style={{
                  flex: 1,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '3px solid #87ceeb',
                  position: 'relative',
                }}>
                  <img
                    src={imageUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* 右半分: テキストエリア */}
          <div style={{
            width: hasImages ? '50%' : '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            textAlign: 'center',
            position: 'relative',
          }}>
            {/* Qlinkロゴ */}
            <div style={{
              position: 'absolute',
              top: 40,
              left: hasImages ? 40 : 60,
              fontSize: 36,
              fontWeight: 600,
              color: '#4a90e2',
              zIndex: 1,
              textShadow: '2px 2px 4px rgba(74, 144, 226, 0.1)',
            }}>
              Qlink
            </div>

            {/* センシティブ警告アイコン */}
            {question.is_sensitive && (
              <div style={{
                position: 'absolute',
                top: 40,
                right: 40,
                fontSize: 32,
                color: '#ffb347',
                zIndex: 1,
                textShadow: '2px 2px 4px rgba(255, 179, 71, 0.2)',
              }}>
                ⚠️
              </div>
            )}

            {/* 質問文 */}
            <div style={{
              maxWidth: hasImages ? '400px' : '900px',
              color: '#2c5aa0',
              fontSize: hasImages ? Math.max(fontSize - 8, 28) : fontSize,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              wordWrap: 'break-word',
              zIndex: 1,
              textShadow: '1px 1px 2px rgba(44, 90, 160, 0.1)',
              letterSpacing: '0.5px',
              lineHeight: 1.4,
            }}>
              {hasImages && displayContent.length > 80 
                ? `${displayContent.substring(0, 80)}...` 
                : displayContent.length > 150 
                ? `${displayContent.substring(0, 150)}...` 
                : displayContent
              }
            </div>
          </div>

          {/* フクロウマスコット（右下） */}
          <div style={{
            position: 'absolute',
            bottom: 60,
            right: hasImages ? 40 : 80,
            zIndex: 1,
          }}>
            {/* フクロウ */}
            <div style={{
              fontSize: hasImages ? 48 : 64,
              filter: 'drop-shadow(2px 2px 4px rgba(74, 144, 226, 0.2))',
              position: 'relative',
              display: 'flex',
            }}>
              🦉
              {/* 考えている？マーク（フクロウの右上） */}
              <div style={{
                position: 'absolute',
                top: -5,
                right: -10,
                fontSize: hasImages ? 14 : 19,
                color: '#7bb3f0',
                opacity: 0.8,
              }}>
                ？
              </div>
            </div>
          </div>

          {/* フッター */}
          <div style={{
            position: 'absolute',
            bottom: 40,
            left: hasImages ? 40 : 60,
            fontSize: hasImages ? 18 : 22,
            color: '#7bb3f0',
            zIndex: 1,
            textShadow: '1px 1px 2px rgba(123, 179, 240, 0.1)',
          }}>
            匿名回答募集プラットフォーム
          </div>

          {/* 装飾的な要素 */}
          <div style={{
            position: 'absolute',
            top: 120,
            right: 200,
            fontSize: 20,
            color: '#b8d4f0',
            zIndex: 0,
            opacity: 0.3,
          }}>
            ✨
          </div>
          <div style={{
            position: 'absolute',
            bottom: 200,
            left: 100,
            fontSize: 16,
            color: '#b8d4f0',
            zIndex: 0,
            opacity: 0.3,
          }}>
            💫
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    
    // エラー時のフォールバック画像
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff0f0',
            border: '8px solid #ffb3b3',
            borderRadius: '16px',
            fontSize: 32,
            fontWeight: 400,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div style={{ marginBottom: 20, fontSize: 48 }}>⚠️</div>
          <div style={{ color: '#d63384' }}>画像の生成に失敗しました</div>
          <div style={{ fontSize: 24, color: '#f8a5c2', marginTop: 10 }}>Qlink</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
} 