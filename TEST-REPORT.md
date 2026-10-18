# Historical v1 verification record

Date: 2026-10-16.

## Passed

- Production TypeScript/Vite build.
- 38 Node tests covering URL and input validation, immutable source hashing,
  source budgets, credential omission, workflow observations, revision
  comparison, SQLite persistence and interrupted-job recovery, API origin
  checks, private owner-token handling and export.
- 23 Python contract tests with local GenVM doubles: immutable rubric,
  fixed source URLs, repo/commit/path/hash binding, duplicate-source rejection,
  wallet namespace, protected revisions and assessment initiation, exact
  quoted evidence, deterministic scoring, unavailable/modified source failure,
  disagreement failure and prevention of result overwrite.
- Real GitHub preflight against ArlosX/PatchJury at commit
  `48a2a359833726322bb9bc350263a24e24c26198`: 6 complete files collected with
  content hashes; report export succeeded. No code was executed.
- StudioNet schema service accepted `contracts/genlysis.py` and returned
  register_build, assess_build, get_build, get_assessment and get_protocol.
- Initial automated UI checks: no page exceptions; home WCAG A/AA checks
  returned no violations; no horizontal overflow at 360, 390, 768 and 1024px;
  reduced-motion disables the inspection-core animation; example report,
  finding expansion, report tabs and sample input interactions worked.
- Final UI pass after navigation fixes: the real PatchJury report persisted
  after browser reload; its evidence page had no detected WCAG A/AA violations
  and no horizontal overflow at 360px. Page exceptions remained zero.

Screenshots and machine-readable run details are in the ignored `artifacts/`
directory. Automated accessibility results are not a complete accessibility
certification.

## Original live verification plan

1. Deploy contracts/genlysis.py and configure its address.
2. With a funded StudioNet wallet, register one real preflight manifest and
   request consensus. Verify finalized successful writes and a matching read.
3. Refresh the report and check its finalized assessment with the same author.
4. Exercise differing evidence quality and compare rubric outcomes.
5. Test a linked revision from the same wallet and reject another wallet's
   attempt to use that revision parent.
6. Check unavailable evidence and disagreement on live consensus. They must
   not create a passing assessment.

Local doubles and schema success do not establish these live outcomes.
The initial source-scope evaluator does not perform arbitrary code execution,
browser penetration tests, deployed-source attestation or official point
prediction.

## Design refinement verification

The 2026-10-16 surface revision reduced the desktop hero to 737px at a
1920px viewport and main buttons to 44px, with zero decorative border width
on tested buttons and cards. Clear button tint uses 2px backdrop filtering.
The native scrollbar is thin with a transparent track.

Browser checks confirmed changing ambient-canvas frames, working motion pause,
an intermediate wheel position before reaching the target, preservation of
Ctrl-wheel zoom and nested scrolling, static reduced-motion rendering, and
working navigation back to the home view. Automated WCAG A/AA checks on the
revised studio and home returned no violations or page exceptions. No page
overflow was observed at 360, 768 and 1024px. The detailed results are in
`artifacts/refinement-report.json`.

## V2 source update status on 2026-10-19

The v1 contract was previously deployed and the user completed live assessments
The public deployment and source collection were subsequently verified in artifacts/deployment-verification.json
On 2026-10-19 the public v1 contract source was independently fetched and matched the pre-update local source byte for byte

The new semantic-evidence-v2 source supersedes that implementation locally
Its production frontend build, syntax checks and official schema compatibility checks completed successfully
The existing model fixture was aligned with criterion line ranges and semantic validation
No automated suite was added or run for this update
The earlier 38 Node and 23 Python results remain historical v1 evidence
The new deployment at 0x0dA89d044b8568EA288adB1961a071eaFFE68432 and exact deployed-source comparison are verified in docs/verification/v2-deployment-equivalence.json
Its deployment receipt has successful finalized GenVM returns recorded in docs/verification/v2-deployment-receipt.json
Live signed v2 assessment scenarios remain required
The first actual v2 assessment finalized successfully but stored five UNKNOWN criteria and zero coverage
This is recorded as a response-handling limitation, not proof of a successful supported assessment
The local v2.1 source adds numbered source lines, exact-quote location recovery and explicit rejection of an entirely unusable response
Official schema compatibility for v2.1 is recorded in docs/verification/v21-schema-verification.json
The v2.1 replacement at 0xe3B88c60C5AB941e00C27Fb62Fed8Ea489E9cfD5 has verified source equivalence and successful finalized deployment receipts in docs/verification/v21-deployment-equivalence.json and docs/verification/v21-deployment-receipt.json
Live v2.1 assessment remains required
Two actual v2.1 attempts ended Undetermined and stored no assessment
The repeated disagreement records are preserved in docs/verification/v21-consensus-disagreement.json and docs/verification/v21-second-disagreement.json
The v2.2 correction retains source and semantic controls while replacing competing free-form assessment matching with independent per-criterion claim validation and rejection diagnostics
Its frontend build and official schema check succeeded
Automated suites were not run for v2.2 and its deployment and live verification remain pending
See REMEDIATION-V2.md for the changes and completion record
