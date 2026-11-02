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
