import { createClient } from '@/utils/supabase/client';

// 質問の閲覧数を記録する関数
export async function trackQuestionView(questionId: string, userIp?: string, userId?: string) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('question_views')
      .insert({
        question_id: questionId,
        viewer_ip: userIp,
        viewer_user_id: userId
      });
    
    if (error) {
      console.error('質問閲覧数の記録エラー:', error);
    }
  } catch (error) {
    console.error('質問閲覧数の記録エラー:', error);
  }
}

// ユーザーの質問統計を取得する関数
export async function getUserQuestionAnalytics(userId: string) {
  const supabase = createClient();
  
  try {
    // ユーザーの質問一覧と基本統計
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        content,
        created_at,
        is_open,
        view_count,
        answers:answers(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (questionsError) throw questionsError;
    
    // 全体統計の計算
    const totalQuestions = questions?.length || 0;
    const totalViews = questions?.reduce((sum, q) => sum + (q.view_count || 0), 0) || 0;
    const totalAnswers = questions?.reduce((sum, q) => sum + (q.answers?.[0]?.count || 0), 0) || 0;
    const averageViewsPerQuestion = totalQuestions > 0 ? Math.round(totalViews / totalQuestions) : 0;
    const averageAnswersPerQuestion = totalQuestions > 0 ? Math.round(totalAnswers / totalQuestions * 10) / 10 : 0;
    
    return {
      questions: questions || [],
      stats: {
        totalQuestions,
        totalViews,
        totalAnswers,
        averageViewsPerQuestion,
        averageAnswersPerQuestion
      }
    };
  } catch (error) {
    console.error('ユーザー質問統計の取得エラー:', error);
    throw error;
  }
}

// 質問の詳細アナリティクスを取得する関数（プレミアム機能）
export async function getQuestionDetailedAnalytics(questionId: string, userId: string) {
  const supabase = createClient();
  
  try {
    // 質問の詳細情報
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select(`
        id,
        content,
        created_at,
        is_open,
        view_count,
        answers:answers(count)
      `)
      .eq('id', questionId)
      .eq('user_id', userId)
      .single();
    
    if (questionError) throw questionError;
    
    // 閲覧データの時系列分析（過去30日）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: viewHistory, error: viewHistoryError } = await supabase
      .from('question_views')
      .select('viewed_at')
      .eq('question_id', questionId)
      .gte('viewed_at', thirtyDaysAgo.toISOString())
      .order('viewed_at', { ascending: true });
    
    if (viewHistoryError) throw viewHistoryError;
    
    // 日別閲覧数の集計
    const dailyViews = viewHistory?.reduce((acc: Record<string, number>, view) => {
      const date = new Date(view.viewed_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};
    
    return {
      question,
      dailyViews,
      totalRecentViews: viewHistory?.length || 0
    };
  } catch (error) {
    console.error('質問詳細アナリティクスの取得エラー:', error);
    throw error;
  }
} 