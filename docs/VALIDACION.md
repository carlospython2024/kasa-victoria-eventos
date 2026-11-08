# Verification Log

Entries describe what was verified on each date. For the current status, also read later verification entries and `CLOUDFLARE-MIGRATION.md`; limitations in an older entry do not imply that the work remains pending today.

## Workflow Verification · October 28, 2026

- TypeScript: no client or server errors.
- Fifteen passing tests: business logic, authentication, request origins, order isolation, private photos, configurable initial payment, duplicate references, approval, publication, CSV, personal links, guest allowances, revocation, and expiration.
- Browser test with a separate database: management access, client review, approval, publication of an invitation with its data, attendance submission, and retrieval of that response in the order.
- Public build: 18 prerendered routes plus an entry point for dynamic routes.
- Request form checked on desktop and at 390 px using a responsive viewer: no overflow or broken images.
- Actual backup of the test database and its images: the copy was opened, and its orders and photos were checked.
- QA data is in `tmp/workflow-qa/`. The live dashboard in `var/` retains zero orders and has no administrative password set.

Screenshots in `docs/screenshots/`: `flujo-gestion.png`, `flujo-cliente.png`, and `flujo-solicitud-movil.png`. Names and payments in these screenshots are fictional test data, rather than real clients or charges.

## Verification Limitations

No real Nequi payment was collected, and no external emails were sent. The email adapter is prepared, pending credentials and a verified sender. The server was checked on Windows with Node 24; neither the Docker image nor a public deployment with an HTTPS domain was run.

Before launch, the final brand, domain, persistent hosting, email, and general terms still need to be finalized by the business. Current payments are verified manually, and each quote must be confirmed before collecting payment.

## Local Verification · November 5, 2026

Carlos ran these commands on Windows with Node.js 26.13.0 and pnpm 11.28.11 and shared the results:

- `pnpm test`: 15 passing tests, with no failures or skipped tests.
- `pnpm build`: successful TypeScript checks and Vite build; 18 prerendered routes. This run used local mode without a public domain.
- `pnpm test:cloudflare`: successful client and Worker builds; 8 passing tests, with no failures or skipped tests. The build used the HTTPS origin configured for Workers.
- Wrangler packaging ended with `--dry-run: exiting now.`; this command did not publish a new version or independently validate remote service behavior.

There were 23 passing tests across the server/logic and Cloudflare/export suites. Cloudflare tests use Miniflare and local test resources. These results do not certify real email delivery, payments, production recovery, performance under real traffic, or compatibility with all Node versions.

The Cloudflare build and test deployment already exist; they must not be proposed as functionality yet to be implemented. Any future work must specify which additional behavior or missing scenario will be addressed.

### History Secret Scan

Gitleaks 8.30.1 scanned accessible local references: 9 commits and approximately 1.10 MB of content. It detected no secrets. The tracked-path review found only the `.env.example` and `.dev.vars.example` templates, with no tracked `.env`, `.dev.vars`, SQLite databases, or files from `var/` under the inspected patterns.

This result is a bounded check, rather than a guarantee of the absolute absence of secrets or personal data. It does not cover all ignored files, remote data, unreachable Git objects, or third-party asset rights. Removing MP3 files from the current tree also does not remove their historical versions.

### Subsequent Separation of Public and Private Configuration

Hardcoded contact details and Nequi recipients were removed from the code and public operational documentation. Existing values were preserved in local files excluded from Git, without changing the remote application.

`pnpm test:all` passed 19 logic/server/configuration tests and 9 Cloudflare/export tests: 28 in total. New checks include contact isolation in demo mode, public production configuration without loading server keys into prerendering, explicit variable precedence, and contact/payment configuration on both servers.

`pnpm build:worker:production` also passed with a dry run. The browser bundle and prerender configuration were verified to match the contact retained for production. The demo build was inspected and did not contain the known numbers or account holder. These checks do not imply a remote deployment or a trial with real money or clients.

### Publication of the Preparation Package

With Carlos's authorization, the public main branch was updated on November 5, 2026, with the prepared package `a3cacea`. The remote commit and file tree were verified through GitHub: README, MIT LICENSE, and ROADMAP present; private configuration files, MP3 files, and removed references absent. Scanning the ten prepared commits detected no secrets.

The usual working folder was synchronized with that history while preserving its private files and local audio. Previous metadata and history were backed up outside the repository. No application deployment was performed, and D1/R2 were not modified as part of this Git publication. The roadmap's UX scope remains pending, and Alignerr acceptance is not confirmed.
