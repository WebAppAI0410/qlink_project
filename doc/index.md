# Qlink プロジェクト移行ドキュメント

## 概要
このフォルダには、QlinkプロジェクトをFlaskからNext.js+Supabaseに移行するために必要な全ての要件定義ドキュメントが含まれています。

## ドキュメント一覧

### プロジェクト要件
- [要件定義書](./requirements_specification.md) - プロジェクト概要と詳細な要件
- [機能一覧](./feature_list.md) - 実装すべき機能の詳細リスト
- [画面設計書](./screen_design.md) - 各画面のレイアウトと機能の詳細
- [UI設計詳細](./ui_design_details.md) - カラーパレット、タイポグラフィ、コンポーネント仕様

### 技術仕様
- [データベース設計](./database_schema.md) - Supabase/PostgreSQLのスキーマと設定
- [API鍵/環境設定](./api_keys_and_env_setup.md) - 必要なAPI鍵と環境変数の設定ガイド
- [移行計画](./migration_plan.md) - 段階的な移行手順とタイムライン

## 使用方法
これらのドキュメントは、新しい開発環境でQlinkを構築するためのガイドとして使用してください。次の手順に従って進めることを推奨します：

1. 要件定義書と機能一覧で全体像を把握
2. 画面設計書とUI設計詳細で具体的な画面のイメージを理解
3. データベース設計に基づいてSupabaseスキーマを構築
4. API鍵と環境設定を行い、開発環境を準備
5. 移行計画に従って段階的に実装を進める

## 注意事項
- 全てのAPIキーやシークレットは本番環境では適切に管理してください
- Supabaseの無料プランには制限があるため、必要に応じて有料プランへのアップグレードを検討
- 各ドキュメントは開発の進行に合わせて更新する可能性があります