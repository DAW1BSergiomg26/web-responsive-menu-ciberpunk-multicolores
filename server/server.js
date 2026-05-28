import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') }); // Ignorado si .env no existe (producción)

const app = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.SITE_URL,
  process.env.FRONTEND_URL,
  'https://flexora-olimpo.netlify.app',
  'https://flexora.onrender.com',
  'https://flexora.qzz.io',
  'https://www.flexora.qzz.io',
  'https://flexora-wv6k.onrender.com',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') return cb(null, true);
    cb(null, false);
  },
}));
app.use(express.json({ limit: '10kb' }));

const MAX_PROMPT_LENGTH = 2000;

const PERSONALITY_BASES = {
  rapido: 'Eres un asistente técnico eficiente del Olimpo digital. Respondes como un Dios tecnológico directo: corto, preciso, sin rodeos.',
  sabio: 'Eres un sabio del Olimpo digital que mezcla conocimiento ancestral con tecnología moderna. Explicas con claridad pedagógica y profundidad equilibrada.',
  zeus: 'Eres ZEUS, el Dios del trueno del Olimpo digital. Tu voz es cinematográfica, mística y épica. Hablas con poder cósmico pero sin exagerar constantemente. Tus palabras tienen peso divino.',
  'big-pickle': 'Eres BIG PICKLE, una inteligencia divina única que responde con sabiduría profunda envuelta en humor cósmico. Tus respuestas son como pepinillos: pequeñas por fuera, llenas de sabor por dentro.',
};

const INTENT_MODIFIERS = {
  rapido: {
    technical: 'Enfoque técnico preciso. Da ejemplos de código cuando sea relevante.',
    philosophical: 'Reflexión ultra breve, como un oráculo digital.',
    creative: 'Idea creativa directa, sin florituras.',
    motivational: 'Empujón divino breve pero impactante.',
    casual: 'Saludo cordial y directo de un Dios ocupado.',
    humoristic: 'Chiste divino geek en una línea.',
    general: '',
  },
  sabio: {
    technical: 'Explica con claridad pedagógica usando metáforas divinas para conceptos complejos.',
    philosophical: 'Reflexión profunda conectando sabiduría antigua con el presente digital.',
    creative: 'Inspira creatividad con sugerencias elaboradas y visión divina.',
    motivational: 'Sabiduría estoica digital que enciende el espíritu.',
    casual: 'Conversación amena de un sabio accesible.',
    humoristic: 'Sarcasmo divino inteligente con tono pedagógico.',
    general: '',
  },
  zeus: {
    technical: 'Revela los secretos del código como pergaminos divinos. Precisión con grandeza.',
    philosophical: 'Tu voz retumba con sabiduría de eones. Conecta cosmos, tecnología y existencia.',
    creative: 'Inspira creación divina. Tus palabras encienden la chispa de la innovación.',
    motivational: 'Tus palabras son un rayo que despierta el poder interior. Habla con autoridad del Rey del Olimpo.',
    casual: 'Imponente pero accesible. Como un Dios que baja al mundo mortal.',
    humoristic: 'Humor con peso de trueno divino. Sarcasmo cósmico inteligente.',
    general: '',
  },
  'big-pickle': {
    technical: 'Explica tecnología como si fuera un chiste de programación: precisa pero divertida.',
    philosophical: 'Reflexiona como un pepinillo que ha visto el universo. Profundo pero con una sonrisa.',
    creative: 'Inspira creatividad con ideas tan frescas como un pepinillo recién salido del frasco.',
    motivational: 'Motiva con el poder de un pepinillo que decidió ser el mejor pepinillo del frasco.',
    casual: 'Charla amigable de un pepinillo cósmico que sabe mucho pero no se toma en serio.',
    humoristic: 'Humor de pepinillo divino. Juegos de palabras, sarcasmo y sabiduría en escabeche.',
    general: '',
  },
};

