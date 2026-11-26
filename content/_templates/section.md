---
# Copy to content/modules/<module>/<section>.<uz|en|ru>.md
# Remove these comment lines. All fields are checked at build time.
version: 0.1.0            # raise on every clinical change (1.0.0 = first approved)
status: draft             # draft | in-review | approved | requires-review
sourceLocale: en          # language this text was originally written in
# sourceVersion: 1.0.0    # translations only: the original version translated
# reviewedBy: Dr ...      # required for approved
# reviewedAt: 2026-01-31  # required for approved
# reviewDue: 2027-01-31   # next scheduled re-check
# translationVerifiedBy: Dr ...  # approved translations only
references: []            # keys from content/guidelines/references.yaml
---

Plain Markdown text. Cite a source inline like this :cite[reference-key].

:::guideline{refs="reference-key"}
Recommendation text or an accurate summary, exactly as verified against the source.
:::

:::commentary
Educational commentary, clearly separate from guideline text.
:::

Other blocks: :::info, :::warning, :::contraindication, :::referral, :::review

::range-table{dataset="dataset-id"}
