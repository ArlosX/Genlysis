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
- Every validator independently fetches and hashes the sources and validates the proposed line references
- Independent per-criterion semantic checks verify the proposed status, substantive evidence support, reasoning, corrective action and verification procedure against the same fixed rubric
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

## Live response-shape follow-up

The first assessment transaction 0x96274a7269749c392b9956ba639b515ba39f63414be0e3dd8e398284a7355137 returned successfully and finalized
Its report 9089b164-f04a-40b5-9ac2-9a11076d1d16 stored UNKNOWN for all five criteria, score 0 and coverage 0
That receipt establishes a successful write but not useful positive assessment behavior
Raw model responses are not retained in the normalized receipt, so a precise root cause cannot be asserted from that record

The semantic-evidence-v2.1 correction now presents source lines with explicit numbers and the complete five-axis response shape
It derives missing or incorrect line locations only from an exact uniquely occurring quotation in the committed source
Missing, ambiguous or irrelevant quotations cannot bypass source or semantic validation
An unusable response that discards every criterion now fails explicitly without storing an apparent zero-quality assessment
A legitimate explicit UNKNOWN result remains an evidence-gap outcome
The official schema check accepted this exact corrected source, recorded in docs/verification/v21-schema-verification.json
The first response is preserved in docs/verification/v2-first-assessment-unknown.json
The v2.1 source requires a new live assessment before production publication

## Verified v2.1 replacement

The semantic-evidence-v2.1 deployment is 0xe3B88c60C5AB941e00C27Fb62Fed8Ea489E9cfD5
Its successful finalized deployment transaction is 0xe2307bde6d6f2551bf9e368d71eae1ce78004e6e18b447aae0d86b771d2ec797
The deployed source matches reviewed commit 3b0ff8db64dea79f79b6fbc292dacaa5dfeb26c8 byte for byte
Source SHA-256 is 6abda693b0e685b00f308c7d6da32376a7e1f81947f3c016d4930e2e74fc7323
Proofs are in docs/verification/v21-deployment-equivalence.json and docs/verification/v21-deployment-receipt.json
The local API was restarted and its configuration confirms this address
New user-signed assessment and the matching production update remain pending

## Observed v2.1 consensus disagreement

Transaction 0xf464e4e3e09a2d45bee01e144c0245b8f5adbc70eb46f020fa5988497cecb3a6 reached validator execution and ended Undetermined after four rounds and three leader rotations
The final-round validator receipts show disagreement without execution errors
Its later outer status FINALIZED did not mean an accepted assessment
An independent finalized read confirms report 79f6463b-13cb-4e4e-9d99-5fc5b5d08732 is registered and has no assessment
The receipt does not establish which particular semantic or criterion check caused each disagreement
The frontend now distinguishes this consensus outcome from network errors and successful leader execution
Status feedback includes the actual round and revealed vote count when supplied by StudioNet
The original registration remains available for a manually requested assessment retry
No contract changes are part of this frontend correction
The compact evidence is in docs/verification/v21-consensus-disagreement.json

## Repeated disagreement and v2.2 validation correction

Transaction 0x750a3ab7045b44f6eb9f58cb09ed8c987a4460e6cdf2b38d52f5221c4dc8ea04 again ended Undetermined after four rounds
Its report 150810c4-4369-4a3e-b1fa-077cd124bfa5 remains registered with no finalized assessment
Three final-round validators disagreed and two agreed without a reported validator execution error
The exact rejected code branch was not logged in that historical contract
Evidence is preserved in docs/verification/v21-second-disagreement.json

The previous validator required all five labels from a second freely generated assessment to equal the proposal before checking semantic compatibility of both complete narratives
That creates a joint agreement requirement across several qualitative judgments and recommendations
It is a code-level liveness risk, not proof that any particular prior rejection was incorrect

The semantic-evidence-v2.2 validator instead independently retrieves the committed sources, validates exact citations and evaluates each proposed claim against the same fixed rubric
It requires positive per-axis support and no contradiction for status, evidence, reasoning, action and verification
It does not require a separately generated competing narrative or preferred wording to match
Runtime ceilings, source commitments, authorization, deterministic score rules and the five public method signatures are retained
Each static or semantic rejection now produces a bounded GENLYSIS_VALIDATION diagnostic naming the affected axis
The validator does not accept conflicting or ungrounded claims merely to improve liveness

The production frontend build and official schema check succeeded for the prepared source
Exact schema source identity is in docs/verification/v22-schema-verification.json
The existing controlled fixture was aligned with the per-axis checker format
No automated test suite was added or run for this correction
The v2.2 source requires replacement deployment, source-equivalence verification and a successful live assessment before acceptance or production publication

## Verified v2.2 replacement

The deployed replacement is 0xa3475354FC960E052D126677ce9E9F52288d3F21
Its deployment transaction 0x3ef4682f3ee4f22cba0e590328c258e17299725b6c2dc77fcbac0cf58a037008 finalized with successful GenVM returns
Deployed source matches reviewed commit 790acd4b5e2a441708aee1e853c26f750923f08f byte for byte
Source SHA-256 is 6433ca7a48c444dcf173053b1d0f561cccb660793c2b9dbe0849cd986150aa12
The finalized protocol reports semantic-evidence-v2.2 and independent-claim-validation
Proofs are in docs/verification/v22-deployment-equivalence.json and docs/verification/v22-deployment-receipt.json
Local API configuration uses the verified address and was restarted
The existing reports remain in the database and can be registered against the new contract
Live v2.2 assessment and production publication remain pending

## Limits

Semantic support checks are qualitative model judgments and do not guarantee immunity to manipulation
The contract authenticates selected committed source bytes, not actual runtime receipts, CI execution, repository ownership, deployed-source identity of the assessed project or official Builder points
Failures of external evidence hosts or StudioNet remain visible and must not fabricate a successful assessment
