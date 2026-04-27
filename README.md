# PC Builder MVP

MVP веб-сервис для подбора комплектующих ПК: аутентификация, конструктор сборки с проверкой совместимости, сохранение конфигураций и анализ апгрейдов.

## Стек
- Backend: `Express.js`
- Шаблонизатор: `EJS`
- Frontend: `Vue 3` (через CDN)
- Database: `MySQL` + `mysql2`
- Dev: `nodemon`
- Tests: `jest`, `supertest`

## Что реализовано
- Регистрация и вход с хешированием паролей (`bcrypt`) и JWT-токенами
- Автоматическое создание БД/таблиц при старте
- Автозаполнение таблицы компонентов seed-данными (CPU, motherboard, RAM, GPU, PSU, storage, cooler)
- Проверки совместимости:
  - CPU socket ↔ motherboard socket
  - RAM type ↔ motherboard RAM type
  - GPU recommended PSU ↔ PSU wattage
  - storage interface ↔ motherboard interface
  - thermal warning (CPU TDP ↔ cooler max TDP)
- Сохранение и загрузка конфигураций пользователя
- Анализ конфигурации и приоритизированные рекомендации апгрейдов

## Быстрый старт
1. Установи и запусти MySQL.
2. Создай `.env` из примера:
   - `copy .env.example .env`
3. Проверь креды MySQL в `.env`.
4. Установи зависимости:
   - `npm install`
5. Запусти проект:
   - `npm run dev`
6. Открой:
   - [http://localhost:3000](http://localhost:3000)

## Роуты страниц
- `/login` — вход
- `/register` — регистрация
- `/builder` — сборка ПК
- `/analyzer` — страница улучшения ПК

## Важно про БД
Если MySQL недоступен, приложение **все равно стартует** в in-memory режиме:
- работают вход/регистрация/сборка/анализ;
- данные хранятся в памяти и очищаются после перезапуска.

## Команды
- `npm run dev` — запуск с `nodemon`
- `npm start` — обычный запуск
- `npm test` — запуск unit-тестов ключевой логики
