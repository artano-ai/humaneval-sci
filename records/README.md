# records — run-record glossary

This directory is a flat pool of curated, reference-worthy evaluation
run records — the data the studies under `papers/` draw on. Each
study's `extract.mjs` names the records it consumes, so one record can
back more than one study without being duplicated.

## When to add a record

Add a run record here whenever:

- A run produces a paper-grade headline number (n ≥ 30, statistically significant).
- A run reveals a structural finding worth referencing later.
- A run is the first evaluation against a new model or scoring change.

Naming convention: `YYYY-MM-DD-<model>-<n-prompts>prompt-<variant>.json`
for A/B runs, `<analysis>-<model>.json` for sweeps. Add a one-line entry
in the table below, then re-run the consuming study's `extract.mjs`.

## Records

| File | Date | Model | n | Δ overall score | Notes |
|---|---|---|---|---|---|
| `2026-05-21-llama3.1-8b-53prompt.json` | 2026-05-21 | Llama 3.1 8B (Ollama, local) | 53 | **−0.230** (95% CI [−0.33, −0.13], p < 0.001) | First statistically-significant A/B result. Aggregate negative driven by ceiling regression on Tier 1 textbook prompts. **hardy-weinberg-chi-square** (Tier 2) showed first positive Lemma effect (+0.29). Treatment uses 7× control tokens. Headline data for the v0.2 design pivot toward conditional routing. |
| `2026-05-21-llama3.1-8b-53prompt-trace.json` | 2026-05-21 | Llama 3.1 8B (Ollama, local) | 53 | **−0.197** (95% CI [−0.30, −0.09], p < 0.001) | First landmark **with full per-candidate trace capture**. Same model/prompt set as previous landmark, rerun after trace plumbing landed. Two positive Δ cases: **maxwell-boltzmann-mean-speed-py** (+0.75, control had wrong formula → 15,000 m/s for N₂) and **rk4-integrate-exp-decay-py** (+0.75, control had a syntax error). Treatment/control token ratio 7.9×. |
| `2026-05-21-llama3.1-8b-73prompt-trace.json` | 2026-05-21 | Llama 3.1 8B (Ollama, local) | 73 | **−0.220** (95% CI [−0.31, −0.13], p < 0.001) | **Falsification landmark. v0.1 interface** (forced first-turn tool call; full card dump from `lemma_cards_get`). Expanded prompt set: existing 53 + 20 new Tier 2/3 prompts (multi-step research-typical tasks across all 7 domains). The conditional-knowledge-augmentation hypothesis predicted Δ would move toward zero or positive on the Tier 2/3 subset. Instead: Tier 2/3 subset Δ = **−0.288** (worse than Tier 1's −0.188). Prior positive-flip cases (`maxwell-boltzmann-mean-speed`, `rk4-integrate-exp-decay`, `hardy-weinberg-chi-square`) did **not** replicate; hardy-weinberg actually reversed sign (+0.29 → −0.75). Conclusion: positive flips are sampling noise, not a real population. |
| `2026-05-21-llama3.1-8b-73prompt-refined-trace.json` | 2026-05-21 | Llama 3.1 8B (Ollama, local) | 73 | **−0.146** (95% CI [−0.23, −0.06], p = 0.001) | **v0.2-lite interface** (tool_choice optional — model self-decides per prompt — and `lemma_cards_get` returns a curated slice by default: formula + symbols + dimensions + limits, not the full record). Same model + prompt set as the v0.1 landmark above. Refinements recover **+0.074 of the v0.1 regression** but Δ remains significantly negative. The recovery is concentrated on Tier 1 (Δ: −0.188 → −0.083) and barely affects Tier 2/3 (Δ: −0.288 → −0.283). HIGH-severity treatment verdicts dropped 37 → 27. 6 positive-flip cases (vs 3 in v0.1), including the first Tier-2 prompt to flip positive (`fermi-energy-3d-free-electron-py`, +0.75). |
| `2026-05-21-llama3.1-8b-73prompt-bestof5-rerank.json` | 2026-05-21 | Llama 3.1 8B (Ollama, local) | 73 | **single_shot 0.630 → lemma_honest_rerank 0.685** (oracle ceiling 0.692) | **Post-hoc verifier landmark.** Different role for the substrate: instead of giving the model tools at retrieval time, generate N=5 candidates at temperature 0.7 (no tools), then score each candidate with Lemma's verification engine, then pick the best. Headline: **Lemma's deployable (verification-only) reranker recovers 88% of the functional-oracle's lift** (+0.055 over single-shot vs the oracle's +0.062), at **97.3% per-prompt agreement with the oracle's pick**. Same model + prompt set + scorer as the trace landmarks above. The substrate IS useful — just at sampling time, not at retrieval time. Headline data for the "Lemma as verifier" product positioning. |
| `2026-05-21-mistral-nemo-12b-73prompt-bestof5-rerank.json` | 2026-05-21 | Mistral Nemo 12B (Ollama, local) | 73 | **single_shot 0.586 → lemma_honest_rerank 0.641** (oracle ceiling 0.640) | **Cross-model rerank landmark.** Same experiment as the Llama-rerank row, different vendor + larger model. Headline: **+0.055 Lemma honest lift** (identical magnitude to Llama 3.1 8B's lift), **97.3% oracle agreement** (identical to Llama). The substrate-as-reranker mechanism replicates across vendors at different sizes. **Tier 2/3 result diverges from Llama**: mistral-nemo shows +0.065 Tier-2/3 lift at 100% oracle agreement (22/22), where Llama showed zero Tier-2/3 lift. Reason: mistral-nemo's variance is uniformly outlier-shaped on Tier 2/3, no partial-credit cases — so Lemma's outlier-rejection mechanism is sufficient. The "partial-credit ranker" limitation is a model-specific behavior, not a substrate-fundamental ceiling. |

## Result-JSON schema

Each per-run JSON has this top-level shape:

```jsonc
{
  "run_started_at": "ISO timestamp",
  "control_model_id": "<model>:control",
  "treatment_model_id": "<model>:treatment",
  "prompts_evaluated": 53,
  "runs_per_condition": 1,
  "per_prompt": [
    {
      "prompt_id": "...",
      "domain": "...",
      "card_ids": ["..."],
      "control":   [/* CombinedScore — per-candidate score record */],
      "treatment": [/* CombinedScore — same shape */]
    }
  ],
  "control_stats":   { /* ConditionStats */ },
  "treatment_stats": { /* ConditionStats */ },
  "paired_delta": {
    "mean_overall_score_delta": -0.23,
    "mean_functional_pass_rate_delta": -0.29,
    "n_prompts": 53
  },
  "paired_t_test": {
    "overall_score":      { /* PairedTestResult */ },
    "functional_pass_rate": { /* PairedTestResult */ }
  }
}
```

Per-prompt result entries (`per_prompt[i].control[j]`) include:
- `functional` — `{passed, total, pass_rate, failures: [{test_case, reason}]}`
- `verification` — `{severity: NONE|LOW|MEDIUM|HIGH, passing, total, details}`
- `overall_score` — `functional.pass_rate * (1 - severity_penalty)`
- `candidate` — raw model output (the final code) that was scored
- `usage` — `{input_tokens, output_tokens, total_tokens, turn_count, tool_calls_count, ...}`
- `trace` — full agent-loop conversation, normalised to a common
  shape across adapters. Lets you reconstruct *exactly* what the
  model received and produced at every turn. See "Trace shape" below.

## Trace shape

When an adapter runs an actual LLM (Gemini, Ollama, etc.), the result
JSON includes a `trace: TraceTurn[]` field per scored candidate.
Reference-adapter runs do not include a trace (no API call happened).

```jsonc
"trace": [
  { "role": "system", "content": "You are a scientific code generation assistant..." },
  { "role": "user",   "content": "Write a Python function `coulomb_force(q1, q2, r)`..." },
  { "role": "assistant", "content": "I'll look this up first.",
    "tool_calls": [
      { "id": "call_abc", "name": "lemma_cards_get",
        "arguments": "{\"id\":\"coulombs-law-point-charges\"}" }
    ]
  },
  { "role": "tool", "tool_call_id": "call_abc",
    "content": "{\"kind\":\"principle\",\"id\":\"coulombs-law-point-charges\",\"formula\":\"...\"}" },
  { "role": "assistant", "content": "def coulomb_force(q1, q2, r):\n    k = 8.9875517923e9\n    ..." }
]
```

Roles:
- `system` — the initial system prompt the adapter sent
- `user` — the prompt text from `prompts/*.json`, or any subsequent
  user-side instruction (e.g. the force-code-recovery nudge after
  MAX_TOOL_TURNS)
- `assistant` — the model's response. May include `tool_calls` (a list
  of function calls the model wants to make), `content` (text), or
  both
