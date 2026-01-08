#!/usr/bin/env node

/**
 * Script de diagnóstico CORS - testa se a API está respondendo corretamente ao preflight
 * Uso: node scripts/test-cors.js
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.API_URL || 'https://limpacelular-api.up.railway.app';
const WEB_ORIGIN = process.env.WEB_ORIGIN || 'https://limpacelular.up.railway.app';

console.log('\n🔍 Teste de CORS - Preflight e Registro\n');
console.log('═'.repeat(80));
console.log(`\n📍 API URL: ${API_URL}`);
console.log(`📍 Web Origin: ${WEB_ORIGIN}\n`);

// Função auxiliar para fazer requisição HTTP/HTTPS
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function testHealth() {
  console.log('🏥 Teste 1: Health Check');
  console.log('─'.repeat(80));
  
  try {
    const result = await makeRequest(`${API_URL}/health`, { method: 'GET' });
    console.log(`   Status: ${result.status}`);
    console.log(`   Resposta: ${result.data}`);
    
    if (result.status === 200) {
      console.log('   ✅ API está online!\n');
      return true;
    } else {
      console.log('   ❌ API retornou status inesperado\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}\n`);
    return false;
  }
}

async function testPreflight() {
  console.log('✈️  Teste 2: Preflight OPTIONS (simulando navegador)');
  console.log('─'.repeat(80));
  
  try {
    const result = await makeRequest(`${API_URL}/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Origin': WEB_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization'
      }
    });
    
    console.log(`   Status: ${result.status}`);
    console.log(`   Headers CORS recebidos:`);
    console.log(`      Access-Control-Allow-Origin: ${result.headers['access-control-allow-origin'] || '❌ AUSENTE'}`);
    console.log(`      Access-Control-Allow-Methods: ${result.headers['access-control-allow-methods'] || '❌ AUSENTE'}`);
    console.log(`      Access-Control-Allow-Headers: ${result.headers['access-control-allow-headers'] || '❌ AUSENTE'}`);
    console.log(`      Access-Control-Max-Age: ${result.headers['access-control-max-age'] || 'não definido'}`);
    
    const hasOrigin = !!result.headers['access-control-allow-origin'];
    const hasMethods = !!result.headers['access-control-allow-methods'];
    const hasHeaders = !!result.headers['access-control-allow-headers'];
    
    if (result.status === 204 && hasOrigin && hasMethods && hasHeaders) {
      console.log('\n   ✅ Preflight passou! CORS configurado corretamente.\n');
      return true;
    } else {
      console.log('\n   ❌ Preflight FALHOU! Headers CORS ausentes ou incompletos.\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}\n`);
    return false;
  }
}

async function testActualRequest() {
  console.log('📝 Teste 3: POST /auth/register (requisição real)');
  console.log('─'.repeat(80));
  
  try {
    const body = JSON.stringify({
      email: `test-${Date.now()}@example.com`,
      password: 'Test1234!'
    });
    
    const result = await makeRequest(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Origin': WEB_ORIGIN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      body
    });
    
    console.log(`   Status: ${result.status}`);
    console.log(`   Access-Control-Allow-Origin: ${result.headers['access-control-allow-origin'] || '❌ AUSENTE'}`);
    
    if (result.status === 201 || result.status === 409) {
      console.log(`   Resposta: ${result.data.substring(0, 100)}...`);
      console.log('\n   ✅ Requisição POST funcionou!\n');
      return true;
    } else {
      console.log(`   Resposta: ${result.data}`);
      console.log('\n   ⚠️  Status inesperado\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('🛑 API não está acessível. Verifique:\n');
    console.log('   1. Railway Dashboard → API service → Status deve estar "Online"');
    console.log('   2. Railway Dashboard → API service → Deployments → último deploy com sucesso');
    console.log('   3. Variáveis DATABASE_URL, JWT_SECRET, PORT configuradas\n');
    return;
  }
  
  const preflightOk = await testPreflight();
  if (!preflightOk) {
    console.log('🛑 CORS Preflight falhou. Soluções:\n');
    console.log('   1. Verifique se o último deploy da API completou (aguarde 3-5 min)');
    console.log('   2. Railway Dashboard → API service → Redeploy manualmente');
    console.log('   3. Confirme que apps/api/src/index.ts tem o middleware CORS defensivo');
    console.log('   4. Adicione CORS_ORIGIN=' + WEB_ORIGIN + ' nas variáveis do Railway\n');
    return;
  }
  
  const requestOk = await testActualRequest();
  
  console.log('═'.repeat(80));
  console.log('\n📊 RESUMO:\n');
  console.log(`   Health Check:     ${healthOk ? '✅' : '❌'}`);
  console.log(`   Preflight CORS:   ${preflightOk ? '✅' : '❌'}`);
  console.log(`   POST Register:    ${requestOk ? '✅' : '❌'}`);
  
  if (healthOk && preflightOk && requestOk) {
    console.log('\n🎉 Tudo funcionando! Pode testar no navegador:\n');
    console.log(`   ${WEB_ORIGIN}/register\n`);
  } else {
    console.log('\n❌ Há problemas. Veja as sugestões acima.\n');
  }
}

runTests().catch(console.error);
