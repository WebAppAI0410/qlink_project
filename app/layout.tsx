import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import { createClient } from '@/utils/supabase/server'
import { getAppUrl } from "@/utils/env-helpers";

const defaultUrl = getAppUrl();

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Qlink - 匿名回答募集プラットフォーム",
  description: "匿名で質問を投稿し、回答を集めることができる回答募集プラットフォーム",
  openGraph: {
    title: "Qlink - 匿名回答募集プラットフォーム",
    description: "匿名で質問を投稿し、回答を集めることができる回答募集プラットフォーム",
    url: defaultUrl,
    siteName: "Qlink",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qlink - 匿名回答募集プラットフォーム",
    description: "匿名で質問を投稿し、回答を集めることができる回答募集プラットフォーム",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return (
    <html lang="ja" className={inter.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col">
            <Header user={user} />
            <div className="flex-1">
              {children}
            </div>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
