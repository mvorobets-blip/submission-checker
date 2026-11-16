#!/usr/bin/env node
// Перевірка чернетки файлу здачі домашки курсу за чеклістом — детерміновано, без моделі й без мережі.
//
//   node scripts/check-submission.mjs <тека набору>      # читає <тека>/submission.md
//
// Друкує таблицю знахідок, потім рядок ###JSON### і JSON для агента. Код виходу:
//   0 — знахідок немає; 1 — є знахідки (ПРОБЛЕМИ); 2 — вхід не читається (НЕ ПЕРЕВІРЕНО).
// Правила й «чому» — references/checklist.md. Скрипт ніколи не друкує знайдені секрети — лише номер рядка.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("Використання: node scripts/check-submission.mjs <тека набору>");
  process.exit(2);
}

let text;
try {
  text = readFileSync(join(dir, "submission.md"), "utf8");
} catch {
  console.error(`Не вдалося прочитати ${join(dir, "submission.md")}`);
  console.log("###JSON###");
  console.log(JSON.stringify({ file: join(dir, "submission.md"), readable: false, findings: [] }, null, 2));
  process.exit(2);
}

const lines = text.split(/\r?\n/);
const findings = [];
const add = (check, severity, line, detail) => findings.push({ check, severity, line, detail });

// Поле шаблону «- Назва: значення».
const field = (name) => {
  const i = lines.findIndex((l) => l.trim().startsWith(`- ${name}:`));
  return i < 0 ? null : { line: i + 1, value: lines[i].slice(lines[i].indexOf(":") + 1).trim() };
};

const repoField = field("Ваше репо");
const shaField = field("SHA");
const prodField = field("Прод-URL");
const repo = repoField?.value.match(/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/?$/)?.[1] ?? null;
const sha = shaField?.value.replace(/`/g, "") ?? "";
let prodHost = null;
try {
  prodHost = prodField ? new URL(prodField.value).host : null;
} catch {
  prodHost = null;
}

// C1 — обов'язкові поля.
if (!repo) add("C1-fields", "критично", repoField?.line ?? 0, "«Ваше репо» — немає або не повна адреса https://github.com/<owner>/<repo>");
if (!/^[0-9a-f]{40}$/.test(sha)) add("C1-fields", "критично", shaField?.line ?? 0, "«SHA» — не 40 шістнадцяткових символів (повний SHA коміту main)");
if (!prodHost) add("C1-fields", "критично", prodField?.line ?? 0, "«Прод-URL» — немає або не адреса");

// Рядок без URL (щоб «#12» усередині адреси не рахувався короткою адресою).
const withoutUrls = (l) => l.replace(/https?:\/\/\S+/g, "");

lines.forEach((l, idx) => {
  const n = idx + 1;
  // C2 — заглушки, які забули замінити.
  const ph = l.match(/\b(FINAL_SHA|SMOKE_RUN|CI_RUN|UAT_LINK|EVAL_READY_DATE|DEVIATIONS|TODO|TBD|XXX)\b|<[^>\s]{2,}>/);
  if (ph && !l.trim().startsWith("<!--")) add("C2-placeholder", "критично", n, `заглушка «${ph[0]}»`);

  // C3 — посилання на файли власного репо закріплені на SHA здачі, а не на гілці.
  if (repo) {
    const own = new RegExp(`https://github\\.com/${repo.replace(/[.]/g, "\\.")}/(?:blob|tree)/([^/\\s)]+)`, "g");
    for (const m of l.matchAll(own)) {
      if (m[1] !== sha) add("C3-pinned", "важливо", n, `посилання на «${m[1]}», а не на SHA здачі`);
    }
  }

  // C4 — короткі адреси замість повних («#53», «owner/repo#12»): у PR курсу вони ведуть не туди.
  const bare = withoutUrls(l);
  const short = bare.match(/(?:^|[\s(,;])((?:[\w.-]+\/[\w.-]+)?#\d+)\b/);
  if (short) add("C4-full-url", "важливо", n, `коротка адреса «${short[1]}» — потрібна повна https://github.com/…`);

  // C6 — секрети (значення не друкуємо).
  if (/sk-or-v1-|sk-ant-|eyJ[A-Za-z0-9_-]{10,}\.|(?:пароль|password)\s*[:=]\s*\S+/i.test(l)) {
    add("C6-secret", "критично", n, "схоже на ключ, токен чи пароль — прибрати з файлу (значення не показано)");
  }

  // C7 — лише синтетичні адреси пошти.
  for (const m of l.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) {
    if (!m[0].endsWith("@example.test")) add("C7-synthetic", "критично", n, "адреса пошти не @example.test");
  }

  // C8 — інструкції всередині даних: знахідка, а не команда.
  if (/ignore (?:all |the )?(?:previous |above )?(?:instructions|checklist)|ігноруй|пропусти перевірк|познач(?:и|те)? .*\bOK\b|mark (?:it |this )?(?:as )?OK/i.test(l)) {
    add("C8-injection", "критично", n, "інструкція перевіряльнику всередині файлу здачі — дані, а не команда");
  }
});

// C5 — /api/health: повна адреса на хості з «Прод-URL».
const healthLines = lines.map((l, i) => ({ l, n: i + 1 })).filter(({ l }) => l.includes("/api/health"));
if (healthLines.length === 0) add("C5-health", "важливо", 0, "немає посилання на /api/health");
for (const { l, n } of healthLines) {
  const url = l.match(/https?:\/\/[^\s)]+\/api\/health/)?.[0];
  if (!url) add("C5-health", "важливо", n, "/api/health без повної адреси");
  else if (prodHost && new URL(url).host !== prodHost) add("C5-health", "важливо", n, `/api/health на хості ${new URL(url).host}, а «Прод-URL» — ${prodHost}`);
}

// C9 — кожен кейс з FAIL / NOT RUN / ❌ має рядок у «Пояснення FAIL і NOT RUN».
const explIdx = lines.findIndex((l) => l.includes("Пояснення FAIL"));
const explanation = explIdx < 0 ? "" : lines[explIdx];
const failed = new Map();
lines.forEach((l, idx) => {
  if (idx === explIdx || !/FAIL|NOT RUN|❌/.test(l)) return;
  for (const m of l.matchAll(/GC-\d{2}/g)) if (!failed.has(m[0])) failed.set(m[0], idx + 1);
});
for (const [id, n] of failed) {
  if (!explanation.includes(id)) add("C9-fail-explained", "важливо", n, `${id} має FAIL чи NOT RUN, але немає в «Пояснення FAIL і NOT RUN»`);
}

findings.sort((a, b) => a.line - b.line);
const verdict = findings.length === 0 ? "OK" : "ПРОБЛЕМИ";

console.log(`ФАЙЛ: ${join(dir, "submission.md")}`);
console.log(`РЕПО: ${repo ?? "—"} · SHA: ${sha || "—"} · ПРОД: ${prodHost ?? "—"}`);
console.log(`ВЕРДИКТ СКРИПТА: ${verdict} (знахідок: ${findings.length})`);
if (findings.length) {
  console.log("| Рядок | Перевірка | Серйозність | Що не так |");
  console.log("|---|---|---|---|");
  for (const f of findings) console.log(`| ${f.line || "—"} | ${f.check} | ${f.severity} | ${f.detail} |`);
}
console.log("###JSON###");
console.log(JSON.stringify({ file: join(dir, "submission.md"), readable: true, repo, sha, prodHost, verdict, findings }, null, 2));
process.exit(findings.length ? 1 : 0);