- `tool` — the result returned for a specific assistant tool call.
  Matched to the assistant turn via `tool_call_id`. The `content` is
  the JSON-serialised tool output (cards JSON, crosscheck verdict, etc.)

Use the trace to answer questions like:
- "What card did Llama ask for, and what did it get back?"
- "Did the model call any tool more than once?"
- "Did the model receive null from a tool and proceed anyway?"

```sh
# Quick inspection — pretty-print one trace
node -e "const r=require('./records/...json');
  const p=r.per_prompt.find(p => p.prompt_id === 'hardy-weinberg-chi-square-py');
  for (const t of p.treatment[0].trace ?? []) {
    const tag='['+t.role+(t.tool_calls?' '+t.tool_calls.map(c=>c.name).join(','):'')+']';
    console.log(tag, (t.content||'').slice(0,100));
  }"
```

## Statistical glossary

The vocabulary used in the smoke output and in `paired_t_test`:

| Term | Symbol | Meaning |
|---|---|---|
| **Delta** | Δ | The difference in mean score, treatment minus control. Positive Δ means Lemma improved the score; negative means it hurt. Computed prompt-by-prompt (paired) so each Δᵢ is treatment_i − control_i for the *same* prompt. |
| **Mean delta** | Δ̄ | Average of per-prompt deltas. The headline effect-size estimate. |
| **Standard error** | SE | Sample standard deviation of the per-prompt deltas, divided by √n. Measures how precisely we know the mean delta. |
| **t-statistic** | t | t = Δ̄ / SE. How many standard errors the observed mean is from zero. Large \|t\| (≈ ≥ 2) means the effect is large relative to the noise. |
| **Degrees of freedom** | df | n − 1, where n is the number of paired observations (prompts). Determines the shape of the t-distribution used to compute p. |
| **p-value (two-tailed)** | p | The probability of seeing a mean delta at least as extreme as Δ̄ if the true effect were zero (the null hypothesis). Small p (≤ 0.05) means the observed delta is unlikely to be pure noise. Conventionally: < 0.05 = significant; < 0.01 = highly significant; < 0.001 = very highly significant. |
| **95% confidence interval** | 95% CI | The range of plausible values for the true mean delta, computed as Δ̄ ± t₀.₉₇₅(df) · SE. If the CI excludes zero on both sides, the effect is significant at the 5% level. Wider CI = less certainty. |
| **`significant_at_0_05`** | — | Boolean shorthand: `p_value_two_tailed < 0.05`. |
| **Functional pass-rate** | — | Fraction of a prompt's test cases that pass when the candidate's code is executed in the Python sandbox. In `[0, 1]`. |
| **Severity** | — | The Lemma engine's verdict on the candidate's verification claims: `NONE` / `LOW` / `MEDIUM` / `HIGH`. Penalty applied to functional pass-rate: 0, 0.25, 0.5, 1.0 respectively. |
| **Overall score** | — | `functional_pass_rate × (1 − severity_penalty)`. HIGH severity zeroes the overall score even on functional pass — physical-correctness gates functional-correctness in science. |
| **Tool calls count** | — | Number of times the agent invoked a Lemma tool during a single prompt's generation. `0` for the control arm (no tools available); `≥ 1` for treatment if the model actually used the tools. Confounded experiment when treatment shows `tool_calls_count = 0` across all prompts. |
| **Turn count** | — | Number of API calls made for a single prompt's generation. `1` for control; `> 1` for treatment when the agent loop runs (call → tool result → call again). |

