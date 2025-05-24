'use client';

import { useEffect } from 'react';
import { trackQuestionView } from '@/utils/analytics';

interface ViewTrackerProps {
  questionId: string;
  userId?: string;
  isOwner: boolean;
}

export function ViewTracker({ questionId, userId, isOwner }: ViewTrackerProps) {
  useEffect(() => {
    // 質問の所有者は閲覧数にカウントしない
    if (isOwner) return;

    // 質問の閲覧数を記録
    const recordView = async () => {
      try {
        await trackQuestionView(questionId, undefined, userId);
      } catch (error) {
        // エラーは表示しない（UX を損なわないため）
        console.debug('閲覧数記録エラー:', error);
      }
    };

    recordView();
  }, [questionId, userId, isOwner]);

  // このコンポーネントは何も描画しない
  return null;
} 