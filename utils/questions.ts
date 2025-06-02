import { createClient } from "@/utils/supabase/server";
import { Question, Answer } from "@/lib/types";

// ユーザーの質問一覧を取得する関数
export async function getUserQuestions(userId: string) {
  const supabase = await createClient();
  
  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      *,
      answers(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("質問一覧取得エラー:", error);
    return [];
  }
  
  // 回答の数を_countプロパティに格納
  return questions.map(question => ({
    ...question,
    _count: {
      answers: question.answers[0].count
    },
    answers: undefined
  })) as Question[];
}

// 質問IDから質問詳細を取得する関数
export async function getQuestionById(id: string) {
  const supabase = await createClient();
  
  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      *,
      profiles:user_id(id, username, display_name, profile_pic_url)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("質問詳細取得エラー:", error);
    return null;
  }
  
  // プロフィール情報をuserプロパティに格納
  return {
    ...question,
    user: question.profiles
  } as Question;
}

// 質問短縮IDから質問詳細を取得する関数
export async function getQuestionByShortId(shortId: string) {
  const supabase = await createClient();
  
  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      *,
      profiles:user_id(id, username, display_name, profile_pic_url)
    `)
    .eq('short_id', shortId)
    .single();
  
  if (error) {
    console.error("短縮IDからの質問詳細取得エラー:", error);
    return null;
  }
  
  // プロフィール情報をuserプロパティに格納
  return {
    ...question,
    user: question.profiles
  } as Question;
}

// 質問に対する回答一覧を取得する関数
export async function getQuestionAnswers(questionId: string) {
  const supabase = await createClient();
  
  const { data: answers, error } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error("回答一覧取得エラー:", error);
    return [];
  }
  
  return answers as Answer[];
}

// 質問を作成する関数
export async function createQuestion(content: string, userId: string) {
  const supabase = await createClient();
  
  const { data: question, error } = await supabase
    .from('questions')
    .insert({
      content,
      user_id: userId
    })
    .select()
    .single();
  
  if (error) {
    console.error("質問作成エラー:", error);
    return null;
  }
  
  return question as Question;
}

// 質問のステータスを変更する関数
export async function updateQuestionStatus(questionId: string, isOpen: boolean) {
  const supabase = await createClient();
  
  const { data: question, error } = await supabase
    .from('questions')
    .update({ is_open: isOpen })
    .eq('id', questionId)
    .select()
    .single();
  
  if (error) {
    console.error("質問ステータス更新エラー:", error);
    return null;
  }
  
  return question as Question;
}

// ベストアンサーを設定する関数
export async function setQuestionBestAnswer(questionId: string, answerId: string) {
  const supabase = await createClient();
  
  const { data: question, error } = await supabase
    .from('questions')
    .update({ best_answer_id: answerId })
    .eq('id', questionId)
    .select()
    .single();
  
  if (error) {
    console.error("ベストアンサー設定エラー:", error);
    return null;
  }
  
  return question as Question;
} 