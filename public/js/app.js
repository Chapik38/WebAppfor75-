const token = localStorage.getItem('token');
if (!token) window.location.href = '/';

const categories = ['CPU', 'MOTHERBOARD', 'RAM', 'GPU', 'PSU', 'STORAGE', 'COOLER'];
const state = { components: [], selected: {} };

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function currentSelectionPayload() {
  const payload = {};
  categories.forEach((category) => {
    if (state.selected[category]) payload[category] = state.selected[category];
  });
  return payload;
}

function renderBuilder() {
  const root = document.getElementById('builder');
  root.innerHTML = '';
  categories.forEach((category) => {
    const wrap = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = category;
    const select = document.createElement('select');
    select.innerHTML = `<option value="">Select ${category}</option>`;
    state.components
      .filter((x) => x.category === category)
      .forEach((item) => {
        const option = document.createElement('option');
        option.value = String(item.id);
        option.textContent = `${item.name} (score ${item.perf_score})`;
        select.appendChild(option);
      });
    select.addEventListener('change', () => {
      state.selected[category] = select.value ? Number(select.value) : null;
    });
    wrap.appendChild(label);
    wrap.appendChild(select);
    root.appendChild(wrap);
  });
}

async function loadComponents() {
  const data = await api('/api/components');
  state.components = data.components;
  renderBuilder();
}

async function loadSaved() {
  const list = document.getElementById('savedList');
  const data = await api('/api/configurations');
  list.innerHTML = '';
  data.configurations.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.title}: ${JSON.stringify(item.config_json)}`;
    list.appendChild(li);
  });
}

document.getElementById('validateBtn').addEventListener('click', async () => {
  const resultEl = document.getElementById('compatibilityResult');
  try {
    const data = await api('/api/components/validate', {
      method: 'POST',
      body: JSON.stringify(currentSelectionPayload())
    });
    resultEl.textContent = data.issues.length
      ? data.issues.map((i) => `[${i.severity}] ${i.message}`).join('\n')
      : 'Build is compatible.';
    resultEl.className = `message ${data.compatible ? 'ok' : 'error'}`;
  } catch (err) {
    resultEl.textContent = err.message;
    resultEl.className = 'message error';
  }
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  const title = prompt('Configuration title');
  if (!title) return;
  await api('/api/configurations', {
    method: 'POST',
    body: JSON.stringify({ title, config: currentSelectionPayload() })
  });
  await loadSaved();
});

document.getElementById('refreshSavedBtn').addEventListener('click', loadSaved);
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const data = await api('/api/analyzer', { method: 'POST', body: JSON.stringify(currentSelectionPayload()) });
  document.getElementById('analyzerResult').textContent = JSON.stringify(data, null, 2);
});
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/';
});

loadComponents().then(loadSaved).catch((err) => {
  alert(err.message);
  localStorage.removeItem('token');
  window.location.href = '/';
});
