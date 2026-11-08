# Next 20 Hours: A Clearer Service for Clients and the Team

Status: proposed work, not yet implemented. Scope agreed with Carlos Matallana on November 5, 2026. Hours are estimates for development and verification; they are neither hours already worked nor a promise of payment.

## Objective

Improve the existing experience from choosing an invitation to receiving its link, and simplify management dashboard operations. The application already supports orders, quotes, manual payments, customization details, review, approval, publication, and guests. The objective is to reorganize these capabilities, improve their presentation, and correct instructions and copy.

The service will remain personalized: the client transfers payment through Nequi and contacts the team; the team verifies receipt outside the platform, records the corresponding status, and prepares the invitation. A client notification does not confirm receipt of funds. Delivery happens after review and fulfillment of the order's conditions, rather than immediately after a transfer.

## The Journey That Must Be Clear

Choose a design → request and confirm terms → receive payment instructions → transfer payment and contact the team → wait for verification → complete/submit information → review the invitation → receive the published link.

This outline explains the journey; it does not require blocking the early preparation of information already supported by the application. Each screen must show what the client can do, what they are waiting for, and who needs to act.

## Deliverables

| Workstream | Estimate | Pending Work | Acceptance Criteria |
| --- | --- | --- | --- |
| 1. Selection and request | 4 h | Improve the catalog/demo hierarchy and order creation: selected design, service inclusions, confirmed price or need for a quote, and an explanation of the next steps. | The selected design is preserved when requesting; the summary distinguishes an indicative price from a confirmed quote; required fields and errors are clear; the form works on mobile without overflow. Commercial policy is unchanged. |
| 2. Manual payment and client tracking | 4 h | Reorganize the order summary and its actions to explain Nequi, contacting the team, accepting terms, and waiting for verification. Prioritize one relevant portal action per status, using existing statuses. | “Pending payment,” “notification received,” and “payment verified by the team” are distinguished according to actual order data. A client notification never confirms receipt of funds. The client finds the next action or a clear waiting message and retains the ability to prepare information early. |
| 3. Invitation review and delivery | 4 h | Clarify preview, change requests, approval, publication, and delivery. Make each action's consequences visible and distinguish the client link from the guest link. | The preview is not presented as a delivered invitation. Approval does not mean publication. A published order highlights its link and sharing action; the private link is not offered as a guest link. Existing approval, version, and balance checks are preserved. |
| 4. Daily management | 5 h | Reorganize the order list and details to prioritize what needs attention: quoting, external payment verification, reviewing information, preparation, resolving changes, or publication. Reduce the prominence of headers and secondary panels and organize existing actions. | With several fictional orders, the operator identifies the pending task and responsible party. Order details make terms, payment status, and the next action easy to find without browsing irrelevant sections. Invalid actions remain blocked, with reasons explained where appropriate. |
| 5. Visual consistency, copy, and verification | 3 h | Complete a cross-screen review of headings, how clients are addressed, buttons, confirmations, and errors. Review modified screens on mobile and desktop, adapt necessary checks, and document the new journey. | Buttons name concrete actions, and confirmations explain what changed. Keyboard focus, legibility, and layout are reviewed at 390 px and 1440 px. Existing suites and the build pass; tests are added or adjusted only for modified behavior. A complete journey with fictional data is documented. |
| **Estimated total** | **20 h** | **Usability improvements to the existing product** | **Evidence: actual changes, comparable screenshots, verified scenarios, and test results.** |

Visual changes take place in the screens covered by workstreams 1 through 4; workstream 5 is the final cross-screen review, rather than a complete site redesign in three hours. If the scope exceeds the estimates, a smaller functional scope will be agreed upon and actual work will be recorded.

## Verification Scenarios

1. New request with a selected design and terms not yet confirmed.
2. Confirmed terms; client accepts and receives payment instructions.
3. Client reports a transfer, but the team has not yet verified receipt.
4. Team records a payment verified outside the platform; event information is still incomplete.
5. Information submitted and preparation assigned to the team.
6. Version sent for review; client requests changes or approves.
7. Approved design with an outstanding balance, if the order allows a deposit.
8. Approved and paid order; publication and delivery of the guest link.

These scenarios will use fictional identities, references, and payments. They do not require receiving money, connecting a Nequi account, or uploading real client data.

## Outside This Scope

- Payment gateway, bank reconciliation, in-app payment collection, and automatic transfer confirmation.
- Automatic product generation or delivery without team involvement.
- Changes to prices, revision policies, commercial terms, or turnaround times without an owner decision.
- Cloudflare migration, initial order implementation, or creation of tests that already exist: that work is already complete.
- Introduction of AI models, training, inference, or machine learning infrastructure.

## Technical Baseline and Preparation

On November 5, 2026, 15 logic/server tests, 8 Cloudflare/export tests, and the corresponding builds were verified. Workers packaging was a dry run. These results are the existing baseline, rather than pending deliverables in this roadmap. See [VALIDACION.md](docs/VALIDACION.md) and [REVISION-DE-USO.md](docs/REVISION-DE-USO.md).

Licensing, third-party asset review, history cleanup, and application form preparation are handled separately. The submission must honestly describe the product's purpose and its future use of client and guest data; this roadmap does not certify program eligibility or acceptance. Proposed sessions will use fictional data only.
