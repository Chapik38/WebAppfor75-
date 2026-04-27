const messageEl = document.getElementById('authMessage');

function showMessage(message, isError) {
  messageEl.textContent = message;
  messageEl.className = `message ${isError ? 'error' : 'ok'}`;
}

async function submit(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    const text = data.error || (data.errors || []).map((e) => e.msg).join(', ') || 'Request failed';
    throw new Error(text);
  }
  return data;
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  try {
    const data = await submit('/api/auth/register', payload);
    localStorage.setItem('token', data.token);
    window.location.href = '/app.html';
  } catch (err) {
    showMessage(err.message, true);
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  try {
    const data = await submit('/api/auth/login', payload);
    localStorage.setItem('token', data.token);
    window.location.href = '/app.html';
  } catch (err) {
    showMessage(err.message, true);
  }
});
