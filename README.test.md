# Qlink テスト駆動開発ガイド

## 概要

このプロジェクトは包括的なテスト駆動開発（TDD）環境が構築されています。

## テストスタック

- **Vitest**: 高速なユニット・統合テストランナー
- **React Testing Library**: Reactコンポーネントのテスト
- **Playwright**: E2Eテスト
- **MSW**: APIモッキング
- **GitHub Actions**: CI/CD自動化

## テストの実行

### ユニット・統合テスト

```bash
# テストを実行
npm test

# ウォッチモードで実行
npm run test:watch

# カバレッジレポート付きで実行
npm run test:coverage

# UIモードで実行
npm run test:ui
```

### E2Eテスト

```bash
# E2Eテストを実行
npm run test:e2e

# UIモードで実行
npm run test:e2e:ui
```

### コード品質チェック

```bash
# リンター実行
npm run lint

# フォーマットチェック
npm run format:check

# フォーマット実行
npm run format
```

## テストファイルの構成

```
__tests__/
├── utils/              # ユーティリティ関数のテスト
├── components/         # コンポーネントのテスト
├── integration/        # 統合テスト
└── fixtures/          # テストデータ

e2e/                   # E2Eテスト
test-utils/            # テストユーティリティ
```

## GitHub Actions

以下のワークフローが自動実行されます：

1. **test.yml**: プッシュ・PR時にテスト実行
2. **deploy-preview.yml**: PRにプレビュー環境をデプロイ
3. **codeql-analysis.yml**: セキュリティ分析

## カバレッジ目標

- ユニットテスト: 80%以上
- 統合テスト: 主要フローをカバー
- E2Eテスト: クリティカルパスをカバー

## テスト作成のベストプラクティス

1. **AAA パターン**: Arrange, Act, Assert
2. **単一責任**: 1つのテストで1つの振る舞いをテスト
3. **明確な名前**: テストの目的が分かる名前を付ける
4. **独立性**: テスト間の依存を避ける

## モックとスタブ

- Supabaseクライアント: `test-utils/supabase-mock.ts`
- Next.jsコンポーネント: `vitest.setup.ts`
- 外部API: MSWで設定

## トラブルシューティング

### テストが失敗する場合

1. 依存関係を最新に: `npm install`
2. キャッシュクリア: `rm -rf node_modules .next`
3. Playwrightブラウザ再インストール: `npx playwright install`

### カバレッジが低い場合

1. `npm run test:coverage`でレポート確認
2. `coverage/index.html`をブラウザで開く
3. カバーされていない行を特定してテスト追加