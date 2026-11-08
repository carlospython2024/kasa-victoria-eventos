# Initial User Experience Review

Date: November 5, 2026. Preparation document for defining future work; it does not describe an already implemented redesign.

## Need Expressed by the Owner

Improve how clients choose, purchase, and receive their invitations; simplify the management dashboard; improve visual presentation and correct the copy. The priority is to make the service and daily operations understandable.

## Observed Baseline

The local screenshots `flujo-cliente.png` and `flujo-gestion.png`, the operations document, and the current code in `src/workflow/Workflow.tsx` were reviewed. The screenshots are existing references, rather than a new browser test or client study. Observations must be checked against a current walkthrough using fictional data.

The application already has design selection, persistent requests, quotes and acceptance, payment notification and verification, customization details, review, approval, publication, and guest responses. It also has statuses, a progress indicator, next-step messages, and administrative actions restricted by status. Future work must improve their clarity, rather than present these capabilities as new.

## Problems and Hypotheses to Validate

| Area | Current Evidence | Improvement to Design | How to Verify |
| --- | --- | --- | --- |
| Client's next action | The portal shows a next-step message and five tabs; in several statuses, the message directs clients to Payments or to submit information without an associated primary action in that same card. | One prominent action leading to the correct place, or an explicit waiting state when it is the team's turn to act. | Walk through each status with fictional orders and check that the primary action matches what can actually be performed. |
| Price and service | Quote, acceptance, payment, and event details are parts of the same journey; this is not an instant download. | Explain what is being purchased, what amount is confirmed, what is missing, and when delivery happens, at the appropriate moment. | An order's summary matches its saved terms and does not show a reported payment as verified. |
| Confirmations | The generic client action function responds “Listo. Tu pedido se actualizó.” (“Done. Your order was updated.”); the management dashboard uses “Pedido actualizado.” (“Order updated.”). | Messages naming the action and its consequence: information submitted, payment notification received, changes requested, or publication completed. | Each important action has a specific confirmation; errors and pending operations remain visible. |
| Review and delivery | Clients see “Revisión y entrega” (“Review and delivery”); statuses distinguish review, approval, and publication. | Clearly distinguish a preview, an approved version, and an invitation ready to share. | An order under review is not presented as delivered; a published order exposes the guest link without confusing it with private access. |
| Daily management | The management screenshot shows a large header and counters before search and the order list. Details combine quotes, payments, and actions. | Prioritize orders requiring intervention and concise order details with the next action and blockers. | With several fictional orders, operators identify what to verify, prepare, correct, or deliver without opening unnecessary panels. |
| Tone and labels | “Los detalles de su día” (formal address), “Tu pedido, en números” (informal address), and promotional headings coexist within the operational workflow. | Use a consistent form of address, informative headings, and buttons with concrete verbs; retain brand tone where helpful. | Review a copy inventory and the complete journey on mobile and desktop. |
| Small screens | Earlier mobile screenshots exist, but a new design of this scope has not been validated. | Improve hierarchy, spacing, and grouping on modified screens. | Check legibility, navigation, focus, forms, errors, and actions without overflow at the agreed sizes. |

## Confirmed Product Decision

On November 5, 2026, Carlos confirmed that the personalized service will remain. Clients transfer payment through Nequi and contact the team; the team checks receipt outside the platform and prepares the invitation. The platform must explain this process and reflect the status recorded by the team, without presenting a client notification as bank verification.

A payment gateway and automatic delivery are possible later projects; they are outside this 20-hour scope. This does not claim that the program prohibits all payment gateways: it is a scope decision for the current project.

## Constraints on Future Work

- Access, payment, guest allowance, and publication rules must retain their checks.
- Use fictional data and payments only during development testing.
- Do not change prices, commercial terms, revision counts, or turnaround times without an explicit owner decision.
- Do not attribute conversion or satisfaction improvements to a redesign without measuring them.
- The 23 existing tests and the build are the verified technical baseline; additional checks must correspond to changed behavior.
- The UX improvement does not resolve uncertainty about project eligibility under the personal-data exclusion. That purpose must be explained in the application.

The [20-hour roadmap](../ROADMAP.md) specifies screens, deliverables, and acceptance criteria. It does not list the Cloudflare migration or existing functionality as pending work.
