# submission-checker — віртуальний працівник «перевіряльник здачі ДЗ»

Віртуальний працівник на **Claude Code** (бонус WS10 курсу «Modern Development with Agentic AI», шлях 1, власна
підписка, особисте використання). Перед відкриттям PR здачі він перевіряє чернетку файлу здачі за чеклістом курсу й
пише звіт: що не так, у якому рядку, як виправити. **Виправляє файл і відкриває PR людина.**

Будова — за шаблоном курсу `materials/worker-claude-code/`, роль і перевірки — власні. Звіт для курсу —
[`docs/worker/README.md`](docs/worker/README.md).

## Файли

```
AGENTS.md                                   роль, стани OK / ПРОБЛЕМИ / НЕ ПЕРЕВІРЕНО, межі, людина в контурі
CLAUDE.md                                   @AGENTS.md
.claude/skills/submission-checker/SKILL.md  оркестратор: процедура A (скрипт), D (перевіряльник), звіт
.claude/agents/submission-verifier.md       незалежний перевіряльник: чистий контекст, лише читання
.claude/settings.json                       вузький allow / deny (зокрема tests/, мережа, gh, запис поза out/)
scripts/check-submission.mjs                перевірки C1–C9 без моделі й мережі: таблиця + ###JSON###, код 0 / 1 / 2
references/checklist.md                     чекліст C1–C9: чому кожна перевірка, чого скрипт не бачить, граблі
data/ws10-*/submission.md                   golden data: 3 синтетичні чернетки здачі
tests/                                      очікувані вердикти (працівник їх не читає) і node --test
run.sh                                      запуск без людини: claude -p … --permission-mode dontAsk
out/                                        звіти й JSON запусків (у .gitignore; запуск для здачі — docs/worker/runs/)
```

## Як запустити

```bash
npm test                                         # golden data без моделі: 3 набори → відомі вердикти
node scripts/check-submission.mjs data/ws10-broken   # лише скрипт
./run.sh data/ws10-broken                        # працівник без людини (ваша підписка Claude)
```

Дані лише синтетичні (`dev-example`, `*.example.test`). Ключів і токенів у репо немає.
