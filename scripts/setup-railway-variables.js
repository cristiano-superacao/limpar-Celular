#!/usr/bin/env node

/**
 * Script para configurar TODAS as variáveis de ambiente necessárias no Railway
 * Uso: node scripts/setup-railway-variables.js
 * 
 * IMPORTANTE: Você precisa ter as variáveis configuradas como GitHub Secrets primeiro!
 */

console.log('\n🚀 Configuração de Variáveis no Railway\n');
console.log('═'.repeat(80));

console.log('\n📋 PASSO 1: Variáveis da API (Serviço "api")\n');
console.log('   No Railway Dashboard → Projeto API → Service "api" → Variables:');
console.log('\n   1. DATABASE_URL');
console.log('      Valor: postgresql://user:pass@host.railway.internal:5432/railway?schema=public');
console.log('      ⚠️  IMPORTANTE: Deve terminar com ?schema=public');
console.log('\n   2. JWT_SECRET');
console.log('      Valor: (seu secret gerado com 32+ caracteres)');
console.log('\n   3. PORT');
console.log('      Valor: 4000');
console.log('\n   4. CORS_ORIGIN (opcional)');
console.log('      Valor: https://limpacelular.up.railway.app');
console.log('      Observação: se definido, restringe CORS à(s) origem(ns) informada(s)');

console.log('\n\n📋 PASSO 2: Variáveis do Web (Serviço "web")\n');
console.log('   No Railway Dashboard → Projeto Web → Service "web" → Variables:');
console.log('\n   1. VITE_API_URL');
console.log('      Valor: https://[dominio-da-api].up.railway.app');
console.log('      ⚠️  Obtenha o domínio em: API service → Settings → Networking → Generate Domain');

console.log('\n\n' + '═'.repeat(80));
console.log('\n✅ VERIFICAÇÃO FINAL:\n');
console.log('   API deve ter 3 variáveis: DATABASE_URL, JWT_SECRET, PORT');
console.log('   Web deve ter 1 variável: VITE_API_URL');
console.log('\n🔄 Após configurar, faça redeploy: Railway Dashboard → Service → "Redeploy"');
console.log('\n📚 Documentação completa: DEPLOY_INSTRUCTIONS.md\n');
