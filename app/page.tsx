import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-12 px-4 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Qlinkへようこそ！
        </h1>
        <p className="max-w-xl mx-auto text-lg text-muted-foreground sm:text-xl">
          匿名で気軽に質問し、みんなの意見を集めましょう。あなたの疑問や興味を共有し、新しい発見があるかもしれません。
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/protected/questions/new">新しい質問を作成する</Link>
      </Button>
    </div>
  );
}
