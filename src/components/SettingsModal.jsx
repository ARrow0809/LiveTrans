import React, { useState, useEffect } from 'react';
import { apiKeyManager } from '../utils/apiKeyManager.js';

export function SettingsModal({ onClose, translationMode, setTranslationMode }) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [deeplKey, setDeeplKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadKeys = async () => {
      try {
        const openaiApiKey = await apiKeyManager.getApiKey('openai');
        const deeplApiKey = await apiKeyManager.getApiKey('deepl');
        setOpenaiKey(openaiApiKey || '');
        setDeeplKey(deeplApiKey || '');
      } catch (error) {
        console.error('Failed to load API keys:', error);
        setMessage('APIキーの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadKeys();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      await apiKeyManager.setApiKey('openai', openaiKey);
      await apiKeyManager.setApiKey('deepl', deeplKey);
      setMessage('APIキーが保存されました');
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to save API keys:', error);
      setMessage('APIキーの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = async () => {
    if (confirm('すべてのAPIキーをクリアしますか？')) {
      try {
        await apiKeyManager.setApiKey('openai', '');
        await apiKeyManager.setApiKey('deepl', '');
        setOpenaiKey('');
        setDeeplKey('');
        setMessage('APIキーがクリアされました');
      } catch (error) {
        console.error('Failed to clear API keys:', error);
        setMessage('APIキーのクリアに失敗しました');
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="text-center">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">API設定</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI APIキー
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              OpenAI GPT-3.5を使用した翻訳に必要
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DeepL APIキー
            </label>
            <input
              type="password"
              value={deeplKey}
              onChange={(e) => setDeeplKey(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              DeepL翻訳APIを使用するために必要
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('失敗') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              翻訳モード
            </label>
            <select
              value={translationMode}
              onChange={(e) => setTranslationMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="deepl">DeepL API</option>
              <option value="openai">OpenAI GPT-3.5</option>
            </select>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-blue-700">
              🔒 APIキーは安全にローカルストレージに保存されます。
              外部に送信されることはありません。
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-xs text-green-700">
              ✅ 本番環境: DeepL APIはプロキシサーバー経由で動作します。
              プロキシが利用できない場合は自動的にOpenAIにフォールバックします。
            </p>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-red-600 hover:text-red-800 text-sm"
            disabled={saving}
          >
            すべてクリア
          </button>
          
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={saving}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}