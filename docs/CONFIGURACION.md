# One Codebase, Demo and Production Configuration

The code is the same for public review and the live service. The difference lies in the configuration and data used, rather than two applications with separate changes.

## Demo Commands

- `pnpm build`: builds the frontend in `demo` mode and generates pages without private contact details.
- `pnpm build:worker`: builds and packages the Worker with `wrangler.jsonc` and `--dry-run`; does not deploy.
- `pnpm test:all`: runs the test scenarios and demo packaging with fictional data.

Demo mode does not load `.env` files in Vite and removes legacy public contact details during prerendering. It must not be used as the deployment configuration for the live business.

On the server, without `PAYMENT_INSTRUCTIONS` there is no default Nequi recipient, and `/api/config` reports `paymentsConfigured: false`. Existing orders retain their previously saved instructions; changing configuration does not rewrite them.

## Private Production Files

The following local files are excluded from Git:

| File | Contents and Purpose |
| --- | --- |
| `.env.production.local` | Public contact details for the live build (`VITE_BUSINESS_WHATSAPP`, `VITE_BUSINESS_EMAIL`, and `VITE_PUBLIC_ORIGIN`). May also retain Node server configuration. |
| `wrangler.production.jsonc` | Configuration for the live Worker, its resources, and variables such as `BUSINESS_WHATSAPP`, `BUSINESS_EMAIL`, and `PAYMENT_INSTRUCTIONS`. Must not contain passwords or API keys. |
| `.dev.vars` | Local development variables for Wrangler; not published or automatically included in deployments. |

Existing real values were preserved when this separation was made. Do not replace them when copying templates. For another installation, use `.env.example` and `wrangler.production.example.jsonc` as guides and configure your own values and resources.

The build contact `VITE_BUSINESS_WHATSAPP` and Worker contact `BUSINESS_WHATSAPP` must refer to the same business. The same applies to the public email address, if configured. The frontend and Worker public origins must match. If either changes, update both files before building the release.

## Checking the Live Build

```powershell
pnpm.cmd build:worker:production
```

This command selects `wrangler.production.jsonc`, builds the frontend in production mode, and performs only `--dry-run` packaging. It also reads contact details from `.env.production.local` during HTML generation. **It does not publish changes**.

The deployment command must use the same private configuration and a freshly verified live build. Do not publish `dist` generated in demo mode. Deployment and any remote variable changes are reviewed separately before execution. This preparation did not change the deployed website, D1, R2, or Cloudflare secrets.

## Public Data and Secrets

The WhatsApp number, contact email, and payment instructions shown to clients are application information. Removing them from the source code does not hide them from users of the live website.

`VITE_*` variables are included in the browser: they must never contain API keys, passwords, administrative tokens, or client data. Server keys are kept in Cloudflare secrets or the Node server's private environment. Do not copy real orders, photographs, databases, or logs into the repository.

Before pushing changes, check that Git is not tracking private files. Templates contain only names and examples; do not copy them over configured files without review. Cleaning earlier copies from history requires a separate procedure.

References: [Vite: Environment Variables and Modes](https://vite.dev/guide/env-and-mode), [Cloudflare: Secrets and Local Development](https://developers.cloudflare.com/workers/configuration/secrets/).
