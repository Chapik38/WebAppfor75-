// === Trading Signals App ===

// --- Elements ---
const forexTab = document.getElementById("forexTab");
const otcTab = document.getElementById("otcTab");
const marketTabs = document.querySelectorAll(".market-tab");
const expirationButtons = document.querySelectorAll(".expiration-btn");
const currencyPairSelect = document.getElementById("currencyPair");
const getSignalBtn = document.getElementById("getSignalBtn");
const signalResult = document.getElementById("signalResult");
const signalDirection = document.getElementById("signalDirection");
const confidenceLevel = document.getElementById("confidenceLevel");
const signalPair = document.getElementById("signalPair");
const signalExpiration = document.getElementById("signalExpiration");
const signalTimestamp = document.getElementById("signalTimestamp");
const cooldownContainer = document.getElementById("cooldownContainer");
const cooldownTime = document.getElementById("cooldownTime");

// Language Selector
const languageSelectorBtn = document.getElementById("languageSelectorBtn");
const languageDropdown = document.getElementById("languageDropdown");
const languageOptions = document.querySelectorAll(".language-option");
const currentFlag = document.getElementById("currentFlag");
const currentLanguage = document.getElementById("currentLanguage");

// --- Data ---
const forexPairs = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD",
  "USD/CAD", "NZD/USD", "EUR/GBP", "EUR/JPY", "GBP/JPY",
  "EUR/CHF", "AUD/JPY", "CAD/JPY", "NZD/JPY", "GBP/CHF"
];
const otcPairs = [
  "OTC EUR/USD", "OTC GBP/USD", "OTC USD/JPY", "OTC USD/CHF", "OTC AUD/USD",
  "OTC USD/CAD", "OTC NZD/USD", "OTC EUR/GBP", "OTC EUR/JPY", "OTC GBP/JPY",
  "OTC EUR/CHF", "OTC AUD/JPY", "OTC CAD/JPY", "OTC NZD/JPY", "OTC GBP/CHF"
];

// Language map
// --- Language map ---
const languages = {
  en: {
    title: "Trading Signals",
    subtitle: "Professional trading signals for binary options",
    getSignal: "Get Signal"
  },
  ru: {
    title: "Торговые сигналы",
    subtitle: "Профессиональные торговые сигналы для бинарных опционов",
    getSignal: "Получить сигнал"
  },
  es: {
    title: "Señales de Trading",
    subtitle: "Señales profesionales para opciones binarias",
    getSignal: "Obtener señal"
  },
  de: {
    title: "Handelssignale",
    subtitle: "Professionelle Handelssignale für binäre Optionen",
    getSignal: "Signal erhalten"
  },
  pt: {
    title: "Sinais de Negociação",
    subtitle: "Sinais profissionais para opções binárias",
    getSignal: "Obter sinal"
  },
  hi: {
    title: "ट्रेडिंग संकेत",
    subtitle: "बाइनरी विकल्पों के लिए पेशेवर ट्रेडिंग संकेत",
    getSignal: "सिग्नल प्राप्त करें"
  },
  tr: {
    title: "Ticaret Sinyalleri",
    subtitle: "İkili opsiyonlar için profesyonel ticaret sinyalleri",
    getSignal: "Sinyal Al"
  },
  ar: {
    title: "إشارات التداول",
    subtitle: "إشارات تداول احترافية للخيارات الثنائية",
    getSignal: "الحصول على إشارة"
  },
  uz: {
    title: "Savdo signallari",
    subtitle: "Ikkilik opsionlar uchun professional savdo signallari",
    getSignal: "Signal olish"
  },
  tg: {
    title: "Сигналҳои савдо",
    subtitle: "Сигналҳои касбии савдо барои опсионҳои дуӣ",
    getSignal: "Гирифтани сигнал"
  },
  az: {
    title: "Ticarət siqnalları",
    subtitle: "İkili opsionlar üçün peşəkar ticarət siqnalları",
    getSignal: "Siqnal al"
  },
  am: {
    title: "Առևտրային ազդանշաններ",
    subtitle: "Մասնագիտական ազդանշաններ բինար օպցիաների համար",
    getSignal: "Ստանալ ազդանշան"
  }
};


// Current state
let currentMarket = "forex";
let selectedExpiration = "60"; // default
let cooldownActive = false;
let cooldownDuration = 30; // seconds

// --- Market Tabs ---
marketTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    marketTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentMarket = tab.dataset.market;
    loadCurrencyPairs();
    updateExpirationButtons();
  });
});

// --- Expiration Time ---
expirationButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    expirationButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedExpiration = btn.dataset.time;
  });
});

