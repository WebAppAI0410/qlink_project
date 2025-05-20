import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Dashboard() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">マイ質問一覧</h1>
        <Button asChild>
          <Link href="/questions/new">新しい質問を作成</Link>
        </Button>
      </div>
      
      {questions && questions.length > 0 ? (
        <div className="grid gap-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <Link href={`/questions/${question.id}`} className="block space-y-2">
                <p className="font-medium line-clamp-2">{question.content}</p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {question.is_open ? '回答受付中' : '締め切り済み'}
                  </span>
                  <span>
                    {new Date(question.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">まだ質問がありません</p>
          <Button asChild>
            <Link href="/questions/new">最初の質問を作成する</Link>
          </Button>
        </div>
      )}
    </div>
  )
} 