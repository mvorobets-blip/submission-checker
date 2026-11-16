// Golden data працівника: скрипт перевірки на кожному синтетичному наборі дає відомий вердикт і рівно ті знахідки
// (рядок + перевірка). Без моделі й мережі — npm test. Окремо: секрет із набору ws10-injection не друкується у виводі.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const expected = JSON.parse(readFileSync(new URL("./expected.json", import.meta.url), "utf8"));
const run = (set) => {
  const r = spawnSync(process.execPath, ["scripts/check-submission.mjs", set], { encoding: "utf8" });
  const json = JSON.parse(r.stdout.split("###JSON###")[1]);
  return { code: r.status, stdout: r.stdout, json };
};

for (const [set, want] of Object.entries(expected).filter(([k]) => k.startsWith("data/"))) {
  test(`${set}: вердикт ${want.verdict}, знахідки ${want.checks.length}`, () => {
    const { code, json } = run(set);
    assert.equal(code, want.exit);
    assert.equal(json.verdict, want.verdict);
    assert.deepEqual(json.findings.map((f) => [f.line, f.check]), want.checks);
  });
}

test("значення пароля з набору не потрапляє у вивід скрипта", () => {
  const { stdout } = run("data/ws10-injection");
  assert.ok(!stdout.includes("Course-Demo-2026"));
});

test("немає файлу — код 2 (НЕ ПЕРЕВІРЕНО)", () => {
  const r = spawnSync(process.execPath, ["scripts/check-submission.mjs", "data/no-such-set"], { encoding: "utf8" });
  assert.equal(r.status, 2);
});

// Хибні спрацьовування, які знайшла самоперевірка справжньої здачі WS10 (2026-11-16): версія пакета як пошта,
// `<…>` у код-фрагментах як заглушка, пояснення FAIL вкладеним списком, згадка /api/health словом.
test("самоперевірка WS10: версія пакета, код-фрагменти, вкладене пояснення, згадка health — не знахідки", async () => {
  const { mkdtempSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(join(tmpdir(), "selfcheck-"));
  writeFileSync(
    join(dir, "submission.md"),
    [
      "- Ваше репо: https://github.com/dev-example/school-purchasing",
      "- SHA: 6a1cec45eaf37b34e1b1d89130d7746fe4006346",
      "- Прод-URL: https://school-purchasing.example.test",
      "- `/api/health`: https://school-purchasing.example.test/api/health — db ok",
      "- Версія `next`: next@16.4.3",
      "- Спека `add-<зріз4>`: https://github.com/dev-example/school-purchasing/pull/74",
      "- Промпт: `<document>…</document>`, версія line-v4",
      "- Звіт: 9 з 9, GC-14 NOT RUN",
      "- Пояснення FAIL і NOT RUN:",
      "  - 10:21 — GC-01 FAIL: правопис, виправлено промптом",
      "  - 14:10 — GC-14 NOT RUN: 429, повторено → ✅",
      "- Бонус: перевіряє поля, /api/health, секрети",
    ].join("\n"),
  );
  const r = spawnSync(process.execPath, ["scripts/check-submission.mjs", dir], { encoding: "utf8" });
  const json = JSON.parse(r.stdout.split("###JSON###")[1]);
  assert.deepEqual(json.findings, []);
  assert.equal(r.status, 0);
});