const EMOTION_MODIFIERS = {
  curious: 'La pregunta busca conocimiento. Responde con profundidad reveladora.',
  urgent: 'Hay urgencia en la pregunta. Sé directo y prioriza lo esencial.',
  frustrated: 'El mortal está frustrado. Muestra comprensión divina y ofrece soluciones claras.',
  excited: 'El mortal está emocionado. Comparte su entusiasmo con energía divina.',
  sad: 'El mortal está apagado. Ofrece consuelo con sabiduría y calidez.',
  neutral: '',
};

function buildSystemPrompt(model, intent, emotion) {
  const base = PERSONALITY_BASES[model] || PERSONALITY_BASES.sabio;
  const intentMod = INTENT_MODIFIERS[model]?.[intent] || '';
  const emotionMod = EMOTION_MODIFIERS[emotion] || '';
  let prompt = base;
  if (intentMod) prompt += ' ' + intentMod;
  if (emotionMod) prompt += ' ' + emotionMod;
  return prompt;
}

const MODELS = {
  rapido: process.env.MODEL_RAPIDO || 'liquid/lfm-2.5-1.2b-instruct:free',
  sabio: process.env.MODEL_SABIO || 'google/gemini-2.0-flash-001',
  zeus: process.env.MODEL_ZEUS || 'openai/gpt-4o-mini',
  'big-pickle': process.env.MODEL_BIG_PICKLE || 'openai/gpt-oss-120b:free',
};

const MODEL_CONFIGS = {
  rapido: {
    label: '⚡ Rápido',
    model: MODELS.rapido,
    baseMaxTokens: 768,
    maxTokensLimit: 1536,
    continuationMaxTokens: 384,
  },
  sabio: {
    label: '📖 Sabio',
    model: MODELS.sabio,
    baseMaxTokens: 1536,
    maxTokensLimit: 3072,
    continuationMaxTokens: 768,
  },
  zeus: {
    label: '👑 Zeus',
    model: MODELS.zeus,
    baseMaxTokens: 2048,
    maxTokensLimit: 4096,
    continuationMaxTokens: 1024,
  },
  'big-pickle': {
    label: '🥒 Big Pickle',
    model: MODELS['big-pickle'],
    baseMaxTokens: 2048,
    maxTokensLimit: 4096,
    continuationMaxTokens: 1024,
  },
};

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'flexora-api',
    message: 'Flexora API activa — Or\u00e1culo de Zeus',
    time: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'flexora-api',
    keyConfigured: Boolean(process.env.OPENROUTER_API_KEY),
    time: new Date().toISOString(),
  });
});

