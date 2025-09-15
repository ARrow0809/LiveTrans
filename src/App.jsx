import React, { useState, useRef } from 'react';
import { Button } from './components/Button.jsx';
import { TextArea } from './components/TextArea.jsx';
import { Card, CardHeader, CardTitle, CardContent } from './components/Card.jsx';
import { SettingsModal } from './components/SettingsModal.jsx';
import { 
  translateWithOpenAI, 
  translateWithDeepL, 
  partialTranslateWithOpenAI, 
  partialTranslateWithDeepL 
} from './utils/translationService.js';
import { apiKeyManager } from './utils/apiKeyManager.js';

function App() {
  const [englishText, setEnglishText] = useState('');
  const [japaneseText, setJapaneseText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  const [originalJapanese, setOriginalJapanese] = useState('');
  const [translationMode, setTranslationMode] = useState('deepl');
  const [showSettings, setShowSettings] = useState(false);
  
  const debounceTimer = useRef(null);

  const translateToJapanese = async () => {
    if (englishText.trim()) {
      setIsTranslating(true);
      setError('');

      try {
        let result;
        if (translationMode === 'deepl') {
          try {
            const apiKey = await apiKeyManager.getApiKey('deepl');
            result = await translateWithDeepL(englishText, 'JA', apiKey);
          } catch (deeplError) {
            console.warn('DeepL translation failed, falling back to OpenAI:', deeplError.message);
            setError('DeepL APIが利用できません。OpenAIで翻訳します。');
            result = await translateWithOpenAI(englishText, 'ja');
          }
        } else if (translationMode === 'openai') {
          result = await translateWithOpenAI(englishText, 'ja');
        }

        setJapaneseText(result);
        setOriginalJapanese(result);
      } catch (error) {
        console.error('Translation error:', error);
        setError(error.message || '翻訳に失敗しました。');
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const updateEnglishFromJapanese = (newJapaneseText) => {
    console.log('🔄 updateEnglishFromJapanese called with:', newJapaneseText);
    setJapaneseText(newJapaneseText);

    if (!newJapaneseText.trim()) {
      setEnglishText('');
      setOriginalJapanese('');
      return;
    }

    // デバウンス処理
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      console.log('⏰ Debounce timer triggered. originalJapanese:', originalJapanese, 'englishText:', englishText, 'newJapaneseText:', newJapaneseText);
      
      try {
        let result;
        
        if (originalJapanese && englishText && originalJapanese !== newJapaneseText) {
          // 部分更新モード
          console.log('🔄 Partial update mode');
          if (translationMode === 'deepl') {
            try {
              const apiKey = await apiKeyManager.getApiKey('deepl');
              result = await partialTranslateWithDeepL(englishText, originalJapanese, newJapaneseText, apiKey);
            } catch (deeplError) {
              console.warn('DeepL partial translation failed, falling back to OpenAI:', deeplError.message);
              result = await partialTranslateWithOpenAI(englishText, originalJapanese, newJapaneseText);
            }
          } else if (translationMode === 'openai') {
            result = await partialTranslateWithOpenAI(englishText, originalJapanese, newJapaneseText);
          }
        } else {
          // 完全翻訳モード
          console.log('🆕 Full translation mode');
          if (translationMode === 'deepl') {
            try {
              const apiKey = await apiKeyManager.getApiKey('deepl');
              result = await translateWithDeepL(newJapaneseText, 'EN', apiKey);
            } catch (deeplError) {
              console.warn('DeepL full translation failed, falling back to OpenAI:', deeplError.message);
              result = await translateWithOpenAI(newJapaneseText, 'en');
            }
          } else if (translationMode === 'openai') {
            result = await translateWithOpenAI(newJapaneseText, 'en');
          }
        }

        console.log('✅ Translation result:', result);
        setEnglishText(result);
        setOriginalJapanese(newJapaneseText);
      } catch (error) {
        console.error('Translation error:', error);
        setError(error.message || '翻訳に失敗しました。');
      }
    }, 500);
  };

  const forceUpdate = () => {
    if (japaneseText.trim()) {
      updateEnglishFromJapanese(japaneseText);
    }
  };

  const clearAll = () => {
    setEnglishText('');
    setJapaneseText('');
    setOriginalJapanese('');
    setError('');
  };

  const getTranslationModeDisplay = () => {
    switch (translationMode) {
      case 'deepl':
        return 'DeepL API';
      case 'openai':
        return 'OpenAI GPT-3.5';
      default:
        return 'OpenAI GPT-3.5';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🌐</span>
            <h1 className="text-3xl font-bold text-gray-800">リアルタイム翻訳ツール</h1>
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="ml-4"
            >
              ⚙️ 設定
            </Button>
          </div>
          <p className="text-gray-600">
            英語を入力して日本語に翻訳し、日本語を編集すると英語がリアルタイムで修正されます
          </p>
          <p className="text-sm text-gray-500 mt-2">
            現在の翻訳モード: <span className="font-semibold">{getTranslationModeDisplay()}</span>
          </p>
        </div>

        {/* 設定モーダル */}
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            translationMode={translationMode}
            setTranslationMode={setTranslationMode}
          />
        )}

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 英語入力エリア */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-blue-600">🇺🇸</span>
                英語（原文）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TextArea
                value={englishText}
                onChange={(e) => setEnglishText(e.target.value)}
                placeholder="英語のテキストを入力してください..."
                className="min-h-[300px] resize-none"
              />
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  onClick={translateToJapanese}
                  disabled={!englishText.trim() || isTranslating}
                  className="flex items-center gap-2"
                >
                  ⇄ {isTranslating ? '翻訳中...' : '日本語に翻訳'}
                </Button>
                <Button
                  onClick={clearAll}
                  variant="outline"
                  disabled={isTranslating}
                >
                  クリア
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 日本語編集エリア */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-red-600">🇯🇵</span>
                日本語（編集可能）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TextArea
                value={japaneseText}
                onChange={(e) => updateEnglishFromJapanese(e.target.value)}
                placeholder="翻訳された日本語がここに表示されます。編集すると英語が自動修正されます..."
                className="min-h-[300px] resize-none"
              />
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  💡 ヒント: 日本語を編集すると、左の英語が自動的に修正されます（500ms後）
                </div>
                <Button
                  onClick={forceUpdate}
                  variant="outline"
                  className="text-sm"
                >
                  🔄 強制更新
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 使い方説明 */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">使い方</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. 「⚙️ 設定」でAPIキーを設定します</p>
              <p>2. 左側に英語のテキストを入力します</p>
              <p>3. 「日本語に翻訳」ボタンをクリックして翻訳します</p>
              <p>4. 右側の日本語を編集すると、左側の英語が自動的に修正されます</p>
              <p>5. 部分的な変更は元の英語の構造を保持しながら修正されます</p>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>翻訳モード:</strong> OpenAI GPT-3.5またはDeepL APIから選択できます。
              どちらも高品質な翻訳を提供します。設定画面でAPIキーを入力してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;