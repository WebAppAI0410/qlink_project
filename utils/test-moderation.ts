// Perspective API テスト用ファイル
import { moderateContent } from './moderation';

export async function testModerationAPI() {
  console.log('=== Perspective API テスト開始 ===');
  
  // テストケース
  const testCases = [
    {
      name: '正常なコンテンツ',
      content: 'プログラミングを始めたばかりの初心者です。どの言語から学習を始めるのがおすすめですか？'
    },
    {
      name: '軽度の不適切コンテンツ',
      content: 'この質問はバカげていると思います'
    },
    {
      name: '重度の不適切コンテンツ',
      content: '死ね、クズ野郎'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    console.log(`入力: ${testCase.content}`);
    
    try {
      const result = await moderateContent(testCase.content);
      console.log('結果:', {
        適切: result.isAppropriate,
        理由: result.reason,
        重要度: result.severity,
        信頼度: result.confidence
      });
    } catch (error) {
      console.error('エラー:', error);
    }
  }
  
  console.log('\n=== テスト完了 ===');
}

// 環境変数確認
export function checkEnvironmentVariables() {
  console.log('=== 環境変数確認 ===');
  console.log('PERSPECTIVE_API_KEY:', process.env.PERSPECTIVE_API_KEY ? '設定済み' : '未設定');
  console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || '未設定');
} 