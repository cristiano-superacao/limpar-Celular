#!/usr/bin/env node

/**
 * Script de Configuração de URLs Railway - Setup Completo
 * Este script orienta você a configurar todas as URLs necessárias
 * Uso: node scripts/setup-railway-urls.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

console.log('\n🚀 Configuração de URLs do Railway - Setup Completo\n');
console.log('═'.repeat(80));
console.log('\nEste script vai guiar você na configuração das URLs da API e Web no Railway.\n');

async function setup() {
  console.log('📋 PASSO 1: Gerar Domínio Público da API\n');
  console.log('   1. Acesse: https://railway.app/dashboard');
  console.log('   2. Abra o projeto: limpa-celular-api');
  console.log('   3. Clique no service "api" (deve estar com status Online)');
  console.log('   4. Vá para: Settings → Networking');
  console.log('   5. Clique em "Generate Domain" (se não houver domínio)');
  console.log('   6. Copie a URL gerada (ex: limpacelular-api-production.up.railway.app)\n');
  
  const apiDomain = await question('   Cole o domínio da API aqui (sem https://): ');
  const apiUrl = `https://${apiDomain.trim()}`;
  
  console.log(`\n   ✅ URL da API: ${apiUrl}\n`);
  
  console.log('─'.repeat(80));
  console.log('\n📋 PASSO 2: Gerar Domínio Público do Web\n');
  console.log('   1. No Railway Dashboard');
  console.log('   2. Abra o projeto: limpa-celular-web');
  console.log('   3. Clique no service "web"');
  console.log('   4. Vá para: Settings → Networking');
  console.log('   5. Clique em "Generate Domain" (se não houver domínio)');
  console.log('   6. Copie a URL gerada (ex: limpacelular-production.up.railway.app)\n');
  
  const webDomain = await question('   Cole o domínio do Web aqui (sem https://): ');
  const webUrl = `https://${webDomain.trim()}`;
  
  console.log(`\n   ✅ URL do Web: ${webUrl}\n`);
  
  console.log('═'.repeat(80));
  console.log('\n📝 RESUMO DAS CONFIGURAÇÕES:\n');
  console.log(`   API URL:  ${apiUrl}`);
  console.log(`   Web URL:  ${webUrl}\n`);
  
  console.log('═'.repeat(80));
  console.log('\n🔧 PASSO 3: Configurar Variáveis no Railway\n');
  
  console.log('   A) Projeto API → Service "api" → Variables:\n');
  console.log('      Adicione/Atualize estas variáveis:\n');
  console.log(`      CORS_ORIGIN=${webUrl}`);
  console.log('      DATABASE_URL=postgresql://[copie-do-postgres-service]?schema=public');
  console.log('      JWT_SECRET=[seu-secret-min-16-chars]');
  console.log('      PORT=4000\n');
  
  console.log('   B) Projeto Web → Service "web" → Variables:\n');
  console.log('      Adicione/Atualize esta variável:\n');
  console.log(`      VITE_API_URL=${apiUrl}\n`);
  
  console.log('═'.repeat(80));
  console.log('\n🔐 PASSO 4: Configurar GitHub Secrets\n');
  console.log('   Acesse: https://github.com/cristiano-superacao/limpar-Celular/settings/secrets/actions\n');
  console.log('   Adicione/Atualize estes Secrets:\n');
  
  console.log('   Nome: VITE_API_URL');
  console.log(`   Valor: ${apiUrl}\n`);
  
  console.log('   Nome: CORS_ORIGIN');
  console.log(`   Valor: ${webUrl}\n`);
  
  console.log('   Outros Secrets necessários (se ainda não existem):');
  console.log('   - RAILWAY_TOKEN (do Railway Account → Tokens)');
  console.log('   - RAILWAY_PROJECT_ID_API (da URL do projeto API)');
  console.log('   - RAILWAY_PROJECT_ID_WEB (da URL do projeto Web)');
  console.log('   - DATABASE_URL (do Postgres service → Variables)');
  console.log('   - JWT_SECRET (gere com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))")\n');
  
  console.log('═'.repeat(80));
  console.log('\n🔄 PASSO 5: Redeploy dos Serviços\n');
  console.log('   Após configurar as variáveis:\n');
  console.log('   1. Railway → Projeto API → Service "api" → ⋮ → Redeploy');
  console.log('   2. Railway → Projeto Web → Service "web" → ⋮ → Redeploy');
  console.log('   3. Aguarde 3-5 minutos para os deploys completarem\n');
  
  console.log('═'.repeat(80));
  console.log('\n✅ PASSO 6: Testar a Configuração\n');
  console.log('   Execute o teste de CORS:\n');
  console.log(`   $env:API_URL="${apiUrl}"; $env:WEB_ORIGIN="${webUrl}"; node scripts/test-cors.js\n`);
  
  console.log('   Ou teste manualmente no navegador:');
  console.log(`   ${webUrl}/register\n`);
  
  console.log('═'.repeat(80));
  console.log('\n📋 COMANDOS RÁPIDOS (PowerShell):\n');
  console.log('   # Testar CORS');
  console.log(`   $env:API_URL="${apiUrl}"; $env:WEB_ORIGIN="${webUrl}"; node scripts/test-cors.js\n`);
  
  console.log('   # Testar Health da API');
  console.log(`   Invoke-WebRequest -Uri "${apiUrl}/health"\n`);
  
  console.log('   # Gerar JWT_SECRET');
  console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"\n');
  
  console.log('═'.repeat(80));
  console.log('\n✅ Configuração completa!\n');
  console.log('📚 Para mais detalhes, consulte: CORS_TROUBLESHOOTING.md\n');
  
  rl.close();
}

setup().catch((error) => {
  console.error('\n❌ Erro:', error.message);
  rl.close();
  process.exit(1);
});
