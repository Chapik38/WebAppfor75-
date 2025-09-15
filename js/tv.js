// === TradingView Chart Setup ===
window.addEventListener("load", () => {
  if (typeof TradingView === "undefined") {
    console.error("TradingView library not loaded!");
    return;
  }

  // Создание виджета TradingView
  new TradingView.widget({
    container_id: "tradingview_chart", // id контейнера из index.html
    autosize: true,                    // автоматическая подстройка
    symbol: "EURUSD",                  // валютная пара по умолчанию
    interval: "1",                     // таймфрейм: 1 минута
    timezone: "Etc/UTC",               // часовой пояс
    theme: "dark",                     // тёмная тема
    style: "1",                        // тип графика (1 = свечи)
    locale: "en",                      // язык интерфейса
    hide_side_toolbar: false,          // боковая панель
    hide_top_toolbar: false,           // верхняя панель
    hide_legend: true,                 // скрыть легенду
    enable_publishing: false,          // запрет публикации
    allow_symbol_change: true,         // разрешить смену инструмента
    save_image: false,                 // без кнопки сохранения
    studies: []                        // индикаторы (можно добавить EMA, RSI и др.)
  });
});
