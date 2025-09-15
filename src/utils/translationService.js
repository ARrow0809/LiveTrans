import { apiKeyManager } from './apiKeyManager.js';

// OpenAI翻訳
export async function translateWithOpenAI(text, targetLanguage = 'ja', apiKey = null) {
  try {
    let key = apiKey;
    if (!key) {
      key = await apiKeyManager.getApiKey('openai');
    }
    
    if (!key) {
      throw new Error('OpenAI APIキーが設定されていません');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: targetLanguage === 'ja' 
              ? 'You are a professional translator. Translate the given English text to natural Japanese. Only return the translation, no explanations.'
              : 'You are a professional translator. Translate the given Japanese text to natural English. Only return the translation, no explanations.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// DeepL翻訳（プロキシサーバー経由）
export async function translateWithDeepL(text, targetLanguage = 'JA', apiKey) {
  try {
    if (!apiKey) {
      apiKey = await apiKeyManager.getApiKey('deepl');
    }
    
    if (!apiKey) {
      throw new Error('DeepL APIキーが設定されていません。設定画面で入力してください。');
    }

    // プロキシサーバー経由でDeepL APIを呼び出し
    const response = await fetch('/api/translate/deepl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        target_lang: targetLanguage,
        source_lang: targetLanguage === 'JA' ? 'EN' : 'JA',
        api_key: apiKey
      })
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('DeepL APIキーが無効です');
      } else if (response.status === 456) {
        throw new Error('DeepL APIの使用量制限に達しました');
      } else if (response.status === 404) {
        // プロキシサーバーが利用できない場合はOpenAIにフォールバック
        console.warn('プロキシサーバーが利用できません。OpenAI翻訳にフォールバックします。');
        return await translateWithOpenAI(text, targetLanguage === 'JA' ? 'ja' : 'en');
      } else {
        throw new Error(`DeepL API error: ${response.status}`);
      }
    }

    const data = await response.json();
    return data.translations[0].text;
  } catch (error) {
    console.error('DeepL translation error:', error);
    // ネットワークエラーの場合はOpenAIにフォールバック
    if (error.message.includes('fetch') || error.name === 'TypeError') {
      console.warn('DeepL APIへの接続に失敗しました。OpenAI翻訳にフォールバックします。');
      return await translateWithOpenAI(text, targetLanguage === 'JA' ? 'ja' : 'en');
    }
    throw error;
  }
}

// デモ翻訳機能（簡易的な翻訳例）
async function demoTranslate(text, targetLanguage) {
  // 簡単な遅延を追加してリアルな翻訳体験を演出
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 簡単な辞書ベースの翻訳例
  const translations = {
    'hello': 'こんにちは',
    'world': '世界',
    'good': '良い',
    'morning': '朝',
    'evening': '夕方',
    'night': '夜',
    'thank you': 'ありがとう',
    'please': 'お願いします',
    'yes': 'はい',
    'no': 'いいえ',
    'cat': '猫',
    'dog': '犬',
    'book': '本',
    'water': '水',
    'food': '食べ物',
    'house': '家',
    'car': '車',
    'computer': 'コンピューター',
    'phone': '電話',
    'time': '時間',
    'love': '愛',
    'friend': '友達',
    'family': '家族',
    'work': '仕事',
    'school': '学校',
    'study': '勉強',
    'learn': '学ぶ',
    'teach': '教える',
    'help': '助ける',
    'beautiful': '美しい',
    'happy': '幸せ',
    'sad': '悲しい',
    'angry': '怒っている',
    'tired': '疲れた',
    'hungry': 'お腹が空いた'
  };

  const reverseTranslations = Object.fromEntries(
    Object.entries(translations).map(([en, ja]) => [ja, en])
  );

  if (targetLanguage === 'JA') {
    // 英語から日本語
    let result = text.toLowerCase();
    for (const [en, ja] of Object.entries(translations)) {
      result = result.replace(new RegExp(`\\b${en}\\b`, 'gi'), ja);
    }
    return result === text.toLowerCase() ? `[デモ翻訳] ${text}` : result;
  } else {
    // 日本語から英語
    let result = text;
    for (const [ja, en] of Object.entries(reverseTranslations)) {
      result = result.replace(new RegExp(ja, 'g'), en);
    }
    return result === text ? `[Demo Translation] ${text}` : result;
  }
}

// 部分翻訳（OpenAI）
export async function partialTranslateWithOpenAI(originalEnglish, originalJapanese, newJapanese, apiKey = null) {
  try {
    return await translateWithOpenAI(newJapanese, 'en', apiKey);
  } catch (error) {
    console.error('Partial translation error:', error);
    throw error;
  }
}

// 部分翻訳（DeepL）
export async function partialTranslateWithDeepL(originalEnglish, originalJapanese, newJapanese, apiKey) {
  try {
    return await translateWithDeepL(newJapanese, 'EN', apiKey);
  } catch (error) {
    console.error('DeepL partial translation error:', error);
    throw error;
  }
}