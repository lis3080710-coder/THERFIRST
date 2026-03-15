const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }

  const query = (body.query || '').trim();
  if (!query) {
    return Response.json({ error: '쿼리가 필요합니다.' }, { status: 400 });
  }

  const apiKey = context.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
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
      return Response.json({ error: 'Gemini API 오류' }, { status: 502 });
    }

    const data = await upstream.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
