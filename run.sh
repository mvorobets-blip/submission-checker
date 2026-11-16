#!/usr/bin/env bash
# Запуск віртуального працівника без людини за клавіатурою (cron, CI): claude -p («print», headless).
# Вхід — ваша підписка Claude (claude, потім /login один раз). Лише для ОСОБИСТОГО використання.
#
#   ./run.sh                     # набір за замовчуванням data/ws10-broken
#   ./run.sh data/ws10-clean     # інший набір
#
# Без --bare: --bare пропускає CLAUDE.md, скіли, .claude/agents і хуки та не бере вхід підпискою — працівника без них
# немає. Запускати лише з цієї теки: .claude/settings.json з вузькими дозволами діє лише з теки запуску.
set -euo pipefail
cd "$(dirname "$0")"

SET="${1:-data/ws10-broken}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
STAMP="$(date +%Y-%m-%dT%H-%M-%S)"
mkdir -p out/runs

# --permission-mode dontAsk: усе, що не дозволено явно, — відмова (без людини нема кому натиснути «так»).
# --allowedTools: те саме, що в .claude/settings.json, — на випадок, якщо його змінять.
# --max-turns: стеля кроків; --output-format json: результат, кроки й total_cost_usd у файл.
set +e
"$CLAUDE_BIN" -p "/submission-checker ${SET}" \
  --permission-mode dontAsk \
  --allowedTools "Skill(submission-checker),Agent(submission-verifier),Bash(node scripts/check-submission.mjs *),Read,Grep,Glob,Edit(/out/**)" \
  --max-turns 30 \
  --output-format json \
  > "out/runs/${STAMP}.json"
code=$?
set -e

echo "Результат запуску: out/runs/${STAMP}.json (код виходу ${code}); звіт — новий файл у out/"
exit "$code"
