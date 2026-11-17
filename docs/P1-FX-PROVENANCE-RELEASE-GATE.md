# P1 Financeiro — protocolo de procedência cambial e gate de release

**Status:** design de segurança para revisão, não autorização de publicação.  
**Issue:** #9 · **PR:** #10 · **Baseline P0:** `07f2d95e1d76020ca1e884e68f1a204a69f059c9`.

## Modelo de confiança

A enumeração `BCB_PTAX`, `BCB_PTAX_OFICIAL`, `BACEN_PTAX` ou `OFFICIAL_SETTLEMENT` identifica a *declaração* da origem, não demonstra sua autenticidade. Não classificar uma transação USD como `REALIZADO` exclusivamente por o registro `fx_rates.source` conter uma dessas strings. Taxas `SYNTHETIC_TEST_RATE` só podem gerar métricas `ESTIMADO`/`PROJETADO`.

**Proposta de contrato verificável para migração posterior de staging:**

- `fx_rates.evidence_ref`: identificador externo estável do arquivo/fonte, sem credenciais, dados bancários ou informação pessoal em texto aberto;
- `fx_rates.evidence_sha256`: digest SHA-256 em hexadecimal de 64 caracteres sobre os bytes do comprovante obtido de fonte confiável;
- `fx_rates.evidence_kind`: `BCB_OFFICIAL_DATASET` ou `SETTLEMENT_DOCUMENT`;
- `fx_rates.verified_at`, `fx_rates.verified_by`: data e identidade técnica da verificação;
- `fx_rates.import_batch_id`: identificador do lote idempotente, com status aprovado e log sanitizado;
- `financial_ledger.fx_rate_id`: chave estrangeira para a linha de cotação que originou a conversão (admitir valor nulo somente em moeda BRL/paridade ou registros legados explicitamente não homologados);
- `financial_ledger.fx_evidence_status`: `VERIFIED` ou `PENDING`, sem converter `PENDING` em `REALIZADO`.

A migração deve ser **aditiva e reversível na fase de staging**, compatível com os dados existentes. Não inventar hashes de comprovantes nem retropreencher `verified_at` para linhas antigas. Registros anteriores que não tenham prova permanecem não verificados.

## Ingestão e segregação de funções

1. Um importador restrito autentica a fonte oficial (ex.: domínio e endpoint oficiais do BCB ou arquivo de liquidação efetivamente obtido de sistema autorizado), valida integridade, normaliza timezone/data-base e calcula hash. O nome da fonte nunca pode ser fornecido pelo cliente final sem verificação.
2. Um ator técnico de ingestão separado do `staging_operator` registra `fx_rates` e evidências, sob transação. O papel de operação da DRE possui **apenas leitura de taxas**; o papel de ledger possui `SELECT, INSERT` no ledger, sem `UPDATE/DELETE/TRUNCATE/TRIGGER`.
3. Um verificador independente aprova o lote ou o documento; registrar identidade e timestamp. Não permitir edição destrutiva de taxas: correções requerem nova versão referenciada e trilha imutável.
4. Antes de criar `REALIZADO` em USD, a API comprova simultaneamente: fonte aprovada, verificação documental, data aplicável, taxa positiva, documento disponível e `fx_rate_id` correspondente. Se qualquer componente faltar: **fail closed** (`FX_PROVENANCE_UNVERIFIED`), sem lançar valor realizado.
5. Para feriados/fins de semana, a política de fechamento anterior deve ser explícita, limitada ao intervalo autorizado e sempre referenciar o registro base e o aviso de fallback. É proibido tratar `PRIOR_CLOSE` como dado obtido na data solicitada.
6. Evitar expor anexos brutos de liquidação, contas, documentos pessoais, chaves ou tokens em repositório público, logs ou JSON de API. Guardar somente metadados sanitizados no Git.

## Aceitação necessária antes de merge/publicação

