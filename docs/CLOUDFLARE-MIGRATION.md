# Cloudflare Migration — Pre-Deployment Review

Status: local implementation in `feature/cloudflare-migration`. The account already has D1 `kasa-victoria` and private R2 `kasa-victoria-bucket`, created by the user. The `0001_initial.sql` schema has already been applied to that D1 database, and orders, photos, and responses were verified to remain empty. No client data has been imported or DNS changed. The first Workers test deployment was performed with user authorization on October 30, 2026.

## Architecture

**Workers with Static Assets + D1 + R2** is used under a single origin. Workers publishes the same frontend that could be hosted on Pages and handles `/api/*`, private pages, and invitation links. This avoids the need for CORS, cross-domain cookies, or a second Pages application. The frontend retains its 18 prerendered pages, music, and designs.

- `worker/application.ts`: asynchronous port of the `server/app.ts` workflow; orders, manual Nequi payments, review, publication, private guests, RSVP, CSV, and inquiries.
- `worker/store.ts`: grouped writes with `D1.batch()`. A version check within the same batch rejects concurrent changes and rolls back audit/email changes. Payment references are globally unique; uploads check allowance and stage within the batch.
- `worker/index.ts`: Fetch entry point, invitation pages with metadata, HTTP security, and a scheduled email/cleanup task every five minutes.
- R2 remains **private**. Photos pass through authorization at `/api/media/:id`; do not enable `r2.dev` or a public bucket domain. Existing paths and keys are preserved.
- `migrations/0001_initial.sql`: SQLite-equivalent schema and D1 indexes. Public lookup uses a slug index rather than reading all orders.
- The original Node server remains available as a local fallback. When changing business rules, keep both workflows and their tests synchronized.

## Local Review (Without a Cloudflare Account)

Node 24 or later and pnpm 11. Versions are pinned in the lockfile. `workerd` and `esbuild` need to run their installers, authorized in `pnpm-workspace.yaml`.

```powershell
pnpm install --frozen-lockfile
pnpm test:all
pnpm db:migrate:local
if (-not (Test-Path .dev.vars)) { Copy-Item .dev.vars.example .dev.vars }
pnpm dev:cloudflare
```

Open `http://localhost:8787`. `.dev.vars` is copied only if it does not already exist; preserve any existing configuration. The code allows HTTP only for localhost/127.0.0.1. Production requires HTTPS. Administrative setup from localhost is enabled at `/gestion`; production requires the secret setup token.

`pnpm build:worker` builds the frontend, checks TypeScript, and runs **only** `wrangler deploy --dry-run`. It does not publish. The Cloudflare suite runs the packaged code in workerd with local D1 and R2; it does not simulate these stores using in-memory maps.

## Existing Data: Offline Package

Before the final cutover, stop writes on the previous server and create a backup. The exporter takes a consistent SQLite snapshot using its backup API and copies referenced photos. It does not modify the original database or contact Cloudflare. Keep the server paused while copying photos so the package represents the same point in time.

```powershell
pnpm export:cloudflare --source var --out var/cloudflare-review-01
```

If emails were already being sent from a previous origin, add both parameters to update only the links stored in email:

```powershell
pnpm export:cloudflare --source var --out var/cloudflare-review-02 --old-origin https://dominio-anterior.example --origin https://dominio-nuevo.example
```

The output directory must be new, and its parent folder must exist. It contains `snapshot.sqlite`, `data.sql`, `manifest.json` with counts and SHA-256 hashes, and `uploads/`. This is private information; keep it outside Git and the public directory. A failure leaves an incomplete package: correct the cause and repeat in a new directory. Do not import packages without a final manifest.

Orders, published versions, audit history, photographs, guests, responses, songs, inquiries, emails, and still-valid client sessions are preserved. The payment reference index is rebuilt, and duplicates are rejected. Temporary rate limits and administrative sessions are omitted.

**Administration:** the previous server's scrypt hash is not imported. Workers uses PBKDF2 SHA-256 through Web Crypto, a random salt, and constant-time comparison. After cutover, set a new password using `ADMIN_SETUP_TOKEN`; remove that secret afterward. Do not edit or delete the administrator in the original database. Private client links remain valid; cookies from the previous domain do not carry over to a new domain.

Test the package against empty local storage (if local data already exists, use another `--persist-to` directory in ALL commands and in `wrangler dev`):

```powershell
pnpm exec wrangler d1 migrations apply kasa-victoria --local
pnpm exec wrangler d1 execute kasa-victoria --local --file var/cloudflare-review-01/data.sql
pnpm import:media:cloudflare --package var/cloudflare-review-01
```

The photo importer verifies all sizes and hashes before starting; it uses LOCAL R2 by default. Do not overwrite a D1 database containing existing data. Review manifest counts, photographs, private links, payments, and responses during the trial. Importing SQL and R2 is not a single transaction: complete both before opening traffic.

## Deployment Procedure — First Test Deployment Completed

