// Ma'lumotlarni yuklash
function getStorageData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Xatolik "${key}" ma'lumotlarini o'qishda:`, e);
    return [];
  }
}

// Ma'lumotlarni saqlash
function saveStorageData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Xatolik "${key}" ma'lumotlarini saqlashda:`, e);
  }
}

// Dastur holatlari
let users = getStorageData('users');
let currentUser = null;
let currentMonth = new Date().getMonth() + 1;

// DOM yuklanganda
document.addEventListener('DOMContentLoaded', function () {
  showLogin();
});

// Formalar orasidagi o'tish
function showLogin() {
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('registerBox').style.display = 'none';
}

function showRegister() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('registerBox').style.display = 'block';
}

// Registratsiya
function register() {
  const id = document.getElementById('regId').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pw = document.getElementById('regPw').value.trim();

  if (!id || !email || !pw) {
    alert('Barcha maydonlarni to‘ldiring!');
    return;
  }

  if (users.some(u => u.id === id)) {
    alert('Bu ID band!');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Email noto‘g‘ri!');
    return;
  }

  const newUser = { id, email, pw };
  users.push(newUser);
  saveStorageData('users', users);
  console.log('Saqlangan foydalanuvchilar:', users);

  alert('Ro‘yxatdan o‘tish muvaffaqiyatli!');
  showLogin();
}


// Kirish
function login() {
  const id = document.getElementById('loginId').value.trim();
  const pw = document.getElementById('loginPw').value.trim();

  const user = users.find(u => u.id === id && u.pw === pw);
  if (!user) {
    alert('ID yoki parol noto\'g\'ri!');
    return;
  }

  currentUser = id;
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('mainContainer').style.display = 'block';
  loadMonthOptions();
  loadMonthData();
}

// Chiqish
function logout() {
  currentUser = null;
  document.getElementById('mainContainer').style.display = 'none';
  document.getElementById('authContainer').style.display = 'flex';
  showLogin();
}

// Oylarni yuklash
function loadMonthOptions() {
  const select = document.getElementById('monthSelector');
  select.innerHTML = '';

  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = month;
    if (index + 1 === currentMonth) option.selected = true;
    select.appendChild(option);
  });
}

// Jadval ma'lumotlarini yuklash
function loadMonthData() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) {
    console.error('Jadval tana qismi topilmadi!');
    return;
  }

  tableBody.innerHTML = '';
  const data = getStorageData(`data_${currentMonth}`);
  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() + 1;

  // Mavjud ma'lumotlarni chiqarish
  data.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${row.date || ''}</td>
      <td ${row.author === currentUser ? 'contenteditable="true"' : ''}>${row.plan || ''}</td>
      <td ${row.author === currentUser ? 'contenteditable="true"' : ''}>${row.note || ''}</td>
    `;
    tableBody.appendChild(tr);

    // Tahrirlash imkoniyati
    if (row.author === currentUser) {
      tr.querySelectorAll('[contenteditable="true"]').forEach((cell, i) => {
        cell.addEventListener('input', () => {
          if (i === 0) row.plan = cell.textContent;
          if (i === 1) row.note = cell.textContent;
          saveStorageData(`data_${currentMonth}`, data);
        });
      });
    }
  });

  // Joriy oy uchun yangi qator qo'shish
  if (isCurrentMonth) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.length + 1}</td>
      <td>${today.toLocaleDateString()} ${today.toLocaleTimeString().slice(0, 5)}</td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
    `;

    tr.querySelectorAll('[contenteditable="true"]').forEach((cell, i) => {
      cell.addEventListener('input', () => {
        const plan = tr.cells[2].textContent.trim();
        const note = tr.cells[3].textContent.trim();

        if (plan && note) {
          data.push({
            date: tr.cells[1].textContent,
            plan,
            note,
            author: currentUser
          });
          saveStorageData(`data_${currentMonth}`, data);
          loadMonthData(); // Yangilash
        }
      });
    });

    tableBody.appendChild(tr);
  }
}

// Oyni o'zgartirish
function changeMonth() {
  currentMonth = parseInt(document.getElementById('monthSelector').value);
  loadMonthData();
}