# Здача WS10

## Дані

- Роль: dev
- Команда: school-purchasing
- GitHub-логін: dev-example
- Ваше репо: https://github.com/dev-example/school-purchasing
- SHA: 0b8a1caec23d75d1154b8d9bef9cec6c03697638
- Репо вимог PM: https://github.com/pm-example/school-purchasing-spec
- Прод-URL: https://school-purchasing.example.test

## Розробник

### D0 — умова прийняття

- `/api/health`: https://school-purchasing-old.example.test/api/health — `"db":"ok"`
- Зелений прогін `smoke` на `main`: https://github.com/dev-example/school-purchasing/actions/runs/SMOKE_RUN

### Спека зрізу 4 (трек A)

- `/requirements-sync` — PR «Оновлення вимог»: #41
- Golden cases PM: https://github.com/dev-example/school-purchasing/blob/main/tests/fixtures/golden/cases.json

### Evals (трек C)

- Звіт живого eval: https://github.com/dev-example/school-purchasing/blob/0b8a1caec23d75d1154b8d9bef9cec6c03697638/evals/reports/2026-11-15.md — 8 з 10, GC-03 FAIL, GC-07 NOT RUN
- Пояснення FAIL і NOT RUN: GC-03 — модель вигадала ціну, промпт виправлено

### Прод, UAT і приймання PM (трек D)

- UAT на проді: UAT_LINK
- «eval готовий» у чаті команди: 2026-11-15
