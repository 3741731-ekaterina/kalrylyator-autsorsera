# CLAUDE.md — Правила работы с проектом

## Стек и архитектура

- **React 19 + TypeScript 5.8 + Vite 6** — SPA, одна страница
- **Recharts** — только для PieChart (donut) в `BreakdownChart`
- **Нет** UI-библиотек (MUI, Ant Design и пр.) — всё на inline-стилях + custom CSS
- **Нет** Redux/Zustand — стейт только через `useState` в `App.tsx`
- **localStorage** — единственное хранилище (сохранённые расчёты)

## Структура файлов

```
App.tsx                    — главный компонент, всё состояние здесь
types.ts                   — интерфейсы CalculatorInputs, CalculationResult, SavedCalculation
utils/calculations.ts      — чистая функция calculateOutsourcingRate()
components/InputControl.tsx — слайдер + number input + tap-tooltip
components/BreakdownChart.tsx — donut chart + прогресс-бары
index.css                  — все CSS-классы (никаких CSS-модулей)
index.html                 — мета-теги, OG, SVG favicon, шрифт Inter
vite.config.ts             — base path для GitHub Pages
```

## Цветовая система (не менять без необходимости)

| Назначение          | Значение        |
|---------------------|-----------------|
| Основной акцент     | `#5b5ef4`       |
| Акцент светлый      | `#818cf8`       |
| Акцент фиолетовый   | `#a78bfa`       |
| Зелёный (прибыль)   | `#10b981`       |
| Янтарный (нагрузка) | `#f59e0b`       |
| Розовый (прибыль 2) | `#ec4899`       |
| Фон страницы        | `#edf0fb`       |
| Карточки            | `#ffffff`       |
| Текст основной      | `#1e293b`       |
| Текст вторичный     | `#64748b`       |
| Текст плейсхолдер   | `#94a3b8`       |

## Математика (не менять без явного запроса)

```
Price = DirectCosts / (1 - overhead% - profit%)

DirectCosts = workerSalary + smzTax(+6% если включён) + managerSalary + deptHeadSalary
managerSalary = workerSalary × (managerPercent / 100)

pricePerShift = pricePerHour × shiftHours
pricePerMonth = pricePerShift × workDaysPerMonth × workersCount
profitPerMonth = grossProfitPerShift × workDaysPerMonth × workersCount
costPrice = directCosts (себестоимость без наценки)
```

Если `overhead + profit ≥ 100%` — расчёт невозможен (деление на ноль или отрицательное).

## Ключевые UI-правила

### Анимация чисел
Компонент `AnimatedNum` (в `App.tsx`) — `requestAnimationFrame`, ease-out cubic, 380мс. Использовать для всех 6 метрических карточек. Не заменять на CSS-анимацию.

### Валидация параметров
- `overhead + profit ≥ 100%` → красный баннер `.warning-banner` + `isInvalid = true`
- `overhead + profit ≥ 70%` → жёлтый баннер (inline override цвета)
- При `isInvalid`: метрики показывают `—`, кнопка сохранения заблокирована

### Мобильная подсказка (i)
Реализована в `InputControl.tsx` через `useState` + `useEffect`. Клик открывает тултип, автозакрытие через 4 сек или клик вне.

### Сохранённые расчёты
Три кнопки на карточке (справа): сравнение (сетка) → переименование (карандаш) → удаление (корзина). Переименование — inline input с `onBlur`/`Enter`/`Escape`.

### Поделиться ссылкой
URL-параметры: `w, smz, oh, mgr, dh, prf, sh, wc, wd`. Парсятся при монтировании через `new URLSearchParams(window.location.search)`.

### Печать / PDF
`.no-print` скрывает элементы при `@media print`. Скрывается: колонка ввода, кнопки, авторы, лид-магнит, история. Остаются: заголовок, все 6 карточек метрик, детализация.

## Авторы и контакты (не менять)

| Автор                | Telegram                          | Акцент цвет |
|----------------------|-----------------------------------|-------------|
| Екатерина Яхонтова   | https://t.me/yahontova_finance    | `#5b5ef4`   |
| Елена Демина         | https://t.me/elenademina_findoctor | `#a78bfa`  |

Фото: `photo-yahontova.jpg`, `photo-demina.jpg` (в корне проекта).

## Деплой

- GitHub Actions: `.github/workflows/deploy.yml` (в `.gitignore`, нужен PAT с `workflow` scope)
- GitHub Pages URL: `https://3741731-ekaterina.github.io/kalrylyator-autsorsera/`
- Для локальной разработки: `npm run dev`
- Для сборки: `npm run build` → папка `dist/`
- `vite.config.ts`: `base: process.env.GITHUB_ACTIONS ? '/kalrylyator-autsorsera/' : '/'`

## Правила коммитов

- Коммиты на русском языке
- Указывать фазу/категорию в начале: `Фаза 3:`, `Фикс:`, `Дизайн:` и т.д.
- Всегда добавлять `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
- Никогда не коммитить `.env`, `node_modules/`, `.github/`

## Чего избегать

- Не добавлять новые npm-зависимости без явного запроса
- Не переходить на CSS-модули или styled-components — всё через `index.css` + inline
- Не менять формулу расчёта без явного запроса от пользователя
- Не удалять `no-print` классы с элементов
- Не изменять цветовую систему без явного дизайн-решения
- Не добавлять backend — проект полностью статический
