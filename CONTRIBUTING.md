# Contributing to HumanEval-Sci

Thanks for your interest. This guide covers the practical shape of
contributions; for the conduct expectations see
[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## What lives in this repository

| Path | Purpose |
| --- | --- |
| `prompts/` | The benchmark — one JSON file per task. CC-BY 4.0. |
| `records/` | Shared pool of recorded evaluation runs. |
| `papers/<n>-<slug>/` | One folder per study: its `extract.mjs` (names the records it uses) + the `tables/` that script regenerates. |

## Two kinds of contribution

### 1. Adding a prompt

Most useful contributions land here. Each prompt is a single JSON
file in `prompts/`. Required fields: `id`, `domain`, `language`,
`prompt`, `reference_solution`, `test_cases`, `card_ids`,
`verification_targets`.

1. Copy an existing prompt in the closest domain as a template.
2. Fill in the fields.
3. Make sure the `reference_solution` passes every `test_cases` entry.
4. Reference at least one card by id in `card_ids`.
5. Open a PR.

### 2. Adding a run record

Curated, reference-worthy runs live in `records/` with a one-line entry
in the table in [`records/README.md`](records/README.md). After adding
or changing records, regenerate the affected study's tables and include
the diff in your PR:

```sh
cd papers/1-pilot && node extract.mjs
```

## Pull request guidelines

- Small, focused PRs land faster than large ones.
- Commit messages: short imperative subject; body explaining *why* if
  the diff is not self-explanatory.
- New prompts: include `verification_targets` so the cross-check
  engine can score the prompt meaningfully.

## Code style

- Prompts: must parse as valid JSON, and the reference solution must
  pass its own test cases.
- Tables: must be the output of a study's `extract.mjs` on the committed
  records (don't hand-edit any `tables/`).

## Licensing of contributions

By submitting a contribution to this repository you agree that:

* code contributions are licensed under **Apache-2.0**,
* prompts and any new prompt data are licensed under **CC-BY 4.0**.