1. Review changes, tests, Worker name, domain, branding, and payment details. `business.demo` still reflects the original commercial configuration; review prices and copy before opening sales.
2. Create a D1 database and a private **Standard** R2 bucket in the chosen account. Replace the example `database_id` and names in `wrangler.jsonc`. Do not put credentials in Git.
3. Configure `PUBLIC_ORIGIN` with the final HTTPS domain without a trailing slash. Build with `VITE_PUBLIC_ORIGIN` set to the same domain; this generates canonical, Open Graph, and public robots metadata. Without this value, public pages remain in noindex mode. `pnpm build:worker` automatically takes the domain from `PUBLIC_ORIGIN` and uses it in both Vite and prerendered HTML; there is no need to configure a second variable manually.
4. Create a random `ADMIN_SETUP_TOKEN` using `wrangler secret put ADMIN_SETUP_TOKEN`. Optionally configure `BUSINESS_EMAIL`, `EMAIL_FROM`, `RESEND_API_KEY`, and `PAYMENT_INSTRUCTIONS`. Only `VITE_PUBLIC_ORIGIN` is public; never prefix secrets with `VITE_`. Resend requires its own account/verified domain and quotas.
5. In the EMPTY REMOTE database, apply migrations and then the approved final package. The commands are `pnpm exec wrangler d1 migrations apply kasa-victoria --remote` and `pnpm exec wrangler d1 execute kasa-victoria --remote --file <paquete>/data.sql`.
6. Import photos with `pnpm import:media:cloudflare --package <paquete> --remote`. If the bucket changed, add `--bucket <nombre>`. Validate counts and objects before allowing traffic. Remote commands in this section require prior review and are not part of the tests.
7. Only after review, manually run `pnpm exec wrangler deploy`. No automatic GitHub deployment has been added. Configure domain/DNS and, if using only a custom domain, decide whether to disable `workers_dev`.
8. Create the administrator with a new password, remove `ADMIN_SETUP_TOKEN`, and check sessions, private upload/read access, the Nequi workflow, public/private invitations, RSVP, CSV, and scheduled email. Confirm that a request with another Origin receives 403. Review actual CPU usage on Workers Free: local tests do not validate remote quotas.

Emails are processed in batches of five every five minutes if Resend is configured. Failures remain visible in the management dashboard and retain a manual retry option. The idempotency key is preserved per message.

## Cost and Limits

The architecture may remain within free quotas, but **R2 is not a zero-dollar spending cap**: it charges for overages. Do not enable Workers Paid for this migration. Review D1, Workers, and R2 metrics and billing alerts before opening traffic; alerts do not block spending. No automatic rules are created to delete client photos.

Official references consulted on October 30, 2026:

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/): free static requests; requests executing the API count as Workers.
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/): Free includes 100,000 daily requests and 10 ms CPU per HTTP invocation. Local quotas are not equivalent to production.
- [D1](https://developers.cloudflare.com/d1/platform/pricing/): Free includes 5 million rows read/day, 100,000 written/day, and 5 GB total. Each free database has additional individual limits.
- [R2 Standard](https://developers.cloudflare.com/r2/pricing/): 10 GB-month, 1 million Class A operations, and 10 million Class B operations/month; free egress. Billable overages.
- [D1 Transactions Through Batch](https://developers.cloudflare.com/d1/worker-api/d1-database/), [R2 API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/), and [Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/).

## Rollback

Do not delete the previous server or its backups. Before accepting new writes in Cloudflare, the domain can be restored to the previous origin and its intact database started. After receiving new orders or responses in Cloudflare, stop writes and export/reconcile D1 and R2 before switching back; changing DNS alone would lose those changes. Rolling back Workers code does not roll back D1 or R2 data.

## Validation Performed

- 15 original tests and 8 Cloudflare/export tests passed (23 total). They cover the full workflow, isolation, private photos, expiration, CSV, login/cookies/CSRF, version collisions, and Nequi reference collisions across different orders.
- Export and import of a test package, including photo hashing and upload to local R2 in isolated temporary storage. No real client data was exported or uploaded.
- TypeScript/React build, 18 prerendered routes, and Worker packaging through a dry run. A build with a public test domain also checked canonical/robots metadata.
- SQL migration applied to local D1; HTTP checks with Wrangler for home, management, API, nonexistent pages, redirects, and security headers.
- Production quotas/CPU have not been measured, and real emails have not been sent. The Resend flow preserves the original mechanism and requires credentials and later testing.

## Selected Initial Address

The account subdomain was verified through a read-only query, and `https://kasa-victoria-eventos.invitaciones-kv.workers.dev` was selected. The address is already in `PUBLIC_ORIGIN`; the Worker is already published under that name. A random setup token was prepared in `var/cloudflare-production-secrets.json`, excluded from Git. The token was uploaded as a Cloudflare secret during the authorized deployment; the user must use it to create their password at `/gestion`. Remove the setup secret once administration is configured.

## First Test Deployment — October 30, 2026

- URL: https://kasa-victoria-eventos.invitaciones-kv.workers.dev
- Version: `c4761ec5-030f-437f-915b-5fdc964593d6`. D1 and R2 connected; scheduled task every five minutes.
- Remote verification: home, invitation creation, management, and API return 200; a nonexistent route returns 404.
- A synthetic order without real personal data was created, and the client session, D1 persistence, and PNG upload/read in R2 were checked. A visitor without a session received 401 for the order and photo. A different origin received 403.
- The synthetic order, its session, audit history, pending email, metadata, and R2 object were removed. Their absence was verified. No local project data was imported.
- Administrative setup protected by a random token: an incorrect token returned 403. The user still needs to set their password at `/gestion`; login with a real password has not yet been tested in production.
- Real email remains pending configuration and verification. The application retains the prices, payment instructions, and commercial mode from the original configuration; this deployment is for testing.

## Subdomain Correction to invitaciones-kv — October 30, 2026

The user changed the account subdomain to `invitaciones-kv`. `PUBLIC_ORIGIN` was updated, the frontend rebuilt, and version `2f4f0c26-a6a0-4b78-9ab2-01e4ea01d0cb` published. Responses of 200 were verified for home, invitation creation, configuration, and access status; the API confirms the new HTTPS origin. D1 and R2 were preserved.
