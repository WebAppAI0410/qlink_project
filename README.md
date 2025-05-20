# Qlink - 匿名Q&Aプラットフォーム

Qlinkは、匿名で質問を投稿し、回答を集めることができるQ&Aプラットフォームです。

## 機能

- ユーザー認証 (メール/パスワード、Google認証)
- プロフィール設定
- 匿名質問の作成と管理
- 匿名回答の投稿
- ベストアンサーの選定
- レスポンシブデザイン

## 技術スタック

- [Next.js 15](https://nextjs.org/) - Reactフレームワーク
- [Supabase](https://supabase.com/) - バックエンド (認証、データベース、ストレージ)
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [shadcn/ui](https://ui.shadcn.com/) - UIコンポーネント

## ローカル開発

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/qlink.git
cd qlink
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定

`.env.local`ファイルを作成し、以下の内容を設定します：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## Supabase設定

1. [Supabaseダッシュボード](https://app.supabase.com/) でプロジェクトを作成
2. 認証設定で以下のプロバイダーを有効化:
   - Email/Password
   - Google OAuth
3. Google OAuth設定:
   - Google Cloud ConsoleでOAuthクライアントを作成
   - リダイレクトURLを設定: `https://your-project-id.supabase.co/auth/v1/callback`

## デプロイ

このプロジェクトは[Vercel](https://vercel.com/)にデプロイすることを推奨します。

```bash
npm run build
```

## ライセンス

MIT
