import { createClient } from "@/utils/supabase/server";
import { Answer } from "@/lib/types";

// 匿名回答を投稿する関数
export async function createAnonymousAnswer(content: string, questionId: string, ipAddress?: string) {
  const supabase = await createClient();
  
  const { data: answer, error } = await supabase
    .from('answers')
    .insert({
      content,
      question_id: questionId,
      ip_address: ipAddress
    })
    .select()
    .single();
  
  if (error) {
    console.error("回答投稿エラー:", error);
    return null;
  }
  
  return answer as Answer;
}

// 回答の表示/非表示を切り替える関数
export async function toggleAnswerVisibility(answerId: string, isHidden: boolean) {
  const supabase = await createClient();
  
  const { data: answer, error } = await supabase
    .from('answers')
    .update({ is_hidden: isHidden })
    .eq('id', answerId)
    .select()
    .single();
  
  if (error) {
    console.error("回答表示設定エラー:", error);
    return null;
  }
  
  return answer as Answer;
} 