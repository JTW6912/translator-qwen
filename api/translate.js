// Vercel Serverless Function: /api/translate
// Key 存在服务端环境变量 AMD_API_KEY，不进前端代码，不进 git。
// 模型短期测试用 Qwen3.8-Flash-Next（AMD 标注 11/11 退役）；长期改 MODEL 即可。
const MODEL = process.env.AMD_MODEL || 'Qwen3.8-Flash-Next';
const AMD_URL = 'https://developer.amd.com.cn/radeon/api/v1/chat/completions';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.AMD_API_KEY;
  if (!apiKey) return res.status(500).json({ error: '服务端未配置 AMD_API_KEY 环境变量' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { text, source = 'auto', target = 'English', model = MODEL } = body || {};
  if (!text || !String(text).trim()) return res.status(400).json({ error: 'text is required' });
  if (String(text).length > 5000) return res.status(400).json({ error: 'text too long (max 5000 chars)' });

  const sys = source === 'auto'
    ? `You are a professional translator. Translate the user text to ${target}. Output ONLY the translation, no explanation, no quotes.`
    : `You are a professional translator. Translate the following ${source} text to ${target}. Output ONLY the translation, no explanation, no quotes.`;

  try {
    const r = await fetch(AMD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      // Qwen3.8-Flash-Next 会先做内部推理，耗不少 token，max_tokens 必须给足，否则正文会被截断
      body: JSON.stringify({ model, messages: [{ role: 'system', content: sys }, { role: 'user', content: text }], max_tokens: 1000, temperature: 0.1 }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || `AMD API error ${r.status}` });
    const translation = (data.choices?.[0]?.message?.content || '').trim();
    if (!translation) return res.status(502).json({ error: 'empty translation from model' });
    return res.status(200).json({ translation, model: data.model || model });
  } catch (e) {
    return res.status(502).json({ error: 'upstream failed: ' + e.message });
  }
};
