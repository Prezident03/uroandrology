# Clinical content guide / Klinik kontent boʻyicha qoʻllanma

All clinical text, citations and reference values live in this folder, separate from the code.
`pnpm content` checks every file; any error stops the build, so nothing malformed or unreviewed
reaches the site. Changes are proposed as GitHub pull requests and reviewed there.

## Folders

| Path | What |
| --- | --- |
| `modules/<module>/<section>.<uz\|en\|ru>.md` | One section in one language |
| `modules/<module>/topics/<topic>.<uz\|en\|ru>.md` | A separate topic page (e.g. azoospermia) |
| `guidelines/references.yaml` | The single citation registry (EAU, AUA, ASRM, WHO, ISSM, Endocrine Society) |
| `reference-ranges/<id>.yaml` | Reference values, one file per source edition (`group: semen` feeds the semen interpreter) |
| `questionnaires/<id>.yaml` | Licensed questionnaire text and scoring bands (`iief-5`, `pedt`) |
| `interpretation/<id>.yaml` | Value bands for calculators (`bmi`) |
| `algorithms/<id>.yaml` | Diagnostic pathways: steps, decisions, mandatory/optional/conditional, referral points |
| `cases/<slug>.<uz\|en\|ru>.md` | Clinical cases with self-assessment questions (format below) |
| `_templates/` | Copy-and-fill templates (ignored by the build) |

Module and section names: see `lib/clinical/modules.ts` or the **Content status** page in the app.

## Review states

| status | Shown on the site |
| --- | --- |
| `draft`, `in-review` | Only in preview builds, with a "not reviewed" banner |
| `requires-review` | Yes, with an amber "requires review" banner |
| `approved` | Yes. Needs `reviewedBy` and `reviewedAt`; translations also need `translationVerifiedBy` |

## Rules

- Never invent citations, recommendations, reference limits or evidence grades.
- Every `:::guideline` block must name its source with `refs="..."`.
- A citation without `url` and `lastVerified` is shown as "source not yet verified".
- Each language is written or translated and verified by a person. Machine translation is not accepted.
- A translation records the original version it was made from (`sourceVersion`). When the original
  changes, the site shows "translation behind original" until the translation is updated.

## Clinical cases

Cases must be **fictional or fully anonymised** and written or reviewed by a physician. Never include
names, dates, places, record numbers, images or any combination of details that could identify a patient.

```markdown
---
title: Infertility work-up in a 32-year-old man
version: 1.0.0
status: requires-review          # approved only after physician review (reviewedBy, reviewedAt)
sourceLocale: uz
module: male-infertility         # male-infertility | erectile-dysfunction | premature-ejaculation | hypogonadism | clinical-assessment
anonymisation: fictional         # fictional | anonymised
references: [who-semen-2021]
questions:
  - question: Which test should be repeated first?
    options: [Option A, Option B, Option C]
    answer: 1                    # index of the correct option, counted from 0
    explanation: Why this is the answer, with the source.
---
## Presentation
...
```

## Guideline update tracking

Each entry in `guidelines/references.yaml` may carry an `updates` list (newest first). Entries appear in the
guidelines library and under "Latest guideline updates" on the dashboard. Set `lastVerified` only after the
edition, chapter and link have really been checked against the original publication.

```yaml
  updates:
    - date: 2026-03-01
      note: New edition published; chapter 4 recommendations changed.
```

## Uzbek / Oʻzbekcha (qisqacha)

Har bir boʻlim alohida fayl: `modules/<modul>/<boʻlim>.uz.md`. Fayl boshida versiya, holat va
tekshirgan shifokor yoziladi. Tasdiqlangan (`approved`) kontent uchun `reviewedBy` va `reviewedAt`
majburiy. Manbalar faqat `guidelines/references.yaml` dan kalit orqali olinadi. Andoza:
`_templates/section.md`. Har qanday xato build'ni toʻxtatadi va saytga chiqmaydi.
