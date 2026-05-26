import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10kb' }));

const SYSTEM_PROMPT = 'Eres Zeus en el año 3000. Respondes de forma épica, cyberpunk, mitológica y breve. Mezclas sabiduría divina con términos tecnológicos. Hablas como un Dios digital.';
const MAX_PROMPT_LENGTH = 2000;

app.post('/api/oracle', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: `El mensaje es demasiado largo (máx. ${MAX_PROMPT_LENGTH} caracteres).` });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY no configurada en server/.env');
    return res.status(500).json({ error: 'El Oráculo no está configurado. Contacta al desarrollador.' });
  }

  try {
    const openrouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Flexora - Oracle de Zeus',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt.trim() },
        ],
        stream: true,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!openrouterRes.ok) {
      const errorBody = await openrouterRes.text().catch(() => '');
      console.error('OpenRouter error:', openrouterRes.status, errorBody.slice(0, 300));
      return res.status(502).json({ error: 'El Oráculo no responde. Los cielos están turbulentos.' });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    const reader = openrouterRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) res.write(content);
        } catch {}
      }
    }
    res.end();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      if (!res.headersSent) return res.status(504).json({ error: 'El Oráculo tardó demasiado en responder.' });
    }
    console.error('Oracle error:', error.message);
    if (!res.headersSent) return res.status(500).json({ error: 'El rayo de Zeus ha fallado. Intenta de nuevo.' });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Oráculo de Zeus activo en http://localhost:${PORT}`);
});
