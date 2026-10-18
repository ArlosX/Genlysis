# Genlysis on Vercel

Deploy the full project folder, including api and server
Uploading only dist cannot provide analysis or persistent reports

## Project settings

- Framework: Vite
- Node.js: 24.x
- Build command: npm run build
- Output directory: dist
- Fluid compute enabled, function maximum duration 300 seconds

## Storage

Create a Neon Postgres database in Vercel Storage and connect it to this project
Enable the Production environment when connecting
The integration should add DATABASE_URL, POSTGRES_URL or STORAGE_URL automatically
The default STORAGE prefix is supported without manual changes
Keep database credentials in server environment variables only

Deploy the corrected contracts/genlysis.py and verify its exact source first
See REMEDIATION-V2.md for the replacement deployment path

Required additional environment variable

```text
GENLYSIS_CONTRACT_ADDRESS=0xYOUR_VERIFIED_V2_ADDRESS
```

Optional server variables

```text
GENLAYER_RPC_URL=https://studio.genlayer.com/api
PUBLIC_ORIGIN=https://your-project.vercel.app
GITHUB_TOKEN=<server-only token if additional public API quota is needed>
```

Redeploy after connecting storage or changing environment variables
No wallet private key or seed phrase is required

## Deployment verification

Check /api/health, then create a public repository analysis
Open its share link in a second browser and export the report
Create a revision and confirm the original remains available
Request a GenLayer assessment and refresh after finalization
Redeploy once and verify the same report still opens

Local SQLite reports are not automatically copied to Neon
Existing onchain records remain on StudioNet but their corresponding reports
need an explicit data migration to become accessible through the online API

## Execution model

Neon stores reports, ownership hashes and shared request limits
Vercel waitUntil keeps each collection task attached to its invocation
Timed-out collection jobs become failed after five minutes when read
The user can submit a fresh analysis after a failure
Actual GenLayer assessment runs on StudioNet and is polled by the browser
SDK reads and receipt polling use the same-origin /api/rpc relay
The relay uses the fixed server RPC and allows only bounded read operations
Signing and transaction submission remain in the connected wallet
Temporary upstream transport errors are retried once for reads only

## Current validation

Local tests and production build passed
Live Neon persistence and Vercel execution require verification after connection
