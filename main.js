// ── 화장품 계절 분류 검색 ───────────────────────────────────────────
const CLASSIFY_URL = '/api/classify'; // API 키는 Firebase Function 서버에서 관리

const cosmeticsForm   = document.getElementById('cosmetics-form');
const cosmeticsInput  = document.getElementById('cosmetics-input');
const cosmeticsResult = document.getElementById('cosmetics-result');
const cosmeticsLoading = document.getElementById('cosmetics-loading');

const SEASON_MAP = {
  봄:  { cls: 'spring', bg: '#fdf2f8', border: '#f9a8d4', text: '#831843' },
  여름: { cls: 'summer', bg: '#eff6ff', border: '#93c5fd', text: '#1e3a8a' },
  가을: { cls: 'autumn', bg: '#fff7ed', border: '#fdba74', text: '#7c2d12' },
  겨울: { cls: 'winter', bg: '#f0f9ff', border: '#7dd3fc', text: '#0c4a6e' },
};

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function detectSeasons(text) {
  return Object.entries(SEASON_MAP)
    .filter(([name]) => text.includes(name))
    .map(([, s]) => s);
}

function pickPrimaryStyle(seasons) {
  return seasons[0] ?? { bg: '#f9fafb', border: '#d1d5db', text: '#374151' };
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

cosmeticsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = cosmeticsInput.value.trim();
  if (!query) return;

  const searchBtn = cosmeticsForm.querySelector('.search-btn');
  searchBtn.disabled = true;
  cosmeticsLoading.classList.remove('hidden');
  cosmeticsResult.classList.add('hidden');

  try {
    const res = await fetch(CLASSIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`[${res.status}] ${errBody || 'API 오류'}`);
    }

    const data = await res.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const seasons = detectSeasons(answer);
    const style = pickPrimaryStyle(seasons);

    const tagsHtml = seasons.length
      ? `<div class="season-tags">${seasons.map(s =>
          `<span class="season-tag ${s.cls}">${Object.keys(SEASON_MAP).find(k => SEASON_MAP[k] === s)}</span>`
        ).join('')}</div>`
      : '';

    cosmeticsResult.style.background   = style.bg;
    cosmeticsResult.style.borderColor  = style.border;
    cosmeticsResult.style.color        = style.text;
    cosmeticsResult.innerHTML = `
      <div class="result-header">"${escapeHtml(query)}" 계절 분류 결과</div>
      ${tagsHtml}
      <div class="result-content">${formatText(escapeHtml(answer))}</div>`;
    cosmeticsResult.classList.remove('hidden');
  } catch (err) {
    cosmeticsResult.style.background  = '#fef2f2';
    cosmeticsResult.style.borderColor = '#fca5a5';
    cosmeticsResult.style.color       = '#991b1b';
    cosmeticsResult.innerHTML = `<p>오류: ${escapeHtml(err.message)}</p>`;
    cosmeticsResult.classList.remove('hidden');
  } finally {
    searchBtn.disabled = false;
    cosmeticsLoading.classList.add('hidden');
  }
});

// ── 로또 번호 추출기 ───────────────────────────────────────────────
const lottoBtn     = document.getElementById('lotto-btn');
const lottoDisplay = document.getElementById('lotto-display');

function getBallColorClass(num) {
  if (num <= 10) return 'ball-1-10';
  if (num <= 20) return 'ball-11-20';
  if (num <= 30) return 'ball-21-30';
  if (num <= 40) return 'ball-31-40';
  return 'ball-41-45';
}

lottoBtn.addEventListener('click', () => {
  const numbers = [];
  while (numbers.length < 6) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  numbers.sort((a, b) => a - b);

  lottoDisplay.innerHTML = '';
  numbers.forEach((num, index) => {
    const ball = document.createElement('div');
    ball.className = `lotto-ball ${getBallColorClass(num)}`;
    ball.textContent = num;
    ball.style.animation = `pop 0.3s ease-out ${index * 0.1}s both`;
    lottoDisplay.appendChild(ball);
  });
});

// 애니메이션을 위한 스타일 추가
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes pop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
`;
document.head.appendChild(styleSheet);

// ── 제휴 문의 폼 ────────────────────────────────────────────────────
const form = document.getElementById('contact-form');
const successMessage = document.getElementById('success-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = '전송 중...';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      form.reset();
      successMessage.classList.remove('hidden');
    } else {
      alert('전송에 실패했습니다. 다시 시도해주세요.');
    }
  } catch {
    alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '문의 보내기';
  }
});
