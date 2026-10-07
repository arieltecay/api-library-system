# Checklist Validación Staging — API (api-library-system)

**Ejecutar SIEMPRE antes de crear el PR `develop` → `main`.**
**Obligatorio para humanos e IAs. Sin este checklist completo NO se promueve a producción.**

## Pre-requisitos automáticos
- [ ] CI verde en `develop` (Lint & Typecheck + Tests + Build)
- [ ] Workflow `Smoke Tests Staging` verde
- [ ] Deploy en Railway muestra "Success" (environment: staging)

## Validaciones manuales
| # | Check | Cómo validar | Criterio | OK |
|---|-------|--------------|----------|----|
| 1 | Health | `curl https://api-core-system-staging.up.railway.app/health` | `{"status":"ok"}` | [ ] |
| 2 | Versión/prefijo API | `curl https://api-core-system-staging.up.railway.app/api/health` (si aplica) | 200 | [ ] |
| 3 | Auth | Login con usuario de prueba staging | Token JWT válido | [ ] |
| 4 | CRUD básico | GET/POST sobre recurso principal (libros/clientes) | 200/201 sin errores | [ ] |
| 5 | CORS frontend staging | Request desde admin-staging / pos-staging | Sin errores CORS en consola del front | [ ] |
| 6 | Integraciones no-prod | MercadoPago (modo test), Cloudinary, Email | No apuntan a credenciales productivas | [ ] |
| 7 | Logs Railway | `railway logs` en servicio staging | Sin errores 500 recurrentes | [ ] |

## Decisión
- [ ] **APROBADO** → crear PR `develop` → `main` (template release)
- [ ] **RECHAZADO** → documentar en issue/comentario, fixear en rama nueva, repetir

**Ejecutado por (humano/IA):** __________  **Fecha:** __________  **Commit develop:** __________