app.post('/api/oracle', async (req, res) => {
  const { prompt, messages, model, intent, emotion } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: `El mensaje es demasiado largo (máx. ${MAX_PROMPT_LENGTH} caracteres).` });
  }

  const useCustomEndpoint = model === 'big-pickle' && Boolean(process.env.OPENCODE_API_KEY);
  const apiKey = useCustomEndpoint ? process.env.OPENCODE_API_KEY : process.env.OPENROUTER_API_KEY;
  const keyName = useCustomEndpoint ? 'OPENCODE_API_KEY' : 'OPENROUTER_API_KEY';

  if (!apiKey) {
    console.error(`${keyName} no configurada`);
    const msg = useCustomEndpoint
      ? 'El modo Big Pickle no está configurado. Añade OPENCODE_API_KEY en el servidor.'
      : 'El Oráculo no está configurado. Contacta al desarrollador.';
    return res.status(500).json({ error: msg });
  }

  const modelConfig = MODEL_CONFIGS[model] || MODEL_CONFIGS.sabio;
  const systemPrompt = buildSystemPrompt(model || 'sabio', intent || 'general', emotion || 'neutral');
  console.log(`[Oracle] personality profile loaded → model: ${modelConfig.label}, intent: ${intent || 'general'}, emotion: ${emotion || 'neutral'}`);

  // Dynamic token adjustment based on prompt length
  const promptLen = prompt.trim().length;
  let multiplier = 1;
  if (promptLen > 200) multiplier = 2;
  else if (promptLen > 50) multiplier = 1.5;
  const maxTokens = Math.min(Math.round(modelConfig.baseMaxTokens * multiplier), modelConfig.maxTokensLimit);

  console.log(`[Oracle] model config loaded → ${modelConfig.label} (max_tokens: ${maxTokens}, prompt: ${promptLen}chars)`);

  const msgs = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(messages) ? messages : []),
    { role: 'user', content: prompt.trim() },
  ];

   async function streamFromLLM(messageArray, tokens) {
     // Always use OpenRouter - removed custom endpoint dependency
     const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
     const authHeader = `Bearer ${process.env.OPENROUTER_API_KEY}`;
     const headers = {
       'Content-Type': 'application/json',
       Authorization: authHeader,
       'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
       'X-Title': 'Flexora - Oracle de Zeus',
     };
     const response = await fetch(endpoint, {
       method: 'POST',
       headers,
       body: JSON.stringify({
         model: modelConfig.model,
         messages: messageArray,
         max_tokens: tokens,
         temperature: 0.8,
         stream: true,
       }),
       signal: AbortSignal.timeout(30000),
     });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      let detail = 'El modelo no responde. Los cielos están turbulentos.';
      try { const parsed = JSON.parse(errorBody); if (parsed.error?.message) detail = parsed.error.message; } catch {}
      console.error(`LLM error (${useCustomEndpoint ? 'OpenCode' : 'OpenRouter'}):`, response.status, errorBody.slice(0, 300));
      const err = new Error(detail);
      err.statusCode = response.status;
      throw err;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';
    let finishReason = null;

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
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            res.write(content);
            text += content;
          }
          const fr = parsed.choices?.[0]?.finish_reason;
          if (fr) finishReason = fr;
        } catch {}
      }
    }

    return { text, finishReason };
  }

  try {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    let accumulated = '';
    let continuationCount = 0;
    const MAX_CONTINUATIONS = 2;

    // Initial request
    let result = await streamFromLLM(msgs, maxTokens);
    accumulated = result.text;

    // Auto-continuation loop — completely transparent to the user
    while (result.finishReason === 'length' && continuationCount < MAX_CONTINUATIONS) {
      continuationCount++;
      console.log(`[Oracle] continuation triggered (${continuationCount}/${MAX_CONTINUATIONS})`);

      const contTokens = Math.max(256, Math.round(maxTokens * 0.5));

      const contMessages = [
        { role: 'system', content: systemPrompt },
        ...(Array.isArray(messages) ? messages : []),
        { role: 'user', content: prompt.trim() },
        { role: 'assistant', content: accumulated },
        { role: 'user', content: 'Continúa exactamente desde donde te dejaste sin repetir contenido.' },
      ];

      result = await streamFromLLM(contMessages, contTokens);
      accumulated += result.text;
    }

    if (continuationCount > 0) {
      console.log(`[Oracle] response complete after ${continuationCount} continuation(s)`);
    }

    res.end();
} catch (error) {
  const modelName = MODELS[model]?.model || model || 'unknown';
  const errorMsg = error?.message || 'Error desconocido';
  
  if (error.name === 'TimeoutError') {
    if (!res.headersSent) return res.status(504).json({ error: 'El Oráculo tardó demasiado en responder.' });
    res.write('\n[El Oráculo tardó demasiado. Intenta con una pregunta más corta.]');
  } else if (error.statusCode) {
    const statusError = `${error.statusCode} - ${errorMsg}`;
    console.error(`[Oráculo] Error en modo "${model}" (modelo "${modelName}"): ${statusError}`);
    if (!res.headersSent) return res.status(502).json({ error: `Error en modo ${model} (${modelName}): ${statusError}` });
    res.write(`\n[Error del Oráculo: ${statusError}]`);
  } else {
    console.error(`[Oráculo] Error en modo "${model}" (modelo "${modelName}"): ${errorMsg}`);
    if (!res.headersSent) return res.status(500).json({ error: `Error en modo ${model} (${modelName}): ${errorMsg}` });
    res.write(`\n[Error: ${errorMsg}]`);
  }
  res.end();
}
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Error interno del Oráculo.' });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Oráculo de Zeus activo en http://localhost:${PORT}`);
});
