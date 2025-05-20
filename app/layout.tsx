import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import AuthButton from "@/components/auth-button";
import Link from "next/link";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Qlink - 匿名Q&Aプラットフォーム",
  description: "匿名で質問を投稿し、回答を集めることができるQ&Aプラットフォーム",
  openGraph: {
    title: "Qlink - 匿名Q&Aプラットフォーム",
    description: "匿名で質問を投稿し、回答を集めることができるQ&Aプラットフォーム",
    url: defaultUrl,
    siteName: "Qlink",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qlink - 匿名Q&Aプラットフォーム",
    description: "匿名で質問を投稿し、回答を集めることができるQ&Aプラットフォーム",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
              <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
                <Link href="/" className="font-bold text-xl">
                  Qlink
                </Link>
                <AuthButton />
              </div>
            </nav>
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