## How to interpret a typical headline line

Example headline line:

```
Δ overall score   : -0.230  [95% CI -0.329, -0.130]  t(52) = -4.63  p = <0.001 *
```

Read as:

> The mean per-prompt overall-score difference (treatment minus control)
> is **−0.230**. We're 95% confident the true difference lies between
> **−0.329 and −0.130**. The t-statistic is **−4.63** on **52 degrees of
> freedom**; the two-tailed p-value is **less than 0.001**. The trailing
> `*` marks `p < 0.05` (significant at the 5% level).

A non-significant version of the same line:

```
Δ overall score   : -0.300  [95% CI -0.810, +0.210]  t(4) = -1.63  p = 0.18
```

> Estimated effect is −0.30, but the 95% CI spans both signs, t is only
> −1.63 on 4 degrees of freedom (a tiny sample), and p = 0.18 — well
> above 0.05. The data is consistent with the true effect being zero
> (or even positive). At n=5 you cannot reliably conclude anything from
> this magnitude of effect.

## Inspecting a specific run

```sh
# Pull the headline numbers from any run
node -e "const r=require('./records/2026-05-21-llama3.1-8b-53prompt.json');
  const t=r.paired_t_test.overall_score;
  console.log('Δ', t.mean_delta.toFixed(3), '95% CI [', t.ci_95_low.toFixed(3), ',', t.ci_95_high.toFixed(3), ']  t(' + t.degrees_of_freedom + ')=', t.t_statistic.toFixed(2), 'p=', t.p_value_two_tailed.toExponential(2));"

# Find prompts where treatment helped
node -e "const r=require('./records/2026-05-21-llama3.1-8b-53prompt.json');
  for (const p of r.per_prompt) {
    const c=p.control[0].overall_score, t=p.treatment[0].overall_score;
    if (t > c) console.log(p.prompt_id.padEnd(40), 'C', c.toFixed(2), 'T', t.toFixed(2), 'Δ', (t-c).toFixed(2));
  }"

# Find prompts where treatment hurt by ≥ 0.5
node -e "const r=require('./records/2026-05-21-llama3.1-8b-53prompt.json');
  for (const p of r.per_prompt) {
    const c=p.control[0].overall_score, t=p.treatment[0].overall_score;
    if (c-t >= 0.5) console.log(p.prompt_id.padEnd(40), 'C', c.toFixed(2), 'T', t.toFixed(2), 'Δ', (t-c).toFixed(2));
  }"

# Read what the model actually wrote
node -e "const r=require('./records/2026-05-21-llama3.1-8b-53prompt.json');
  const p=r.per_prompt.find(p => p.prompt_id === 'hardy-weinberg-chi-square-py');
  console.log('TREATMENT:'); console.log(p.treatment[0].candidate);"
```
