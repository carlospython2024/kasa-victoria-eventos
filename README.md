# Siempre · Invitations and Order Management

React and TypeScript with a Node.js 24 server and SQLite. Includes ten wedding designs, five additional celebration types, and the Ciruela editorial visual identity. “Siempre” remains the working name.

## Music in a Fresh Checkout

The three Pixabay MP3 files are installed separately by following [docs/AUDIO.md](docs/AUDIO.md). Their paths and playback functionality are preserved; the original files are not included in the public source code. If you already have the MP3 files locally, this change preserves them. On November 5, 2026, they were also removed from the published history of the main branch. Music retains its own license and is not covered by the code license.

## License and Assets

The project's own code is distributed under the [MIT License](LICENSE), in the name of Carlos Matallana. Music, fonts, and dependencies retain their own licenses and notices; see [docs/RECURSOS.md](docs/RECURSOS.md). Copies of third-party reference pages and images were kept outside the repository and removed from the current tree and the published history of the main branch.

## Upcoming Product Work

The [20-hour roadmap](ROADMAP.md) proposes improvements to design selection and requests, manual payments and tracking, review and delivery, the management dashboard, and visual and copy consistency. These are planned improvements to the existing workflow; the service will remain personalized, and Nequi transfers will be verified outside the platform. The scope does not include a payment gateway or automatic delivery.

## Demo and Live Business Configuration

The public code does not contain real Nequi recipients or contact details as default values. `pnpm build` and `pnpm build:worker` generate the demo version; `pnpm build:worker:production` uses the business's private configuration to build and package without deploying. See [docs/CONFIGURACION.md](docs/CONFIGURACION.md) before preparing a release. Improvements share the same codebase; data and secrets are configured separately.

## Getting Started

On Windows, double-click `Iniciar.cmd`, or run `.\Iniciar.cmd` from PowerShell. This option works when PowerShell blocks `.ps1` files, without changing the execution policy.

```powershell
.\Iniciar.ps1
```

Open http://127.0.0.1:5173. The same process serves the website and its API; orders are stored on the server.

| Route | Purpose |
| --- | --- |
| `/` | Public catalog |
| `/crear?modelo=jardin-botanico` | Create a request with the selected design |
| `/gestion` | Inquiries, orders, payments, and delivery |
| `/pedido/ID` | Private client workspace |
| `/vista/ID` | Private preview |
| `/i/nombres-identificador` | Published invitation |
| `/privacidad` | Information use and contact details |

On your first visit to the management dashboard (Gestión), create your own password with at least 12 characters. There is no default password. Initial setup is only allowed from the local machine; in production, it requires the server setup token.

## Complete Workflow

