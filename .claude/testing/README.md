# Casos de prueba E2E (manuales, ejecutados por un agente)

Casos de uso de punta a punta que un agente ejecuta contra el entorno local, por módulo:

```
testing/<modulo>/
├── back/     CU-NN-descripcion.md + RESULTS.md   (por la API)
├── front/    CU-NN-descripcion.md + RESULTS.md   (por el navegador, Playwright)
└── shared/   datos de prueba
```

- Primero contra local (`.claude/rules/entorno-local.md`), o contra el back/front de tu worktree.
  Contra producción solo lectura, salvo autorización (`.claude/rules/test-credentials.md`).
- `RESULTS.md`: fecha, entorno, caso, OK/FAIL/PARCIAL, evidencia (ids), bug encontrado, commit del arreglo.
- No son las pruebas automáticas (Go, Vitest, Playwright `e2e/`): esas viven junto al código
  (`.claude/rules/testing.md`). Un caso manual que se vuelve estable se automatiza como spec de
  Playwright en `front/rupu-central/e2e/`, citando su `CU-NN` en el nombre del test.

| Módulo | Casos |
|--------|-------|
| `votaciones/` | grupo y votación, voto del admin, voto público por QR, panel en vivo. Back automatizado en `votaciones/back/ronda_api.py`; front en `front/rupu-central/e2e/` |
