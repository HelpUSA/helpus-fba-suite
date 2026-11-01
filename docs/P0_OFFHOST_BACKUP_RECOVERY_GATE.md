# P0 — Encrypted off-host backup recovery gate (G4)

Status: **BLOCKED — external private custody and independent recovery not yet proven**. This document contains no backup, credential, stock data, or encryption key.

## Separation of responsibilities

- `HelpUSA/helpus-fba-suite` is a **PUBLIC GitHub repository**. NEVER upload operational backups, even encrypted, or any key / password / DB URL / sensitive test log to this repository, commits, releases, Actions artifacts or issues.
- Snapshot encryption: AES-256-GCM with per-snapshot random salt and IV. Successful encryption on the same Windows computer is **not** disaster recovery.
- Maintain an encrypted archive at an access-controlled independent off-host destination (e.g. an existing approved private storage account within its free quota) and separately store its **dedicated** recovery key in a secure owner-controlled secret store. Never store a key in the same remote location as its snapshot.
- GitHub private storage is not automatically a suitable backup service. Storage, retention, confidentiality, access permissions, maximum file size, and billing limits must be evaluated before selection. An off-host backup must not rely exclusively on GitHub repository history or a Windows workstation.
- Prefer server-side allowlist, least-privilege credentials and encrypted transport; enable MFA and retention protections when supported. No new paid service or data transfer without specific owner approval.

## Definition of done

1. Owner approves exact private destination and confidentiality policy; administrator confirms that storage and transfer fit free-tier limits.
2. From source PostgreSQL, produce a **consistent** snapshot with a read-only, repeatable-read transaction (all eight tables from one database state). Generate an encrypted backup without printing secrets.
3. Copy encrypted snapshot to approved off-host storage using least-privilege write credentials; verify SHA-256 against local encrypted artifact and confirm that an authorized read-only recovery principal can retrieve it.
4. Keep decryption key **out of the repository and independently recoverable**, separated from the snapshot. Demonstrate a controlled recovery of the key without exposing it in logs.
5. Simulate loss of local backups/workstation: obtain the remote artifact and key from their independent custody locations using a clean recovery environment.
6. Restore only to a **new disposable staging database** using an exclusive staging role; verify target identity before any mutative SQL; assert exact row counts, SHA-256 checksums, referential integrity and application read paths.
7. Record sanitized evidence (timestamps, artifact SHA-256, restoration exit status, table count totals, permission assertions, free-tier cost check) in Issue #3; never include customer, supplier, stock, financial content, encryption keys or connection strings.
8. Prove a recovery-point objective and recovery-time objective that the business accepts. Document a schedule, retention policy, and periodic recovery re-test.

## Required safety gates

- **No mutative database tests against production.** Administrative PostgreSQL grant changes on production require an independently reviewed change request.
- Never treat a `staging_metadata` row alone as sufficient target isolation: verify a dedicated staging principal that cannot write to production.
- Never label G4 PASS until a **real off-host download and independent decrypt-and-restore drill** has succeeded.
- G5 must be independently corroborated by Vercel provider deployment metadata (deployment ID, branch, SHA, current alias), not inferred solely from GitHub HEAD.
- PR #2 is legacy and **must not be merged** as part of this gate. Keep Issue #3 open until explicitly signed off.

## Operator hand-off

The assistant can audit and modify repository code and documentation directly. Access to the local encrypted snapshot, local key vault, Neon credentials, and destination storage is a separate trust boundary. If this access is unavailable to the assistant, the Antigravity agent may execute **only** the specifically approved local/data-plane steps, provide sanitized proof, and refrain from publishing data in GitHub or ChatGPT.
