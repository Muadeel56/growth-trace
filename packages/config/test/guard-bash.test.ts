import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

const repoRoot = path.resolve(import.meta.dirname, '../../..');
const guard = path.join(repoRoot, '.claude/hooks/guard-bash.sh');

/** A throwaway repo on `branch`, so the on-main checks don't depend on the real checkout. */
function repoOn(branch: string) {
  const dir = mkdtempSync(path.join(tmpdir(), 'guard-bash-'));
  spawnSync('git', ['init', '-q', '-b', branch, dir]);
  return dir;
}

const feature = repoOn('feat/x');
const main = repoOn('main');
afterAll(() => [feature, main].forEach((dir) => rmSync(dir, { recursive: true, force: true })));

function run(command: string, projectDir = feature) {
  const result = spawnSync('sh', [guard], {
    input: JSON.stringify({ tool_name: 'Bash', tool_input: { command } }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: projectDir },
    encoding: 'utf8',
  });
  return { status: result.status, stderr: result.stderr };
}

describe('.claude/hooks/guard-bash.sh', () => {
  it.each([
    'git push -f',
    'git push --force origin feat/x',
    'git push --force-with-lease',
    'git push -uf origin feat/x',
    'git -c core.x=y push origin +feat/x',
    'git push --mirror',
    'git push origin main',
    'git push origin HEAD:main',
    'git push origin feat/x:refs/heads/main',
    'git commit --no-verify -m x',
    'git commit -n -m x',
    'git commit -anm x',
    'HUSKY=0 git commit -m x',
    'npm test && git push -f',
    'bash -c "git push --force"',
    'cat .env',
    'cat frontend/.env.local',
    'grep SECRET .env.example .env',
    'source ./backend/.env',
    'cp .env /tmp/x',
    'rm -rf /',
    'rm -rf src',
    'rm -fr ../other',
    'rm -r -f docs',
    'rm --recursive --force frontend',
  ])('blocks: %s', (command) => {
    const { status, stderr } = run(command);
    expect(status).toBe(2);
    expect(stderr).toMatch(/^Blocked by \.claude\/hooks\/guard-bash\.sh/);
  });

  it.each([
    'git status',
    'git push -u origin feat/x',
    'git commit -am "Phase 6: agent limits"',
    'git commit --amend',
    'git log --oneline -n 5',
    'cat .env.example',
    'ls .envrc',
    'echo process.env.API_BASE_URL',
    'rm -rf node_modules frontend/.next',
    'rm -rf test-results playwright-report coverage',
    'rm -f stray.log',
    'npm run verify',
  ])('allows: %s', (command) => {
    expect(run(command).status).toBe(0);
  });

  it.each(['git commit -m x', 'git push -u origin feat/x', 'git push'])(
    'blocks on main: %s',
    (command) => {
      expect(run(command, main).status).toBe(2);
    },
  );
});
