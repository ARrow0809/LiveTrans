class ApiKeyManager {
  constructor() {
    this.keys = new Map();
    this.loadKeysFromStorage();
  }

  loadKeysFromStorage() {
    try {
      const stored = localStorage.getItem('translation_api_keys');
      if (stored) {
        const keys = JSON.parse(stored);
        Object.entries(keys).forEach(([service, key]) => {
          this.keys.set(service, key);
        });
      }
    } catch (error) {
      console.warn('Failed to load API keys from storage:', error);
    }
  }

  saveKeysToStorage() {
    try {
      const keysObject = Object.fromEntries(this.keys);
      localStorage.setItem('translation_api_keys', JSON.stringify(keysObject));
    } catch (error) {
      console.error('Failed to save API keys to storage:', error);
    }
  }

  async setApiKey(service, key) {
    if (!key || key.trim() === '') {
      this.keys.delete(service);
    } else {
      const trimmedKey = key.trim();
      this.keys.set(service, trimmedKey);
    }
    this.saveKeysToStorage();
  }

  async getApiKey(service) {
    const key = this.keys.get(service);
    if (key) {
      return key;
    }

    // フォールバック: 環境変数から取得
    const envKeys = {
      openai: 'VITE_OPENAI_API_KEY',
      deepl: 'VITE_DEEPL_API_KEY'
    };

    const envKey = envKeys[service];
    if (envKey && import.meta.env[envKey]) {
      return import.meta.env[envKey];
    }

    return null;
  }

  hasApiKey(service) {
    return !!this.getApiKey(service);
  }

  clearAllKeys() {
    this.keys.clear();
    localStorage.removeItem('translation_api_keys');
  }

  getConfiguredServices() {
    const services = [];
    if (this.hasApiKey('openai')) services.push('openai');
    if (this.hasApiKey('deepl')) services.push('deepl');
    services.push('demo'); // デモモードは常に利用可能
    return services;
  }
}

export const apiKeyManager = new ApiKeyManager();
export const getApiKey = (service) => apiKeyManager.getApiKey(service);