| Prova | Requisito |
| --- | --- |
| Staging | Migrações executadas apenas em `helpus_staging`, antes/depois do checksum e restore testado |
| Controles de acesso | `staging_operator` não consegue `UPDATE/DELETE/TRUNCATE` ledger/FX; não tem privilégios de DDL sobre `public`; nenhum grant em `neondb` |
| Documento oficial | 1 amostra real do BCB verificada contra origem, com digest e horário; sem dados confidenciais no PR |
| Liquidação | 1 documento de liquidação com prova verificável ou escopo explicitamente bloqueado |
| Rejeição | `REALIZADO` com fonte inventada, hash falso, documento ausente, lote reprovado, taxa divergente ou data incoerente deve falhar |
| Idempotência | Reimportação idêntica não duplica taxas; conflito documental não sobrescreve taxa histórica |
| Integração | 62/62 testes existentes + novos casos de proveniência, lint/build, API RBAC 403, Vercel preview e auditoria de SQL |
| Governança | Revisão independente e confirmação do SHA final, prova de rollback; gate da Issue #9 fechado somente após smoke-tests de produção autorizados |

**Importante:** este documento é uma especificação, **não a implementação do importador nem a comprovação das cotações**. O PR #10 pode continuar em revisão, mas não deve ser mesclado nem habilitado em produção enquanto o gate documental não estiver implementado e comprovado.

## Implementação em revisão — migração 003 e fonte BCB

A migração `scripts/migrations/003_fx_provenance_staging_review.sql` é **staging-only**, deve permanecer fora do deploy automático e exige PostgreSQL descartável antes de `helpus_staging` compartilhado. O ledger resolve `fx_rate_id` automaticamente para entradas USD REALIZADO quando o schema possui a coluna; no schema 002 mantém o caminho legado e não comprova procedência documental.

O gate SQL também exige um registro em `fx_documentary_approvals` com status `APPROVED`, digest compatível e `approved_by` diferente do verificador de origem. A tabela de aprovações é append-only, sem permissão operacional de escrita. **O próprio nome APPROVED não substitui uma aprovação externa autêntica**; a ingestão e a verificação independente ainda precisam de credenciais e evidências controladas fora do GitHub.

Para o boletim público de dólar, o coletor `node scripts/verify_bcb_ptax_source.cjs YYYY-MM-DD` busca o endpoint PTAX OData exclusivamente em `https://olinda.bcb.gov.br` e imprime um manifesto sem gravar dados. Requer Node com `fetch` nativo, TLS válido e rede; valida HTTPS sem redirects, resposta única de fechamento, data e cotação positiva com quatro decimais. O hash SHA-256 cobre **bytes brutos da resposta**; reserialização JSON alteraria o digest. O manifesto é `PENDING` e não deve ser inserido como prova aprovada automaticamente.