// --- Load Currency Pairs ---
function loadCurrencyPairs() {
  currencyPairSelect.innerHTML = "";
  const pairs = currentMarket === "forex" ? forexPairs : otcPairs;
  pairs.forEach(pair => {
    const opt = document.createElement("option");
    opt.value = pair;
    opt.textContent = pair;
    currencyPairSelect.appendChild(opt);
  });
}
loadCurrencyPairs();

// --- Update Expiration Buttons ---
function updateExpirationButtons() {
  expirationButtons.forEach(btn => {
    btn.style.display = btn.dataset.market === currentMarket ? "flex" : "none";
  });
  // activate first button of current market
  const firstBtn = document.querySelector(`.expiration-btn[data-market="${currentMarket}"]`);
  if (firstBtn) {
    expirationButtons.forEach(b => b.classList.remove("active"));
    firstBtn.classList.add("active");
    selectedExpiration = firstBtn.dataset.time;
  }
}

// --- Signal Generator ---
getSignalBtn.addEventListener("click", () => {
  if (cooldownActive) return;

  const pair = currencyPairSelect.value;
  const expiration = selectedExpiration;

  // Fake signal direction
  const directions = ["BUY", "SELL"];
  const direction = directions[Math.floor(Math.random() * directions.length)];
  const confidenceValues = ["Low", "Medium", "High"];
  const confidence = confidenceValues[Math.floor(Math.random() * confidenceValues.length)];

  signalPair.textContent = pair;
  signalExpiration.textContent = expiration + "s";
  signalDirection.textContent = direction;
  signalDirection.className = "signal-value signal-direction " + (direction === "BUY" ? "buy" : "sell");
  confidenceLevel.textContent = confidence;
  confidenceLevel.className = "signal-value confidence-" + confidence.toLowerCase();
  signalTimestamp.textContent = new Date().toLocaleTimeString();

  signalResult.classList.add("show");

  startCooldown();
});

// --- Cooldown Timer ---
function startCooldown() {
  cooldownActive = true;
  cooldownContainer.classList.remove("hidden");
  let remaining = cooldownDuration;

  const interval = setInterval(() => {
    const min = String(Math.floor(remaining / 60)).padStart(2, "0");
    const sec = String(remaining % 60).padStart(2, "0");
    cooldownTime.textContent = `${min}:${sec}`;
    remaining--;

    if (remaining < 0) {
      clearInterval(interval);
      cooldownActive = false;
      cooldownContainer.classList.add("hidden");
    }
  }, 1000);
}

// --- Language Selector ---
languageSelectorBtn.addEventListener("click", () => {
  languageDropdown.classList.toggle("show");
  languageSelectorBtn.classList.toggle("active");
});

languageOptions.forEach(option => {
  option.addEventListener("click", () => {
    const lang = option.dataset.lang;
    applyLanguage(lang);
    localStorage.setItem("selectedLang", lang);
    languageDropdown.classList.remove("show");
    languageSelectorBtn.classList.remove("active");
  });
});

// Apply translations
function applyLanguage(lang) {
  if (!languages[lang]) return;

  // Меняем тексты
  document.getElementById("appTitle").textContent = languages[lang].title;
  document.getElementById("appSubtitle").textContent = languages[lang].subtitle;
  document.getElementById("getSignalText").textContent = languages[lang].getSignal;

  // Обновляем название языка
  const opt = document.querySelector(`.language-option[data-lang="${lang}"] .language-name`);
  currentLanguage.textContent = opt ? opt.textContent : lang;

  // Обновляем флаг
  const flag = document.querySelector(`.language-option[data-lang="${lang}"] .flag`);
  if (flag) {
    currentFlag.src = flag.src;
    currentFlag.alt = flag.alt;
  }

  // Убираем active со всех языков
  languageOptions.forEach(option => option.classList.remove("active"));

  // Ставим active на выбранный
  const selectedOption = document.querySelector(`.language-option[data-lang="${lang}"]`);
  if (selectedOption) {
    selectedOption.classList.add("active");
  }
}

// Get readable language name
function optionText(lang) {
  const opt = document.querySelector(`.language-option[data-lang="${lang}"] .language-name`);
  return opt ? opt.textContent : lang;
}

// Restore saved language
const savedLang = localStorage.getItem("selectedLang");
if (savedLang) {
  applyLanguage(savedLang);
}

// Close dropdown if clicked outside
document.addEventListener("click", e => {
  if (!languageSelectorBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
    languageDropdown.classList.remove("show");
    languageSelectorBtn.classList.remove("active");
  }
});

// --- TradingView Chart ---
function loadTradingView() {
  new TradingView.widget({
    container_id: "tradingview_chart",
    autosize: true,
    symbol: "EURUSD",
    interval: "1",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: true,
    save_image: false,
    studies: []
  });
}
loadTradingView();
