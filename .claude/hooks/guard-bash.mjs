#!/usr/bin/env node
// Bloquea comandos destructivos o que evaden las reglas duras del proyecto (AGENTS.md).
// Lo ejecuta el harness antes de cada Bash (registrado en .claude/settings.json).
// Salida 2 = bloqueado; el mensaje de stderr le llega al agente.
import fs from 'node:fs';

let ev = {};
try { ev = JSON.parse(fs.readFileSync(0, 'utf8')); } catch { process.exit(0); }
const raw = ev.tool_input?.command ?? '';
if (!raw) process.exit(0);
// El cuerpo de un heredoc es texto (mensajes de commit, docs), no comandos: no se evalúa.
const cmd = raw.replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2\s*(?=\n|$)/g, '<<HEREDOC');

const rules = [
  [/\bgit\s+push\s+.*(--force\b|--force-with-lease\b|\s-f\b)|\bgit\s+push\s+\S+\s+\+/,
   'force push prohibido: nunca reescribir historia publicada (github-workflow.md)'],
  [/\bgit\s+push\b[^|;&]*\b(origin\s+)?main\b(?!-)/,
   'no se hace push directo a main: se integra por PR (github-workflow.md)'],
  [/\bgit\s+(reset\s+--hard|checkout\s+--\s|restore\s+\.|clean\s+-[a-zA-Z]*f)/,
   'comando destructivo sobre el working tree: puede borrar trabajo no commiteado'],
  [/--no-verify\b/, 'saltarse los hooks de git está prohibido'],
  [/\bgit\s+add\s+(-f|--force)\b/, 'git add -f no se usa: lo ignorado (.env, llaves, .claude/settings.local.json) no se versiona'],
  [/\bgit\s+add\b[^|;&]*(\bcam\.pem\b|\.pem\b|\/\.env(\s|$)|\.env\.bak)/, 'llaves y .env NUNCA se commitean'],
  [/\b(it|test|describe)\.skip\b|\bxit\s*\(|\bt\.Skip\s*\(/, 'no se desactivan tests para pasar el build (testing.md)'],
  [/\brm\s+-rf?\s+(\/|~|\.\s*$|\*)/, 'rm -rf sobre raíz, home o comodín'],
  // Solo cuando se invoca como comando (inicio, tras ; & | ( o salto de línea), no cuando aparece en un texto.
  [/(^|[;&|(]\s*|\n\s*)nohup\s/,'los servicios se inician con scripts/dev-services.sh (tmux), nunca con nohup (servicios-y-worktrees.md)'],
  [/\b(go\s+run|pnpm\s+dev|npm\s+run\s+dev|next\s+dev)\b[^|;]*&\s*($|;)/,
   'servicios en segundo plano sueltos prohibidos: usa scripts/dev-services.sh start backend|frontend'],
  [/\bdocker(-compose)?\s+(system\s+prune|volume\s+prune|image\s+prune\s+(-a|--all))\b/,
   'prune de Docker prohibido: la máquina tiene contenedores y volúmenes de otros proyectos'],
  [/\bdocker\s+(volume\s+rm|rm\s+-f?\s*rupu_postgres_local)\b/,
   'borrar el volumen o el contenedor del Postgres local destruye la BD de todos los worktrees: pídelo al usuario'],
  [/\b(drop\s+database|drop\s+schema)\b/i,
   'DROP DATABASE/SCHEMA requiere aprobación explícita del usuario (antepón BORRADO_APROBADO=1 solo si lo autorizó)'],
];

for (const [re, msg] of rules) {
  if (re.test(cmd) && !/\bBORRADO_APROBADO=1\b/.test(cmd)) {
    console.error(`BLOQUEADO: ${msg}`);
    process.exit(2);
  }
}
process.exit(0);