1. The client selects a design, provides their details, and proposes an expiration period of 30, 90, 180, or 365 days after the event.
2. A persistent order with a private link is created. The client saves their link and can complete the information in three sections.
3. The team confirms the price, initial payment, expiration period, revision rounds, and turnaround time in the management dashboard. General prices remain indicative; other celebrations are quoted individually.
4. The client accepts the terms and transfers payment through Nequi, following the order's confirmed instructions. The business contact and payment recipient are configured separately; this documentation does not publish real account details.
5. “Ya pagué” (“I've paid”) records a notification. The team checks the incoming payment and records its amount and unique reference. The client's notification does not confirm receipt of funds.
6. Once the initial payment is verified, the client submits their information. The team validates it, and the agreed turnaround period of 3 to 5 business days begins.
7. The team prepares the invitation and sends it for review. The client approves it or requests changes from their private workspace.
8. Publication requires an approved version and full payment. A snapshot is preserved: editing the draft does not change the published invitation until it is approved and published again.
9. The client shares the link and checks attendance, meal preferences, transportation, and song requests. Responses can be downloaded as CSV.

The default initial payment is **100%**. It can be changed to a deposit for each order before any payments are received. Revision rounds default to two, but can be edited and must be confirmed in each quote; the general business policy has yet to be defined.

## Customization and Guests

Editable details include names, date and time in Colombia, venues, addresses, schedules, photos, story, dress code, gifts, music, accommodation, menu, transportation, and hashtag. Weddings use the first photo as the cover. Other celebrations retain their styles. The three MP3 files were supplied by the user.

After publication, the Guests section (Invitados) generates personal links with a name and guest allowance. Responses can be updated even from another device. Links can be renewed or revoked. Customization settings allow personal links to be required: in that mode, the general link does not open the event.

For the general link, a cookie identifies the browser's response. Someone responding from another browser may appear as a duplicate; the dashboard warns about this. Use personal links to manage guest allowances.

The private **order** link manages information and responses: never send it to guests. If the client loses it, the team verifies their identity and generates a new one in the management dashboard. Renewing it revokes previous access.

## Contact and Email

The public inquiry form saves real inquiries under Gestión → Consultas (Management → Inquiries). Transactional email uses a persistent queue and a Resend adapter. If the domain, sender, or key is missing, no email is sent, and the dashboard indicates this. WhatsApp buttons prepare the message text; the person decides whether to send it.

Server environment variables for email:

- `PUBLIC_ORIGIN`: public HTTPS origin, without a path or trailing slash.
- `BUSINESS_EMAIL`: business mailbox.
- `EMAIL_FROM`: sender verified with the provider.
- `RESEND_API_KEY`: private key, never exposed to the browser.

Failed emails can be queued again. “Aceptado por proveedor” (“Accepted by provider”) does not mean read. In local mode, save the private link displayed when the order is created.

## Data and Backups

Records are stored in `var/siempre.sqlite` and photos in `var/uploads/`, outside the public folder. They persist after the server stops. The business dashboard starts empty: tests use a separate database.

```sh
node --env-file-if-exists=.env.local --import tsx scripts/backup.ts
```

The backup uses SQLite's backup functionality and includes photos and a manifest in `var/backups/`. Keep another copy outside the server with restricted access. To restore, stop the application and restore both the database and `uploads` from the same backup into a new folder; start with `DATA_DIR` pointing there. Test restoration separately before relying on it.

Expiration disables public access. **It does not automatically delete private records.** The retention policy and the identity of the party responsible for the data must be finalized before launch.

## Build and Deployment

Requires Node.js 24+. For development, you can copy `.env.example` to `.env.local` without committing it to the repository.

```sh
pnpm install
pnpm test
pnpm build
pnpm start
```

npm also works. `npm run dev` uses Vite and the API. `npm start` serves the build and API from the same origin, with audio range requests and public metadata. `Iniciar.ps1 -Produccion` builds and serves on port 4173.

**Deploying only `dist` to static hosting does not enable this workflow.** It requires a Node 24 instance behind HTTPS, persistent storage for `DATA_DIR`, process restart management, and external backups. SQLite must not be stored on ephemeral storage or in independent replicas.

Production environment variables:

- `NODE_ENV=production`
- `PUBLIC_ORIGIN=https://dominio-real`
- `ADMIN_SETUP_TOKEN`: long, random token for initial setup; remove it afterward.
- `DATA_DIR`: persistent volume separate from the deployed code.
- `HOST`, `PORT`: interface and port, defaulting to 127.0.0.1:4173.
- `PAYMENT_INSTRUCTIONS`: overrides the Nequi instructions.
- The email variables listed above, when the provider is enabled.

The `Dockerfile` uses Node 24 and `/data` as a volume. It requires a domain, setup token, and persistent storage. The Docker build has not been run on this machine.

`src/config.ts` contains branding, contact details, and prices. Also configure `site.publicUrl` with the domain and rebuild to generate public catalog metadata. Orders and invitations have `noindex`.

## Operational Limitations

- Nequi payments are verified manually. There is no automatic reconciliation, payment collection within the website, refund processing, or electronic invoicing.
- The management dashboard uses shared team access; the history distinguishes Team/Client, without individual user accounts.
- Content is edited within the designs; there is no drag-and-drop editor.
- Personal links grant access to anyone who has the link and can be forwarded.
- Limits: eight photos, 5 MB per photo, 40 files per order, and 500 personal links.
- The server operator is responsible for recovering access to the management dashboard.
- The final name, domain, hosting, email, general pricing, and data retention policy still need to be defined before public launch.

## Verification

`pnpm test` covers pricing and the HTTP workflow: order isolation, authentication, request origins, photos, payments, duplicate references, approval, publication, expiration, CSV, guest allowances, and revocation. `pnpm build` checks client and server types and generates 18 public/demo routes and the dynamic entry point.

Visual tests use `tmp/workflow-qa/`, never `var/`. `qa.html` allows viewport sizes to be checked during development. See `docs/FLUJO-OPERATIVO.md` and `docs/RECURSOS.md`.

## Cloudflare (Local Review)

A migration to Workers with Static Assets, D1, and R2 is prepared. See the [migration guide](docs/CLOUDFLARE-MIGRATION.md). Run `pnpm test:all` to validate both environments. There is no automatic deployment.
