#!/usr/bin/env node
// Regenerates the supplementary tables for the HumanEval-Sci pilot from
// the run records and prompt set in the repository. Reads only from
// ../../records and ../../prompts; writes to ./tables. No external
// dependencies, no network access.
//
//   node extract.mjs
//
// Re-running is idempotent: the tables are a deterministic function of
// the committed run records.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', '..', 'records');
const promptDir = join(here, '..', '..', 'prompts');
const outDir = join(here, 'tables');
mkdirSync(outDir, { recursive: true });

const load = (f) => JSON.parse(readFileSync(join(dataDir, f), 'utf8'));

const V01 = '2026-05-21-llama3.1-8b-73prompt-trace.json';          // v0.1 interface
const V02 = '2026-05-21-llama3.1-8b-73prompt-refined-trace.json';  // v0.2-lite interface
const RR_LLAMA = '2026-05-21-llama3.1-8b-73prompt-bestof5-rerank.json';
const RR_MISTRAL = '2026-05-21-mistral-nemo-12b-73prompt-bestof5-rerank.json';

const f4 = (x) => x.toFixed(4);
const signed = (x) => (x >= 0 ? '+' : '') + x.toFixed(4);
const csvCell = (s) => {
  const v = String(s);
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};
const writeCsv = (name, header, rows) => {
  const body = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
  writeFileSync(join(outDir, name), body + '\n');
  console.log(`  tables/${name}  (${rows.length} rows)`);
};

// ---------------------------------------------------------------------------
// 1. Prompt catalogue
// ---------------------------------------------------------------------------
const prompts = readdirSync(promptDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(promptDir, f), 'utf8')))
  .sort((a, b) => a.domain.localeCompare(b.domain) || a.id.localeCompare(b.id));

writeCsv(
  'prompt-catalog.csv',
  ['prompt_id', 'domain', 'language', 'card_ids', 'n_test_cases'],
  prompts.map((p) => [
    p.id,
    p.domain,
    p.language ?? '',
    (p.card_ids ?? []).join(';'),
    (p.test_cases ?? []).length,
  ])
);

// ---------------------------------------------------------------------------
// 2. Per-prompt A/B results across the two retrieval interfaces
// ---------------------------------------------------------------------------
const abMap = (file) => {
  const m = new Map();
  for (const p of load(file).per_prompt) {
    const c = p.control[0];
    const t = p.treatment[0];
    m.set(p.prompt_id, {
      domain: p.domain,
      card_ids: (p.card_ids ?? []).join(';'),
      ctrl: c.overall_score,
      treat: t.overall_score,
      delta: t.overall_score - c.overall_score,
      treat_sev: t.verification?.severity ?? '',
      ctrl_cand: c.candidate ?? '',
      treat_cand: t.candidate ?? '',
    });
  }
  return m;
};
const v01 = abMap(V01);
const v02 = abMap(V02);
const ids = [...v01.keys()].sort((a, b) => {
  const da = v01.get(a).domain, db = v01.get(b).domain;
  return da.localeCompare(db) || a.localeCompare(b);
});

writeCsv(
  'per-prompt-ab.csv',
  [
    'prompt_id', 'domain', 'card_ids',
    'v0.1_control', 'v0.1_treatment', 'v0.1_delta',
    'v0.2lite_control', 'v0.2lite_treatment', 'v0.2lite_delta',
    'v0.2lite_treatment_severity',
  ],
  ids.map((id) => {
    const a = v01.get(id);
    const b = v02.get(id) ?? {};
    return [
      id, a.domain, a.card_ids,
      f4(a.ctrl), f4(a.treat), signed(a.delta),
      b.ctrl != null ? f4(b.ctrl) : '',
      b.treat != null ? f4(b.treat) : '',
      b.delta != null ? signed(b.delta) : '',
      b.treat_sev ?? '',
    ];
  })
);

// ---------------------------------------------------------------------------
// 3. Domain breakdown (mean delta per domain, both interfaces)
// ---------------------------------------------------------------------------
const byDomain = new Map();
for (const id of ids) {
  const a = v01.get(id);
  const b = v02.get(id);
  if (!byDomain.has(a.domain)) byDomain.set(a.domain, { n: 0, s01: 0, s02: 0 });
  const d = byDomain.get(a.domain);
  d.n += 1;
  d.s01 += a.delta;
  if (b) d.s02 += b.delta;
}
writeCsv(
  'domain-breakdown.csv',
  ['domain', 'n_prompts', 'v0.1_mean_delta', 'v0.2lite_mean_delta'],
  [...byDomain.entries()]
    .sort((x, y) => x[1].s01 / x[1].n - y[1].s01 / y[1].n)
    .map(([dom, d]) => [dom, d.n, signed(d.s01 / d.n), signed(d.s02 / d.n)])
);

// ---------------------------------------------------------------------------
// 4. Sampling-time rerank summary (both models)
// ---------------------------------------------------------------------------
const rerankRow = (file, modelLabel) => {
  const s = load(file).summary;
  const m = s.mean_overall_score;
  return [
    modelLabel,
    s.n_prompts,
    f4(m.single_shot),
    f4(m.lemma_rerank_honest),
    f4(m.functional_oracle),
    signed(m.lemma_rerank_honest - m.single_shot),
    f4(s.oracle_agreement.lemma_rerank_honest),
  ];
};
writeCsv(
  'rerank-summary.csv',
  ['model', 'n_prompts', 'single_shot', 'lemma_rerank_honest', 'functional_oracle', 'honest_lift', 'oracle_agreement_honest'],
  [rerankRow(RR_LLAMA, 'llama3.1:8b'), rerankRow(RR_MISTRAL, 'mistral-nemo:12b')]
);

// ---------------------------------------------------------------------------
// 5. Positive-flip case studies (prompts where retrieval helped)
// ---------------------------------------------------------------------------
const flips = ids
  .map((id) => ({ id, a: v01.get(id), b: v02.get(id) }))
  .filter(({ a, b }) => a.delta > 1e-9 || (b && b.delta > 1e-9));

const fence = (code) => '```python\n' + (code || '(empty)').trim() + '\n```';
let md = '# Positive-flip case studies\n\n';
md += 'Prompts where the card-augmented (treatment) arm scored above the\n';
md += 'no-tools (control) arm, under either the v0.1 or the v0.2-lite\n';
md += 'retrieval interface. Code is the exact final candidate each arm\n';
md += 'produced, taken verbatim from the run records in `../data/`.\n\n';
md += `Total positive-flip prompts: **${flips.length}** of ${ids.length}.\n\n`;
for (const { id, a, b } of flips) {
  md += `## ${id}\n\n`;
  md += `- domain: \`${a.domain}\`  ·  cards: \`${a.card_ids || '—'}\`\n`;
  md += `- v0.1 delta: **${signed(a.delta)}** (control ${f4(a.ctrl)} → treatment ${f4(a.treat)})\n`;
  if (b) md += `- v0.2-lite delta: **${signed(b.delta)}** (control ${f4(b.ctrl)} → treatment ${f4(b.treat)})\n`;
  const ref = b && b.delta > a.delta ? b : a;
  md += `\n**Control (no tools):**\n\n${fence(ref.ctrl_cand)}\n\n`;
  md += `**Treatment (card-augmented):**\n\n${fence(ref.treat_cand)}\n\n`;
}
writeFileSync(join(outDir, 'positive-flips.md'), md);
console.log(`  tables/positive-flips.md  (${flips.length} case studies)`);

console.log('done.');
