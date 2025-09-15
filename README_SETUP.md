# 本番用セットアップガイド

## 開発環境での実行

### 1. 依存関係のインストール
```bash
npm install
```

### 2. プロキシサーバーと開発サーバーの同時起動
```bash
npm run dev:full
```

または、別々のターミナルで実行：

**ターミナル1（プロキシサーバー）:**
```bash
npm run dev:proxy
```

**ターミナル2（フロントエンド）:**
```bash
npm run dev
```

### 3. APIキーの設定
1. ブラウザで `http://localhost:3000` にアクセス
2. 「⚙️ 設定」ボタンをクリック
3. DeepL APIキーまたはOpenAI APIキーを入力
4. 翻訳モードを選択

## 本番環境でのデプロイ

### Vercel（推奨）
1. プロジェクトをGitHubにプッシュ
2. Vercelでプロジェクトをインポート
3. `api/translate/deepl.js` が自動的にサーバーレス関数として動作

### その他のプラットフォーム
- Netlify Functions
- AWS Lambda
- 独自のExpressサーバー

## 注意事項

- DeepL APIは直接ブラウザから呼び出すとCORS制限があるため、プロキシサーバーが必要です
- プロキシサーバーが利用できない場合、自動的にOpenAI翻訳にフォールバックします
- APIキーはローカルストレージに安全に保存されます

## トラブルシューティング

### プロキシサーバーが起動しない場合
```bash
# 依存関係を再インストール
npm install

# ポート3001が使用中の場合、プロセスを終了
lsof -ti:3001 | xargs kill -9
```

### DeepL APIが動作しない場合
1. APIキーが正しく設定されているか確認
2. プロキシサーバーが起動しているか確認（http://localhost:3001）
3. 自動的にOpenAI翻訳にフォールバックするため、OpenAI APIキーを設定