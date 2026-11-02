# P1 FX — Parecer independente de segurança e proveniência (revisão privada de código)

Data: 2026-11-02. Baseline: `47b85fcc9fcabf7e82cc8c7a79a22aac08ab335e`.
Referências: PR #10, Issue #9, Ordem 049. Escopo: revisão de código GitHub **sem conexão ao Neon**. Esta análise não invalida os resultados locais relatados de 62/62, 14/14, lint/build OK e auditoria dos saldos; apenas não os reexecuta.

## Achados prioritários

### P1-01 — integridade da evidência: metadados não são comprovação
A migração proposta `scripts/migrations/003_fx_provenance_staging_review.sql` exige `evidence_ref`, `evidence_sha256` e `verified_at`, mas nenhum deles prova a obtenção do documento de BCB/settlement por canal autenticado. O trigger também não verifica a aprovação de `import_batch_id` em uma tabela de lotes imutável, nem valida a integridade do hash contra bytes obtidos de fonte confiável. **Não liberar REALIZADO USD em produção com base apenas no preenchimento desses campos.**

Ação: introduzir fluxo autenticado de coleta e verificação documental em papel separado, com tabela de aprovações imutável e vínculo de digest; retenção privada e revisão independente. Até então, `FX_PROVENANCE_UNVERIFIED`.

### P1-02 — o auditor read-only testa presença, não integridade
`scripts/audit_p1_fx_provenance_readonly.js` declara `PASS_DB_METADATA_ONLY` quando colunas, grants, dois triggers históricos e contagens de registros parecem adequados. Não confere explicitamente a existência/ativação de `trg_p1_require_verified_fx_provenance`, nem a integridade de evidências ou a aprovação de lotes. Quando não houver realizados USD, a igualdade `total=verified=0` não pode ser interpretada como prova positiva de procedência.

Ação: saída distinguir `METADATA_STRUCTURE_PASS` versus `PROVENANCE_AUTHENTICATED_PASS`; somente o último poderia sustentar o gate final, mediante evidência externa verificada. Exigir trigger P1 ativo e falha em casos negativos usando transações descartáveis no staging autorizado.

### P1-03 — migração 003 não é repetível integralmente
A migração usa `ADD CONSTRAINT fx_provenance_hash_format` sem condição de existência; nova execução pode falhar. Documentar versão/checksum única e rollback ensaiado. Evitar modificar `neondb`; só staging depois de aprovação.

### P1-04 — lacunas de least privilege no gate
O auditor verifica SELECT/INSERT/UPDATE/DELETE, mas não TRUNCATE, REFERENCES, TRIGGER, privilégios herdados em schema public, tabelas futuras e permissões DDL. O `REVOKE` concedido ao role não revoga grants de `PUBLIC` ou papéis herdados automaticamente.

Ação: auditoria de grants efetivos e rol de memberships, negativas por SQL autorizado, inventário de objetos e integridade dos triggers. Sem revelar credenciais ou dados financeiros.

### P1-05 — compatibilidade da regra de fechamento anterior
A migração admite até 7 dias para `_PRIOR_CLOSE` e exige `fx.rate = ledger.fx_rate`. Confirmar regra operacional de feriados, datas e arredondamento/precisão NUMERIC para assegurar que o período seja explícito, verificável e não aceite taxa arbitrária.

### P2-06 — separação estrita entre PRs e ambientes
PR #10 está Draft e contém features P1. Não promover P2 NF-e ou P3 Returns, não executar migração 003 automaticamente, não mesclar em `master` e não realizar deploy de produção por este parecer.

## Matriz de decisão
| Gate | Evidência revisada | Status |
| --- | --- | --- |
| Allowlist FX + distinção REALIZADO vs estimativas | Relatório Ordem 049 e código de revisão | Reportado PASS; sem reexecução |
| Procedência documental autenticada | Somente especificação e campos preliminares | BLOCKED |
| Conformidade do auditor somente leitura | Código encontrado, limites acima | PARTIAL |
| Migração staging 003 | SQL disponível; não aplicado por ChatGPT | REVIEW_ONLY |
| Staging grants e negative DB tests | Sem sessão Neon nesta auditoria | PENDING |
| 62 testes financeiros + 14 segurança | Reportados pelo Antigravity | REPORTED_PASS |
| Build/lint e integridade Neon | Reportados pelo Antigravity | REPORTED_PASS |
| Liberação ou merge PR #10 | Restrições e prova documental pendentes | NO_GO |

## Diretriz operacional
ChatGPT pode continuar com testes estáticos, especificação de lote/documento e revisão do GitHub; Antigravity somente para testes reais em Neon staging, regressão Next.js, gateway e prova de obtenção por origem confiável, sob autorização apropriada. **Não realizar DDL em produção.**

Sem dados sensíveis ou segredos nos arquivos deste PR. Sem merge, deploy ou alteração de registros financeiros por esta auditoria.
