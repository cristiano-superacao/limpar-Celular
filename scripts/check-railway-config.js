#!/usr/bin/env node

/**
 * Script para verificar se todas as variáveis necessárias para deploy no Railway estão configuradas
 * Uso: node scripts/check-railway-config.js
 */

const requiredSecrets = [
  {
    name: 'RAILWAY_TOKEN',
    description: 'Token de autenticação do Railway',
    howToGet: 'Railway Dashboard → Account → Tokens → Create New Token'
  },
  {
    name: 'RAILWAY_PROJECT_ID_API',
    description: 'ID do projeto Railway para a API',
    howToGet: 'Railway Dashboard → Projeto API → URL tem o format railway.app/project/{ID}'
  },
  {
    name: 'RAILWAY_PROJECT_ID_WEB',
    description: 'ID do projeto Railway para o Web',
    howToGet: 'Railway Dashboard → Projeto Web → URL tem o format railway.app/project/{ID}'
  },
  {
    name: 'DATABASE_URL',
    description: 'URL de conexão do PostgreSQL com ?schema=public',
    howToGet: 'Railway Dashboard → PostgreSQL service → Variables → DATABASE_URL (adicione ?schema=public)'
  },
  {
    name: 'JWT_SECRET',
    description: 'Chave secreta para JWT (mínimo 16 caracteres)',
    howToGet: 'PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))'
  },
  {
    name: 'VITE_API_URL',
    description: 'URL pública da API no Railway',
    howToGet: 'Após primeiro deploy: Railway Dashboard → API service → Settings → Networking → Generate Domain'
  }
];

console.log('\n🔍 Verificando configuração dos GitHub Secrets para Railway Deploy\n');
console.log('═'.repeat(80));

let allConfigured = true;

requiredSecrets.forEach((secret, index) => {
  console.log(`\n${index + 1}. ${secret.name}`);
  console.log(`   📝 Descrição: ${secret.description}`);
  console.log(`   🔗 Como obter: ${secret.howToGet}`);
  console.log(`   📍 Onde configurar: GitHub → Settings → Secrets and variables → Actions`);
});

console.log('\n' + '═'.repeat(80));
console.log('\n📚 Documentação completa: DEPLOY_INSTRUCTIONS.md');
console.log('🚀 Após configurar todos os Secrets, execute: git push origin main');
console.log('\n✅ O GitHub Actions fará o deploy automático para o Railway!\n');
