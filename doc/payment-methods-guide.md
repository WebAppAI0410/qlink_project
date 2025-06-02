# Qlink 決済方法実装ガイド

## 📋 実装済み決済方法

### 1. **Stripe決済**
- **クレジットカード**: Visa、Mastercard、JCB、American Express
- **コンビニ決済**: セブン-イレブン、ローソン、ファミリーマート等
- **自動更新**: クレジットカードのみ対応
- **単発決済**: コンビニ決済

### 2. **決済フロー**

#### クレジットカード決済
1. プレミアムページで「クレジットカード」を選択
2. プランを選択して「今すぐ始める」をクリック
3. Stripe Checkoutページでカード情報を入力
4. 決済完了後、即座にプレミアム機能が有効化

#### コンビニ決済
1. プレミアムページで「コンビニ決済」を選択
2. プランを選択して「今すぐ始める」をクリック
3. Stripe Checkoutページで支払い用番号を取得
4. 3日以内にコンビニで支払い
5. 支払い確認後、プレミアム機能が有効化

## 🏪 コンビニ決済対応店舗

### Stripe Konbini対応
- **セブン-イレブン**
- **ローソン**
- **ファミリーマート**
- **ミニストップ**
- **デイリーヤマザキ**
- **セイコーマート**

### 支払い方法
1. レジで「インターネット代金支払い」を選択
2. 支払い番号を入力
3. 現金で支払い

## 💰 代引き決済について

### 現在の状況
- **デジタルサービス**: 代引き決済は適用不可
- **物理商品**: 将来的に実装可能

### 代引き決済実装方法（物理商品向け）

#### 1. 配送業者との連携
```javascript
// 代引き決済の例（ヤマト運輸 B2クラウド）
const createCODOrder = async (orderData) => {
  const response = await fetch('https://b2c.kuronekoyamato.co.jp/api/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.YAMATO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      delivery_type: 'cod', // 代引き
      cod_amount: orderData.amount,
      recipient: orderData.recipient,
      items: orderData.items,
    }),
  });
  
  return response.json();
};
```

#### 2. 必要な情報
- **配送先住所**
- **受取人情報**
- **商品詳細**
- **代引き手数料**

#### 3. 代引き手数料
| 代引き金額 | 手数料（税込） |
|-----------|---------------|
| 1万円未満 | 330円 |
| 1万円以上3万円未満 | 440円 |
| 3万円以上10万円未満 | 660円 |
| 10万円以上30万円未満 | 1,100円 |

## 🔧 環境変数設定

### Stripe設定
```env
# .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 配送業者API設定（代引き用）
```env
# ヤマト運輸
YAMATO_API_KEY=your_yamato_api_key
YAMATO_CUSTOMER_CODE=your_customer_code

# 佐川急便
SAGAWA_API_KEY=your_sagawa_api_key
SAGAWA_CUSTOMER_CODE=your_customer_code
```

## 📊 決済方法別の特徴

| 決済方法 | 即時利用 | 自動更新 | 手数料 | 対象 |
|---------|---------|---------|--------|------|
| クレジットカード | ✅ | ✅ | 3.6% | デジタル |
| コンビニ決済 | ❌ | ❌ | 3.6% | デジタル |
| 代引き | ❌ | ❌ | 330円〜 | 物理商品 |

## 🚀 今後の拡張予定

### 1. 追加決済方法
- **PayPay**
- **楽天ペイ**
- **LINE Pay**
- **銀行振込**

### 2. 物理商品対応
- **代引き決済**
- **配送追跡**
- **返品・交換**

### 3. 企業向け
- **請求書払い**
- **銀行振込**
- **掛け払い**

## 📞 サポート

決済に関するお問い合わせは以下まで：
- **メール**: support@qlink.example.com
- **電話**: 03-1234-5678（平日10:00-18:00） 