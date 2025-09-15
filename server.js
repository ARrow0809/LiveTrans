// Express.js proxy server for development
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// DeepL API proxy endpoint
app.post('/api/translate/deepl', async (req, res) => {
  try {
    const { text, target_lang, source_lang, api_key } = req.body;

    if (!text || !target_lang || !api_key) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log('Proxying DeepL request:', { text: text.substring(0, 50) + '...', target_lang, source_lang });

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${api_key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: text,
        target_lang: target_lang,
        source_lang: source_lang || 'auto'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepL API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `DeepL API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('DeepL response received successfully');
    res.json(data);

  } catch (error) {
    console.error('Proxy server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`DeepL proxy available at: http://localhost:${PORT}/api/translate/deepl`);
});