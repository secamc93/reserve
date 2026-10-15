# .claude/mcp.json apunta a la IP liberada de producción, con la clave de la BD vieja

**Fecha:** 2026-10-14 · **Prioridad:** urgente

## Contexto

`.claude/mcp.json` (ignorado por git) define el MCP `postgres-reserve` con una cadena de conexión
a `3.220.183.29:5433` **con usuario y clave en texto plano**. Esa Elastic IP se liberó el
2026-07-23 y puede estar asignada a otra cuenta de AWS: si algo usa ese MCP, envía la clave a un
host que no es nuestro. También define un MCP `github` con token (la regla del proyecto es usar `gh`).

## Ítems

- [ ] **Urgente**: quitar o corregir `postgres-reserve` (apuntar a `127.0.0.1:5435` local, sin
      clave de producción). Lo hace el usuario: los agentes no editan secretos.
- [ ] **Importante**: rotar la clave de BD de producción si esa misma clave sigue en
      `/rupu/DB_PASSWORD` de Parameter Store.
- [ ] Deseable: quitar el MCP `github` (se usa `gh`).

## Cierre

`mcp.json` sin la IP vieja ni claves de producción, y clave de BD rotada si coincidía.
