# Verification record

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

## Remaining live checks

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
