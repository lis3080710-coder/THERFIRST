const menuInput = document.getElementById('menu-input');
const addBtn = document.getElementById('add-btn');
const menuList = document.getElementById('menu-list');
const recommendBtn = document.getElementById('recommend-btn');
const resultOverlay = document.getElementById('result-overlay');
const resultMenu = document.getElementById('result-menu');
const closeBtn = document.getElementById('close-btn');

let menus = JSON.parse(localStorage.getItem('lunch-menus')) || [];

function saveMenus() {
  localStorage.setItem('lunch-menus', JSON.stringify(menus));
  updateUI();
}

function updateUI() {
  menuList.innerHTML = '';
  menus.forEach((menu, index) => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <span>${menu}</span>
      <span class="remove-item" onclick="removeMenu(${index})">✕</span>
    `;
    menuList.appendChild(div);
  });

  recommendBtn.disabled = menus.length === 0;
}

function addMenu() {
  const value = menuInput.value.trim();
  if (value && !menus.includes(value)) {
    menus.push(value);
    menuInput.value = '';
    saveMenus();
  }
}

window.removeMenu = function(index) {
  menus.splice(index, 1);
  saveMenus();
};

addBtn.addEventListener('click', addMenu);
menuInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addMenu();
});

recommendBtn.addEventListener('click', () => {
  if (menus.length === 0) return;
  
  recommendBtn.disabled = true;
  recommendBtn.textContent = '고르는 중...';

  // 애니메이션 효과를 위해 약간의 지연
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * menus.length);
    const picked = menus[randomIndex];
    
    resultMenu.textContent = picked;
    resultOverlay.classList.remove('hidden');
    
    recommendBtn.disabled = false;
    recommendBtn.textContent = '오늘의 메뉴는?';
  }, 800);
});

closeBtn.addEventListener('click', () => {
  resultOverlay.classList.add('hidden');
});

// 초기화
updateUI();
