# Genlysis follow-up review

Date 2026-10-19
Method read-only source inspection and existing evidence review
No new tests or contract changes were performed as part of this audit

## Current deployed-source check

The public configuration at https://genllysis.vercel.app/api/config identifies contract 0x4BD95131706b77a8100ee38a634a797bE7928715
The actual deployed source was fetched read-only and matched local contracts/genlysis.py byte for byte
Both SHA-256 digests are b3cb679c72bbbc86b98e940b35e4257573bbe5f141072420f27722b7c2222673
The semantic validation finding below therefore applies to the current deployed contract source as well as the local implementation
This comparison establishes source identity and does not demonstrate exploitation
The raw read-only comparison record is in artifacts/review-source-check-2026-10-19.json

## Summary

Genlysis already implements several FaultLine protections
It does not yet provide the same semantic support validation implemented in PatchJury v2
A working assessment and persistence after reload do not prove the absence of steward review risks

## Existing protections

- Immutable rubric and deterministic weights in `contracts/genlysis.py`
- Source repository, fixed commit, path and SHA-256 commitments
- Independent validator source retrieval and digest verification
- Bounded source counts and byte budgets
- Wallet-namespaced build IDs and submitter-only assessment initiation
- Same-wallet revision ancestry and prevention of assessment overwrite
- Successful GenVM execution checks separate from transaction finality in `src/receipt.ts`
- Final-state manifest and assessment commitment binding in `server/index.mjs`
- Explicit independent guidance and bounded source scope rather than official points prediction
- No unbounded public onchain registry enumeration endpoint

## High-priority remaining review risk

### Semantic evidence support and interpretation agreement

In `contracts/genlysis.py`, `validate` independently recomputes the five statuses and checks that leader quotations occur in independently fetched sources
It does not independently validate that each leader quotation substantively supports its criterion, reason, recommended action and verification procedure
Two assessments can share status labels while presenting materially incompatible reasoning
Exact substring presence does not resolve that issue

Before claiming PatchJury-equivalent validation, add criterion-specific source locations, substantive support validation and independent compatibility checks for decision-critical interpretations
Invalid or conflicting support must not produce an unsupported passing assessment
This is a source-level finding rather than a demonstrated live exploit

## Additional review risks

### Observations must remain visibly distinct from attestations

`server/collector.mjs` labels a successful workflow observation CONFIRMED while explicitly stating that it does not attest what the workflow tested
It labels deployment evidence CONFIRMED after a contract schema response while stating that source binding and end-to-end execution remain unverified
Those qualifications are useful but a collapsed row or headline can still overstate the underlying observation
Prefer titles such as Workflow run observed and Contract schema observed
Do not use these preflight flags as proof of successful integration, authentic regression execution or deployed-source equivalence

### Runtime evidence remains largely source-supplied

The assessment fetches committed source files and documentation
It does not authenticate a project's live execution receipts or bind a test report to actual CI output as PatchJury v2 does
That is compatible with a bounded source-readiness product only while claims and PASS criteria preserve that limit
If offering runtime verification, introduce authenticated receipt and CI evidence before making that claim

### Defensive parsing can be more explicit

The contract already guards top-level response and per-axis object types
Several nested values are converted with str rather than requiring exact string types
Strengthen field validation so malformed containers cannot become human-facing reasons or recommendations
The unsafe source URL path check rejects .. but does not reject every noncanonical segment such as . or repeated separators
Use the same canonical repository-relative path rules across collector, manifest and contract

### Verification documentation is stale

`TEST-REPORT.md` still lists deployment and basic assessment as remaining even though the session and README describe later successful live work
The initial deployment verification artifact checks public-source collection, revision ownership and the absence of fabricated assessments on unregistered reports
It does not establish the complete security and live adversarial matrix
Update the evidence map with exact current source equivalence, transaction receipts and explicit tested and untested paths

## Recommended order

1. Strengthen semantic support validation and defensive parsing
2. Clarify observation labels and scoring limits
3. Preserve the deployed-source comparison and verify the replacement version after any changes
4. Exercise irrelevant-but-real quotations, compatible statuses with conflicting reasons, malformed output, evidence substitution and unauthorized revisions
5. Record successful and rejected live paths and update submission claims to match verified scope

This audit does not modify the deployed contract or application behavior

## Implementation follow-up

The semantic support, strict parsing, path normalization, provenance, observation labeling and finalized-state consistency findings have now been addressed in the local v2 source
See REMEDIATION-V2.md for the exact implementation and remaining deployment steps
The original findings above document the historical v1 source
They are not a claim that v2 has already been deployed or passed live adversarial verification
