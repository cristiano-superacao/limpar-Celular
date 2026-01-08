#!/usr/bin/env node
const { spawn } = require('node:child_process');

const port = process.env.PORT ? String(process.env.PORT) : '5173';
const args = ['preview', '--host', '--port', port];

const child = spawn('npx', ['vite', ...args], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
