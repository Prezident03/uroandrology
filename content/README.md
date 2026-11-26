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
| `reference-ranges/<id>.yaml` | Reference values, one file per source edition |
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

## Uzbek / Oʻzbekcha (qisqacha)

Har bir boʻlim alohida fayl: `modules/<modul>/<boʻlim>.uz.md`. Fayl boshida versiya, holat va
tekshirgan shifokor yoziladi. Tasdiqlangan (`approved`) kontent uchun `reviewedBy` va `reviewedAt`
majburiy. Manbalar faqat `guidelines/references.yaml` dan kalit orqali olinadi. Andoza:
`_templates/section.md`. Har qanday xato build'ni toʻxtatadi va saytga chiqmaydi.
