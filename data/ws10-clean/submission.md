# Здача WS10

## Дані

- Роль: dev
- Команда: school-purchasing
- GitHub-логін: dev-example
- Ваше репо: https://github.com/dev-example/school-purchasing
- SHA: 6a1cec45eaf37b34e1b1d89130d7746fe4006346
- Репо вимог PM: https://github.com/pm-example/school-purchasing-spec
- Прод-URL: https://school-purchasing.example.test

## Розробник

### D0 — умова прийняття

- `/api/health`: https://school-purchasing.example.test/api/health — `"db":"ok"`, sha `6a1cec45eaf37b34e1b1d89130d7746fe4006346`
- Зелений прогін `smoke` на `main`: https://github.com/dev-example/school-purchasing/actions/runs/1000000001
- Ролі тестових акаунтів: requester — requester1@example.test; approver — approver1@example.test

### Спека зрізу 4 (трек A)

- `/requirements-sync` — PR «Оновлення вимог»: https://github.com/dev-example/school-purchasing/pull/41
- Golden cases PM: https://github.com/dev-example/school-purchasing/blob/6a1cec45eaf37b34e1b1d89130d7746fe4006346/tests/fixtures/golden/cases.json
- Питання PM: https://github.com/pm-example/school-purchasing-spec/issues/12

### AI-функція (трек B)

- Ланцюжок моделей: https://github.com/dev-example/school-purchasing/blob/6a1cec45eaf37b34e1b1d89130d7746fe4006346/src/lib/ai/models.ts
- PR задач «Реалізація»: https://github.com/dev-example/school-purchasing/pull/44

### Evals (трек C)

- Звіт живого eval: https://github.com/dev-example/school-purchasing/blob/6a1cec45eaf37b34e1b1d89130d7746fe4006346/evals/reports/2026-11-15.md — 9 з 10, GC-04 FAIL
- Пояснення FAIL і NOT RUN: GC-04 FAIL — модель повернула ціну без копійок; правило коду додано, повторний прогін ✅

### Прод, UAT і приймання PM (трек D)

- UAT на проді: https://github.com/dev-example/school-purchasing/blob/6a1cec45eaf37b34e1b1d89130d7746fe4006346/docs/qa/uat/2026-11-15/report.md
- «eval готовий» у чаті команди: 2026-11-15
