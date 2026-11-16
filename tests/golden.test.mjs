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
