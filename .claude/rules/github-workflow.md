# Workflow Estándar de GitHub para este Proyecto

## 🎯 Regla de Oro

**SIEMPRE usar `gh` CLI para operaciones de GitHub, NO usar MCP de GitHub**

## ❌ Problema con MCP de GitHub

El servidor MCP oficial de GitHub (`api.githubcopilot.com/mcp`) requiere autenticación de GitHub Copilot y el servidor de la comunidad (`@modelcontextprotocol/server-github`) tiene problemas de autenticación incluso con tokens válidos.

**Problemas encontrados:**
- Tokens fine-grained (`github_pat_*`) no funcionan con el servidor MCP
- Tokens classic (`ghp_*`) tampoco funcionan de manera confiable
- Error constante: "Authentication Failed: Bad credentials"

## ✅ Solución: GitHub CLI (`gh`)

### Configuración Inicial

```bash
# Autenticar gh CLI con token classic
echo "TU_TOKEN_CLASSIC" | gh auth login --with-token

# Verificar autenticación
gh auth status
```

**Nota importante:** Este proyecto maneja **dos cuentas de GitHub** en el mismo PC. La cuenta activa es `secamc93`.

### Token Configurado

- **Tipo:** Classic Token (`ghp_*`)
- **Cuenta:** secamc93
- **Scopes:** Todos los permisos necesarios (repo, workflow, admin:org, etc.)
- **Almacenamiento:** gh CLI guarda el token en keyring automáticamente

## 📋 Comandos Estándar para Operaciones Comunes

### Pull Requests

```bash
# Listar PRs abiertos
gh pr list --state open

# Ver detalles de un PR específico
gh pr view <número>

# Listar PRs de un branch específico
gh pr list --head <branch-name>

# Crear un PR
gh pr create --title "Título" --body "Descripción" --base main --head <branch>

# Comentar en un PR
gh pr comment <número> --body "Comentario"

# Mergear un PR
gh pr merge <número> --squash  # o --merge o --rebase

# Cerrar un PR
gh pr close <número>
```

### Issues

```bash
# Listar issues
gh issue list

# Crear issue
gh issue create --title "Título" --body "Descripción"

# Ver issue
gh issue view <número>

# Comentar en issue
gh issue comment <número> --body "Comentario"
```

### Repositorio

```bash
# Ver info del repo
gh repo view

# Clonar repo
gh repo clone <owner>/<repo>

# Crear branch
git checkout -b <nuevo-branch>
git push -u origin <nuevo-branch>
```

### Workflows y CI/CD

```bash
# Listar workflows
gh workflow list

# Ver runs de un workflow
gh run list --workflow=<nombre-workflow>

# Ver detalles de un run
gh run view <run-id>

# Volver a ejecutar un workflow fallido
gh run rerun <run-id>
```

## 🔄 Workflow Típico: Actualizar Feature Branch con Main

```bash
# 1. Ir al feature branch
git checkout feature/nombre-feature

# 2. Actualizar main local
git fetch origin

# 3. Mergear main en feature
git merge main --no-edit

# 4. Resolver conflictos si hay (mejor abortar si son demasiados)
# git merge --abort  # si hay muchos conflictos

# 5. Push de los cambios
git push origin feature/nombre-feature

# 6. Comentar en el PR (se actualiza automáticamente)
gh pr comment <número> --body "✅ Branch actualizado con main"
```

## 🚨 Casos Especiales

### Múltiples Cuentas de GitHub

Este PC maneja dos cuentas de GitHub. Para verificar cuál está activa:

```bash
gh auth status
```

Si necesitas cambiar de cuenta:

```bash
gh auth switch
```

### Rescatar Código de un Branch Conflictivo

Si un feature branch tiene demasiados conflictos con main:

1. **Identificar qué código es importante**
2. **Crear un nuevo branch desde main actualizado**
3. **Copiar manualmente solo el código importante**

```bash
# Desde el branch problemático, ver qué archivos cambiaron
git diff main --name-only

# Guardar archivos específicos
git show feature-viejo:path/to/file.go > file-rescatado.go

# Cambiar a main y crear nuevo branch
git checkout main
git pull origin main
git checkout -b feature-nuevo

# Copiar el código rescatado y commitear
```

## 📌 Recordatorios

1. ✅ **SIEMPRE** usar `gh` CLI para operaciones de GitHub
2. ✅ Verificar autenticación antes de empezar: `gh auth status`
3. ✅ Usar tokens classic (`ghp_*`), no fine-grained
4. ❌ **NO** intentar usar servidores MCP de GitHub
5. ❌ **NO** hacer merge si hay >50 conflictos, mejor rescatar código específico
6. ✅ Comentar en PRs después de actualizaciones importantes
7. ✅ Verificar que estás en la cuenta correcta (`secamc93`)

## 🔗 Referencias Útiles

- [GitHub CLI Manual](https://cli.github.com/manual/)
- [GitHub CLI Cheatsheet](https://github.com/cli/cli#usage)
- Token actual guardado en: Sistema keyring (gh CLI)
- Configuración MCP: `.claude/mcp.json` (pero NO usar para GitHub)

---

**Última actualización:** 2026-01-29
**Por:** Claude Code siguiendo instrucciones del usuario
