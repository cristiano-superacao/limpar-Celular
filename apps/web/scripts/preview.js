#!/usr/bin/env node
import { spawn } from 'node:child_process';

const port = process.env.PORT ? String(process.env.PORT) : '5173';
const args = ['preview', '--host', '--port', port];

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const child = spawn(npxCmd, ['vite', ...args], {
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
