# Hooks

Guardas que el harness ejecuta antes de una herramienta. Se registran en
`.claude/settings.json` (versionado); no se descubren solos. Salida `2` = bloqueado.

| Hook | Cuándo | Qué bloquea |
|------|--------|-------------|
| `guard-bash.mjs` | antes de cada `Bash` | force push, push directo a `main`, `reset --hard`, `--no-verify`, `git add -f`, commitear `.pem`/`.env`, `t.Skip`/`it.skip`, `rm -rf /`, `nohup` y servicios con `&`, `docker ... prune`, borrar el Postgres local, `DROP DATABASE/SCHEMA` |
| `guard-scope.mjs` | antes de cada `Edit`/`Write` | editar `.env` o `.pem`; desde un worktree, escribir en el repo principal o en otro worktree |

Excepción: un borrado que el usuario pidió y confirmó en la conversación se marca anteponiendo
`BORRADO_APROBADO=1` al comando. Sin esa marca sigue bloqueado.

Probar un hook a mano:

```bash
echo '{"tool_input":{"command":"nohup go run ./cmd &"}}' | node .claude/hooks/guard-bash.mjs; echo "exit=$?"
```

Pruebas: `node --test .claude/hooks/guard-bash.test.mjs` (casos en `guard-bash.cases.json`; al cambiar una regla, agregar su caso).
