#!/usr/bin/env node

/**
 * Script para verificar a configuração do banco de dados PostgreSQL Railway
 * Uso: node scripts/verify-database-config.js
 */

console.log('\n🔍 Verificação de Configuração do PostgreSQL Railway\n');
console.log('═'.repeat(80));

console.log('\n📋 CHECKLIST DE VERIFICAÇÃO:\n');

const checks = [
  {
    item: '✓ PostgreSQL provisionado no Railway',
    how: 'Railway Dashboard → Projeto API → Deve ter service "Postgres" (ícone 🐘)'
  },
  {
    item: '✓ DATABASE_URL existe no Postgres service',
    how: 'Railway → Postgres service → Variables → Deve ter DATABASE_URL'
  },
  {
    item: '✓ DATABASE_URL configurada no API service',
    how: 'Railway → API service → Variables → Deve ter DATABASE_URL com ?schema=public'
  },
  {
    item: '✓ DATABASE_URL tem ?schema=public no final',
    how: 'Deve terminar com: ...railway?schema=public'
  },
  {
    item: '✓ DATABASE_URL configurada no GitHub Secret',
    how: 'GitHub → Settings → Secrets → Actions → DATABASE_URL'
  },
  {
    item: '✓ Postgres service está Online',
    how: 'Railway → Postgres service → Status deve estar verde (Online)'
  }
];

checks.forEach((check, index) => {
  console.log(`${index + 1}. ${check.item}`);
  console.log(`   Como verificar: ${check.how}\n`);
});

console.log('═'.repeat(80));

console.log('\n🗄️ CONFIGURAÇÃO PADRÃO DO RAILWAY POSTGRESQL:\n');

const config = {
  'Versão': 'PostgreSQL 17.x (latest stable)',
  'Armazenamento': '500MB (plano Developer)',
  'Conexões': '20 simultâneas (plano free)',
  'SSL/TLS': 'Habilitado automaticamente',
  'Backup': 'Automático diário',
  'Schema Padrão': 'public',
  'Charset': 'UTF-8',
  'Timezone': 'UTC'
};

Object.entries(config).forEach(([key, value]) => {
  console.log(`   ${key.padEnd(20)}: ${value}`);
});

console.log('\n' + '═'.repeat(80));

console.log('\n📊 FORMATO CORRETO DA DATABASE_URL:\n');
console.log('   postgresql://postgres:SENHA@HOST.railway.app:5432/railway?schema=public');
console.log('   └─────┬───┘ └──┬──┘ └─┬─┘ └─────────┬─────────┘ └┬─┘ └──┬──┘ └─────┬─────┘');
console.log('      Protocol  User  Pass      Host Railway      Port  DB      Schema');

console.log('\n❌ FORMATOS INCORRETOS (NÃO USE):\n');
console.log('   ✗ postgresql://...railway (falta ?schema=public)');
console.log('   ✗ postgresql://...?schema=public&sslmode=require (sslmode é automático)');
console.log('   ✗ localhost:5432 (não é a nuvem Railway!)');

console.log('\n' + '═'.repeat(80));

console.log('\n🧪 TESTAR CONEXÃO LOCAL (Opcional):\n');
console.log('   1. Copie DATABASE_URL do Railway');
console.log('   2. Crie apps/api/.env com DATABASE_URL');
console.log('   3. Execute: cd apps/api && npx prisma migrate deploy');
console.log('   4. Se funcionar: ✅ Conexão OK!');

console.log('\n📚 Guia completo: RAILWAY_POSTGRES_SETUP.md');
console.log('🚀 Após verificar tudo, execute: git push origin main\n');
