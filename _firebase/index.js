const functions = require('firebase-functions');

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

exports.classifyCosmetics = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const query = (req.body && req.body.query || '').trim();
  if (!query) {
    res.status(400).json({ error: '쿼리가 필요합니다.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
    return;
  }

  const prompt = `당신은 화장품 계절 분류 전문가입니다. 아래 화장품을 분석해 계절 적합성을 알려주세요.

화장품: ${query}

다음 항목을 한국어로 간결하게 답변해주세요.
🌸 적합 계절: (봄/여름/가을/겨울 중 해당하는 계절 모두 표기)
📋 분류 이유: (2~3문장)
💡 성분 특성: (1~2문장)
✨ 사용 팁: (1~2문장)
⚠️ 주의사항: (1~2문장)`;

  try {
    const upstream = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!upstream.ok) {
      res.status(502).json({ error: 'Gemini API 오류' });
      return;
    }

    const data = await upstream.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});
