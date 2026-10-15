#!/usr/bin/env node
// Bloquea escrituras (Edit/Write) fuera de las reglas del proyecto:
//   - .env y llaves no se editan desde el agente (.env.example sí).
//   - Un agente en un worktree solo escribe en SU worktree: ni en el repo principal ni en
//     otro worktree (servicios-y-worktrees.md). Fuera del repo (scratchpad, /tmp) se permite.
// Lo ejecuta el harness antes de cada edición (registrado en .claude/settings.json).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const sh = (cmd) => { try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };

let ev = {};
try { ev = JSON.parse(fs.readFileSync(0, 'utf8')); } catch { process.exit(0); }
const p = ev.tool_input?.file_path ?? ev.tool_input?.notebook_path ?? '';
if (!p) process.exit(0);

const deny = (m) => { console.error(`BLOQUEADO: ${m}`); process.exit(2); };
const abs = path.resolve(p);
const base = path.basename(abs);

if (/^\.env(\.|$)/.test(base) && !/\.example$/.test(base))
  deny(`${base}: los .env no se editan desde el agente (contienen secretos). Pídele el cambio al usuario.`);
if (/\.pem$/.test(base))
  deny('las llaves (.pem) no se escriben ni se copian desde el agente.');

// Frontera de worktree: la raíz del checkout donde corre la sesión.
const top = sh('git rev-parse --show-toplevel');
const common = sh('git rev-parse --path-format=absolute --git-common-dir');
if (top && common) {
  const mainRoot = path.dirname(common);
  const wtBase = path.join(path.dirname(mainRoot), 'reserve-wt');
  const inside = (dir) => abs === dir || abs.startsWith(dir + path.sep);
  const isWorktree = path.resolve(top) !== path.resolve(mainRoot);
  if (isWorktree && (inside(mainRoot) || inside(wtBase)) && !inside(top))
    deny(`trabajas en el worktree ${top}: no escribas en el repo principal ni en otros worktrees (${abs}).`);
}
process.exit(0);
