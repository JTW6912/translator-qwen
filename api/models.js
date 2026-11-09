// Vercel Serverless Function: GET /api/models
// 服务端实时从 AMD 取可用模型列表，只返回适合翻译的文本模型，
// 前端用它来填充模型选择器，不用每次手动维护。
const AMD_MODELS_URL = 'https://developer.amd.com.cn/radeon/api/v1/models';
const TRANSLATION_MODELS = [
  'Qwen3.8-Flash-Next',
  'DeepSeek-V4.1-Flash',
  'GLM-5.3-Flash',
  'MiMo-V2.6-Flash',
  'DeepSeek-V4-Flash',
  'Qwen3.8-27B',
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const apiKey = process.env.AMD_API_KEY;
  if (!apiKey) return res.status(200).json({ models: TRANSLATION_MODELS, live: false });
  try {
    const r = await fetch(AMD_MODELS_URL, { headers: { Authorization: `Bearer ${apiKey}` } });
    const data = await r.json().catch(() => ({}));
    const live = (data.data || []).map(m => m.id).filter(id => TRANSLATION_MODELS.includes(id));
    return res.status(200).json({ models: live.length ? live : TRANSLATION_MODELS, live: live.length > 0 });
  } catch {
    return res.status(200).json({ models: TRANSLATION_MODELS, live: false });
  }
};
