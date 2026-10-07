## Tipo de PR
- [ ] Feature / fix / chore (base: `develop`)
- [ ] **RELEASE** `develop` → `main` (completar sección Release)

---

## Checklist estándar (todo PR)
- [ ] CI verde (Lint & Typecheck + Tests)
- [ ] Cambios acotados al scope del ticket
- [ ] Sin secretos ni `.env` en el diff

---

## Sección RELEASE (solo `develop` → `main`)

### Pre-merge (obligatorio)
- [ ] Workflow `Smoke Tests Staging` VERDE en `develop`
- [ ] `docs/STAGING_VALIDATION_CHECKLIST.md` ejecutado, APROBADO y firmado
- [ ] Changelog / bump de versión si aplica

### Cambios incluidos
<!-- Listar PRs/features mergeados a develop desde el último release -->

### Plan de rollback
- Emergency redeploy: `gh workflow run ci.yml -f environment=production -f rollback=true`
- Rollback real a versión previa: Railway Dashboard → `api-core-system` → Deployments → "Redeploy" en el deployment anterior.

### Post-merge (ejecutar tras deploy)
- [ ] Smoke manual en producción: `/health` OK
- [ ] Monitorear logs Railway 10 min sin 5xx
