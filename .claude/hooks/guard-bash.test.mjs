// Pruebas de guard-bash: node --test .claude/hooks/guard-bash.test.mjs
// Casos en guard-bash.cases.json: ["bloquear"|"permitir", comando].
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const dir = new URL('.', import.meta.url).pathname;
const cases = JSON.parse(fs.readFileSync(`${dir}guard-bash.cases.json`, 'utf8'));

for (const [want, command] of cases) {
  test(`${want}: ${command.split('\n')[0].slice(0, 60)}`, () => {
    let code = 0;
    try {
      execFileSync('node', [`${dir}guard-bash.mjs`], { input: JSON.stringify({ tool_input: { command } }), stdio: ['pipe', 'ignore', 'ignore'] });
    } catch (e) { code = e.status; }
    assert.equal(code === 2 ? 'bloquear' : 'permitir', want);
  });
}
