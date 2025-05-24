import { NextRequest, NextResponse } from 'next/server';
import { testModerationAPI, checkEnvironmentVariables } from '@/utils/test-moderation';

export async function GET(request: NextRequest) {
  try {
    // 環境変数確認
    console.log('=== 環境変数確認 ===');
    console.log('PERSPECTIVE_API_KEY:', process.env.PERSPECTIVE_API_KEY ? '設定済み' : '未設定');
    
    if (!process.env.PERSPECTIVE_API_KEY) {
      return NextResponse.json({
        error: 'PERSPECTIVE_API_KEY が設定されていません',
        status: 'failed'
      }, { status: 500 });
    }

    // モデレーションテスト実行
    await testModerationAPI();
    
    return NextResponse.json({
      message: 'Perspective API テストが完了しました。コンソールログを確認してください。',
      status: 'success',
      apiKeyConfigured: true
    });

  } catch (error) {
    console.error('テストエラー:', error);
    return NextResponse.json({
      error: 'テスト実行中にエラーが発生しました',
      details: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed'
    }, { status: 500 });
  }
} 