# HumanEval-Sci

A benchmark for language-model-generated scientific code, scored on two
axes: (a) functional correctness against reference test cases, and (b)
physical / numerical correctness against the scientific principles each
task declares — verified by the Lemma cross-check engine.

This repository holds the **benchmark and the recorded evaluation
results**: the prompt corpus, the landmark run records behind the
HumanEval-Sci studies, and a dependency-free script that regenerates
every supplementary table from those records.

## Why this exists

Standard code-generation benchmarks (HumanEval, MBPP, SciCode, MATH)
test syntactic / functional correctness. They do not test whether the
generated code is **physically or mathematically correct under the
declared scientific principles**. A model can pass HumanEval and still
produce code that silently violates dimensional analysis, a known
limit, or a conservation law.

HumanEval-Sci closes that gap: every prompt is keyed to one or more
curated principle cards that declare the dimensional, limit, and
conservation constraints the output must satisfy, and each candidate is
scored against them.

## Layout

```
humaneval-sci/
├── prompts/        the benchmark — one JSON file per task (73 tasks)
├── records/        shared pool of recorded evaluation runs
└── papers/         one folder per study that draws on the benchmark
    └── 1-pilot/                      extract.mjs + tables/
```

The benchmark (`prompts/`) and the run records (`records/`) are shared;
each study under `papers/` keeps only its own `extract.mjs` (which names
the records it uses) and the tables that script regenerates.

## Prompt schema

Each prompt is a JSON file in `prompts/`:

```json
{
  "id": "free-fall-trajectory-py",
  "card_ids": ["free-fall-uniform-gravity"],
  "language": "python",
  "prompt": "Write a Python function that computes the trajectory of a projectile in free fall...",
  "reference_solution": "def trajectory(y0, v0, g, t):\n    return y0 + v0 * t - 0.5 * g * t ** 2\n",
  "test_cases": [
    {
      "name": "ground_landing_time",
      "inputs": { "y0": 100, "v0": 0, "g": 9.81, "t": "ground" },
      "expected": { "t_land_within_eps": [4.51, 4.52] }
    }
  ],
  "verification_targets": {
    "dimensional": true,
    "limits": ["t = 0 → y = y_0", "energy_conservation"],
    "validation_envelopes": { "g_m_per_s2": [9.79, 9.83] }
  }
}
```

`card_ids` keys the prompt to the principle cards whose dimensional,
limit, and conservation constraints the output must satisfy.

## Score model

For each prompt, a scored run produces:

| Field | Type | Source |
|-------|------|--------|
| `functional_pass_rate` | float in [0, 1] | fraction of `test_cases` that pass |
| `verification_severity` | NONE / LOW / MEDIUM / HIGH | worst severity from the cross-check engine |
| `overall_score` | float in [0, 1] | `functional_pass_rate * (1 - severity_penalty)` |

`severity_penalty`: NONE = 0, LOW = 0.25, MEDIUM = 0.5, HIGH = 1.0.
HIGH zeroes the overall score even on a functional pass — that's the
core thesis: physical-correctness gates functional-correctness in
science.

## The experiment

The benchmark measures a verification substrate's value with a paired
A/B design: the same model answers each prompt twice —

- **Control** — model alone, no tools. Baseline capability.
- **Treatment** — same model, plus access to the Lemma cards and the
  cross-check engine, so it can look up the relevant principle and
  check its own solution before submitting.

The same model is used in both arms, so the substrate is the only
independent variable. The records in `records/` capture both arms per
prompt — per-candidate scores, token usage, and the full agent-loop
trace. See [`records/README.md`](records/README.md) for the run-record
schema, the trace shape, the record glossary, and a statistical
glossary for the paired-t-test fields.

## Reproducing the tables

Each study's supplementary tables are a deterministic function of the
committed run records. Regenerate them with no dependencies and no
network access — run a study's script from its own folder:

```sh
cd papers/1-pilot && node extract.mjs
```

Each `extract.mjs` reads `../../records` + `../../prompts` and writes its
own `tables/`. Re-running is idempotent — the tables are a pure function
of the committed records, with no language-model reruns.

## Domains

73 tasks across seven domains:

| Domain | Tasks |
|---|---|
| physics | 25 |
| chemistry | 13 |
| biology | 9 |
| numerical-methods | 8 |
| climate | 6 |
| mathematics | 6 |
| engineering | 6 |

Full per-task breakdown in `papers/1-pilot/tables/prompt-catalog.csv`;
per-(sub)domain deltas in `papers/1-pilot/tables/domain-breakdown.csv`.

## License

- Prompts and run records: **CC-BY 4.0** — community-contributable,
  attribution required.
- Tooling (`extract.mjs`): **Apache-2.0**.