Referência institucional: [Banco Central do Brasil — Dólar comercial e documentação da API PTAX](https://dadosabertos.bcb.gov.br/dataset/dolar-americano-usd-todos-os-boletins-diarios).

**Fluxo de revisão independente proposto:** (1) operador de importação autenticado obtém documento e registra metadados e digest em armazenamento privado; (2) verificador distinto confere domínio, dados, digest, lote, intervalo e período; (3) somente o aprovador autorizado por uma role segregada registra a decisão; (4) trigger impede USD REALIZADO sem vínculo e aprovação; (5) auditor read-only verifica grants e contagens, sem se declarar auditor de documentos.

Testes de código não substituem verificação oficial no Neon: `node --test scripts/test_p1_bcb_ptax_validation.test.cjs scripts/test_p1_fx_003_integrity.test.cjs` e `node scripts/check_p1_fx_source_release_gate.js`. O preflight pode e deve retornar bloqueado enquanto a importação autenticada ou a aprovação de evidências não estiver implementada e demonstrada.

**Critério anti-promoção:** nenhuma execução automática do SQL 003, merge do PR #10 ou habilitação de `P1_HOMOLOGATED_PRODUCTION` até certificação dos contratos de API, RBAC, evidências, smoke tests e rollback.

## Execução operacional proposta: dois papéis e assinatura Ed25519

**Todas as etapas abaixo são de staging e exigem autorização institucional e provas reais.** Nenhuma credencial, chave privada ou atestado assinado deve ser publicado no GitHub.

1. **Coleta verificável (sem DB):** `node scripts/verify_bcb_ptax_source.cjs 2026-10-15`. O coletor usa TLS do `olinda.bcb.gov.br`, proíbe redirecionamentos, valida boletim de fechamento e gera hash SHA-256 sobre os bytes originais da resposta. A saída é `PENDING`.
2. **Importação sem aprovação:** uma credencial de banco independente, limitada a `helpus_staging` e com direitos somente de INSERT/SELECT em `fx_rates`, executa `STAGING_FX_IMPORT_DATABASE_URL=... node scripts/import_bcb_ptax_staging.cjs YYYY-MM-DD`. O script recusa o operador padrão, não altera registros existentes, não cria aprovações e imprime `IMPORTED_UNAPPROVED`.
3. **Revisão externa:** uma pessoa ou serviço independente confere o documento verdadeiro, URL, data, boletim, taxa e digest; mantém a evidência original em armazenamento privado, com política de retenção. A assinatura digital é emitida **fora do servidor de importação** e a chave privada jamais é compartilhada com o ChatGPT ou versionada.
4. **Assinatura digital:** `scripts/lib/fx_approval_signature.cjs` define a serialização exata da mensagem a assinar (Ed25519), incluindo `FBA-P1-FX-APPROVAL-V1`, identificador de lote, SHA-256, tipo, nome do aprovador e horário UTC. O documento privado de atestado contém `importBatchId`, `evidenceSha256`, `sourceSystem`, `approvedBy`, `approvedAt` e `signature` em Base64. Uma alteração posterior em qualquer campo invalida a assinatura. A identidade do aprovador deve ser associada a uma chave pública confiável segundo a política institucional; **apenas declarar um nome e fornecer uma chave pública própria não configura aprovação institucional**.
5. **Registro de decisão em staging:** uma role dedicada (não `staging_operator`, nem a role de importação) lê o atestado privado e a chave pública confiável: `STAGING_FX_APPROVAL_DATABASE_URL=... FX_APPROVER_PUBLIC_KEY_FILE=/private/approved-public-key.pem node scripts/approve_fx_batch_staging.cjs /private/approval.json`. O script verifica a assinatura e o digest do registro importado; somente então grava aprovação imutável. Administradores devem manter o mapeamento autorizado de chave pública, identidade e role fora do repositório.
6. **Lançamento realizado:** `recordFinancialLedgerEntry` anexa `fx_rate_id` da observação; o trigger exige o lote aprovado com digest compatível e rejeita ausência de vínculo, inconsistência de moeda, taxas sintéticas e verificadores/aprovadores iguais.
7. **Gate não liberado:** rodar auditor read-only, suites e build no GitHub; depois regressões reais no PostgreSQL descartável. A migração 003 permanece manual e não deve ser executada em staging compartilhado antes de todos os contratos de dados e permissões serem certificados.

Testes sem banco: `node --test scripts/test_p1_fx_approval_signature.test.cjs scripts/test_p1_bcb_ptax_validation.test.cjs scripts/test_p1_fx_003_integrity.test.cjs scripts/test_p1_fx_provenance_contract.test.cjs`. A aprovação final demanda logs saneados de ingestão e verificação externa, além de auditoria independente; saída `PASS_DB_METADATA_ONLY` não é certificação da autenticidade.

**Controle adicional:** revogar na configuração de staging todos os privilégios operacionais herdados de `PUBLIC`, roles pai e objetos futuros; confirmar `has_table_privilege`, `has_schema_privilege`, propriedade de objetos e não participação em roles administrativas. Não criar grants de banco automaticamente a partir destes exemplos.
