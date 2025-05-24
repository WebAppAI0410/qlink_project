// AI モデレーション機能（Perspective API優先）

interface ModerationResult {
  isAppropriate: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

// Google Perspective APIを使った無料モデレーション
export async function checkContentWithPerspective(content: string): Promise<ModerationResult> {
  try {
    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          languages: ['ja'], // 日本語
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            IDENTITY_ATTACK: {},
            INSULT: {},
            PROFANITY: {},
            THREAT: {}
          },
          comment: { text: content }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Perspective API error: ${response.status}`);
    }

    const data = await response.json();
    const scores = data.attributeScores;
    
    // 最も高いスコアを取得
    const maxScore = Math.max(
      scores.TOXICITY?.summaryScore?.value || 0,
      scores.SEVERE_TOXICITY?.summaryScore?.value || 0,
      scores.IDENTITY_ATTACK?.summaryScore?.value || 0,
      scores.INSULT?.summaryScore?.value || 0,
      scores.PROFANITY?.summaryScore?.value || 0,
      scores.THREAT?.summaryScore?.value || 0
    );

    const isAppropriate = maxScore < 0.7; // 70%未満なら適切
    
    return {
      isAppropriate,
      reason: isAppropriate ? '' : 'AIが不適切な内容と判定しました',
      severity: maxScore > 0.9 ? 'high' : maxScore > 0.7 ? 'medium' : 'low',
      confidence: maxScore // Perspectiveのスコアがそのまま信頼度
    };

  } catch (error) {
    console.error('Perspective API moderation error:', error);
    // フォールバック
    return await checkContentWithKeywords(content);
  }
}

// DeepSeek APIを使った内容チェック
export async function checkContentWithDeepSeek(content: string): Promise<ModerationResult> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `あなたは日本語のコンテンツモデレーターです。以下の基準で回答を分析してください：

1. 不適切な内容の検出：
   - 暴力的な表現
   - 差別的な内容
   - ヘイトスピーチ
   - 個人情報の漏洩
   - スパム
   - 誹謗中傷
   - 性的な内容（過度に不適切なもの）
   - 詐欺や違法行為の推奨

2. 評価結果をJSONで返してください：
{
  "isAppropriate": true/false,
  "reason": "不適切と判断した理由（適切な場合は空文字）",
  "severity": "low/medium/high",
  "confidence": 0.0-1.0の信頼度
}`
          },
          {
            role: 'user',
            content: `以下の内容を分析してください：\n\n${content}`
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('AI response is empty');
    }

    // JSON解析を試行
    try {
      const result = JSON.parse(aiResponse);
      return {
        isAppropriate: result.isAppropriate || false,
        reason: result.reason || '',
        severity: result.severity || 'medium',
        confidence: result.confidence || 0.5
      };
    } catch (parseError) {
      console.error('AI response parse error:', parseError);
      return await checkContentWithKeywords(content);
    }

  } catch (error) {
    console.error('DeepSeek moderation error:', error);
    return await checkContentWithKeywords(content);
  }
}

// キーワードベースのフォールバック機能
export async function checkContentWithKeywords(content: string): Promise<ModerationResult> {
  const inappropriateKeywords = [
    // 暴力的表現
    '殺す', '死ね', '暴力', '殴る', '蹴る',
    // 差別的表現
    '差別', 'バカ', 'アホ', 'クズ', 'ゴミ',
    // 個人情報関連
    '住所', '電話番号', 'メールアドレス', 'パスワード',
    // スパム関連
    '儲かる', '簡単に稼げる', '今すぐ', 'クリック',
    // 不適切な性的内容
    'エロ', 'セックス', 'ポルノ'
  ];

  const warningKeywords = [
    'うざい', 'きもい', 'ブス', 'デブ', '最悪'
  ];

  const normalizedContent = content.toLowerCase();
  
  // 高リスクキーワードチェック
  const highRiskFound = inappropriateKeywords.some(keyword => 
    normalizedContent.includes(keyword)
  );

  if (highRiskFound) {
    return {
      isAppropriate: false,
      reason: '不適切な表現が含まれている可能性があります',
      severity: 'high',
      confidence: 0.8
    };
  }

  // 中リスクキーワードチェック
  const mediumRiskFound = warningKeywords.some(keyword => 
    normalizedContent.includes(keyword)
  );

  if (mediumRiskFound) {
    return {
      isAppropriate: false,
      reason: '攻撃的な表現が含まれている可能性があります',
      severity: 'medium',
      confidence: 0.6
    };
  }

  // 長すぎる回答や極端に短い回答をチェック
  if (content.length < 5) {
    return {
      isAppropriate: false,
      reason: '回答が短すぎます',
      severity: 'low',
      confidence: 0.9
    };
  }

  if (content.length > 5000) {
    return {
      isAppropriate: false,
      reason: '回答が長すぎます',
      severity: 'low',
      confidence: 0.7
    };
  }

  return {
    isAppropriate: true,
    reason: '',
    severity: 'low',
    confidence: 0.9
  };
}

// Hugging Face Transformersを使った代替手法（無料）
export async function checkContentWithHuggingFace(content: string): Promise<ModerationResult> {
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/unitary/toxic-bert',
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ inputs: content }),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    
    // toxic-bertの結果を解析
    const toxicScore = result[0]?.find((item: any) => item.label === 'TOXIC')?.score || 0;
    
    const isAppropriate = toxicScore < 0.7; // 70%以下なら適切と判断
    
    return {
      isAppropriate,
      reason: isAppropriate ? '' : 'AIが不適切な内容と判定しました',
      severity: toxicScore > 0.9 ? 'high' : toxicScore > 0.7 ? 'medium' : 'low',
      confidence: Math.abs(toxicScore - 0.5) * 2 // 0.5から離れるほど信頼度が高い
    };

  } catch (error) {
    console.error('Hugging Face moderation error:', error);
    return await checkContentWithKeywords(content);
  }
}

// メイン関数: Perspective APIを優先使用
export async function moderateContent(content: string): Promise<ModerationResult> {
  // Perspective APIを使用（完全無料、高精度）
  if (process.env.PERSPECTIVE_API_KEY) {
    return await checkContentWithPerspective(content);
  } else {
    // APIキーがない場合はキーワードベースフォールバック
    console.warn('PERSPECTIVE_API_KEY not found, using keyword-based moderation');
    return await checkContentWithKeywords(content);
  }
}

// 自動モデレーション設定
export interface ModerationSettings {
  enabled: boolean;
  autoHide: boolean; // 不適切な内容を自動で非表示にするか
  requireApproval: boolean; // 管理者の承認が必要か
  severityThreshold: 'low' | 'medium' | 'high'; // どのレベルから対応するか
}

// デフォルト設定
export const defaultModerationSettings: ModerationSettings = {
  enabled: true,
  autoHide: true,
  requireApproval: false,
  severityThreshold: 'medium'
}; 