# Genlysis evidence validation update

Prepared 2026-10-19
The current public deployment still uses the historical v1 contract until the replacement is deployed and configured

## Preserved structure

The five assessment axes and weights remain 25, 25, 20, 15 and 15
The public repository intake, source budgets, immutable manifests, report IDs, database model, revision history and wallet registration flow are preserved
The existing page structure, colors, typography and motion are preserved
All five public contract methods retain their names and argument signatures
Protocol and assessment version markers distinguish new verification from historical results

## Corrected trust boundaries

- Exact criterion quotations now include validated start and end lines
- Model fields require the expected types and lengths instead of being converted from arbitrary objects
- Malformed or missing evidence becomes UNKNOWN with safe explanatory fields
- Every validator recomputes the criterion statuses and validates the leader's line references
- A separate semantic check requires substantive support for both assessments and compatible reasoning, actions and verification procedures
- Status-label agreement alone cannot authorize a supported result
- Unsupported, contradictory or unclear semantic support rejects the assessment without writing a result
- Integration and resilience cannot become PASS solely from committed source evidence
- Their source-only ceiling is PARTIAL, giving this evidence level a maximum of 80/100 with unchanged criterion weights
- Public results explicitly record community-submitted provenance rather than GitHub maintainer ownership
- Path validation rejects empty segments, dot segments, traversal, .git, .env and duplicate source paths
- The backend checks finalized identity, protocol, support version, evidence lines, commitment and deterministic score before attaching an assessment
- Workflow and deployment schema observations are labeled as observations in reports and existing report views

## Versioning

- Contract protocol genlysis-v2
- Assessment validator semantic-evidence-v2
- Scoring weights genlysis-readiness-v1
- Evidence level committed-source

The assessment version changes how evidence supports the unchanged weighted scoring rules
Historical source-only scores are not represented as verified v2 outcomes

## Deployment path

1. Deploy contracts/genlysis.py in GenLayer Studio with no constructor inputs using the user's existing wallet
2. Independently compare the new deployed source with the exact committed file using scripts/verify-deployment.mjs NEW_ADDRESS
3. Configure GENLYSIS_CONTRACT_ADDRESS with the verified new address locally and in Vercel
4. Publish the matching frontend and backend together
5. Create or re-register a report on the replacement contract and inspect its finalized assessment
6. Verify supported evidence, missing evidence, irrelevant genuine quotations, incompatible reasoning, malformed model output, source substitution and unauthorized revision behavior

Existing stored reports and revision links are preserved
The replacement contract has separate storage and existing reports require registration there before a new assessment
Pending hashes from the old contract should not be used as proof of v2 registration or assessment
The database connection and report ownership tokens do not need to change

## Verification status

The frontend production build completed successfully
JavaScript and Python syntax checks completed successfully
The official Studio schema service accepted the revised public method schema
The existing local contract fixture was updated for line references, the semantic response and source-only score limits
No automated test suite was added or run during this change
The historical test counts in TEST-REPORT.md do not establish v2 behavior
The replacement deployment and source-equivalence verification are recorded below
Live user-signed v2 assessment transactions remain required

## Verified replacement deployment

The replacement is deployed at 0x0dA89d044b8568EA288adB1961a071eaFFE68432
Its deployment transaction 0x4172f83d98c4b738fddbb560d5e528c8594ffbeac4c2682f5bc96c70013eacef is FINALIZED with successful GenVM returns
Deployed source matches reviewed commit 6bcf6a2b85c463f5fb306f44046f0cd409c63bc5 byte for byte
Both source SHA-256 values are 21348c729a2b0394c7f265770bba51a7ffcbdedf577701ebb879197f1406f538
The finalized protocol reports genlysis-v2 and semantic-evidence-v2
Machine-readable proofs are in docs/verification/v2-deployment-equivalence.json and docs/verification/v2-deployment-receipt.json
Local environment configuration uses the new address
Live v2 assessment signing and the matching Vercel publication remain to be completed

## Limits

Semantic support checks are qualitative model judgments and do not guarantee immunity to manipulation
The contract authenticates selected committed source bytes, not actual runtime receipts, CI execution, repository ownership, deployed-source identity of the assessed project or official Builder points
Failures of external evidence hosts or StudioNet remain visible and must not fabricate a successful assessment
