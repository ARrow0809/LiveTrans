# リアルタイム翻訳ツール (Web版)

Mac/Windows共通で動作するWebベースの翻訳ツールです。英語を日本語に翻訳し、日本語を編集すると英語がリアルタイムで修正されます。

## 特徴

- 🌐 **クロスプラットフォーム**: Mac、Windows、Linuxで動作
- 🔄 **リアルタイム翻訳**: 日本語を編集すると英語が自動更新
- 🤖 **複数の翻訳エンジン**: OpenAI GPT-3.5とDeepL APIをサポート
- 🔒 **セキュア**: APIキーはローカルストレージに安全に保存
- ⚡ **高速**: Vite + Reactによる高速な開発・ビルド

## セットアップ

### 1. 依存関係のインストール

```bash
cd web-translation-tool
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスします。

### 3. 本番ビルド

```bash
npm run build
```

ビルドされたファイルは `dist` フォルダに出力されます。

### 4. 本番サーバーでの実行

```bash
npm run serve
```

## APIキーの設定

### OpenAI API
1. [OpenAI Platform](https://platform.openai.com/)でアカウントを作成
2. APIキーを生成
3. アプリの「⚙️ 設定」でAPIキーを入力

### DeepL API
1. [DeepL API](https://www.deepl.com/pro-api)でアカウントを作成
2. APIキーを取得
3. アプリの「⚙️ 設定」でAPIキーを入力

## 使い方

1. **設定**: 「⚙️ 設定」ボタンをクリックしてAPIキーを設定
2. **翻訳**: 左側に英語を入力し、「日本語に翻訳」をクリック
3. **編集**: 右側の日本語を編集すると、左側の英語が自動更新
4. **モード選択**: 設定画面でOpenAIまたはDeepLを選択可能

## 技術スタック

- **フロントエンド**: React 18 + Vite
- **スタイリング**: Tailwind CSS
- **翻訳API**: OpenAI GPT-3.5, DeepL API
- **ストレージ**: LocalStorage (APIキー管理)

## ディレクトリ構造

```
web-translation-tool/
├── src/
│   ├── components/          # UIコンポーネント
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── TextArea.jsx
│   │   └── SettingsModal.jsx
│   ├── utils/              # ユーティリティ
│   │   ├── apiKeyManager.js
│   │   └── translationService.js
│   ├── App.jsx             # メインアプリ
│   ├── main.jsx           # エントリーポイント
│   └── index.css          # グローバルスタイル
├── public/                # 静的ファイル
├── dist/                  # ビルド出力
└── package.json
```

## デプロイ

### 静的ホスティング
ビルドした `dist` フォルダを以下のサービスにデプロイできます：
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### 環境変数
本番環境では以下の環境変数を設定できます：
- `VITE_OPENAI_API_KEY`: OpenAI APIキー
- `VITE_DEEPL_API_KEY`: DeepL APIキー

## セキュリティ

- APIキーはローカルストレージに保存され、外部に送信されません
- HTTPS経由でのみAPIにアクセス
- APIキーは暗号化されて保存

## ライセンス

MIT License

## サポート

問題や質問がある場合は、GitHubのIssuesでお知らせください。