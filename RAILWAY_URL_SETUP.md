# 🌐 Guia de Configuração de URLs Railway

Este guia configura os domínios públicos da API e Web no Railway.

---

## ❓ Por Que Preciso Disso?

Quando você faz deploy no Railway, os serviços não têm domínio público por padrão. Você precisa:

1. **Gerar domínio público** para cada serviço (API e Web)
2. **Configurar CORS** na API para aceitar requisições do domínio do Web
3. **Configurar URLs** no Web para apontar para a API correta

---

## 🚀 Setup Automático (Recomendado)

Execute o script interativo:

```bash
node scripts/setup-railway-urls.js
```

O script vai guiar você passo a passo e gerar todas as configurações necessárias.

---

## 🔧 Setup Manual

### 1. Gerar Domínio da API

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Abra o projeto **limpa-celular-api**
3. Clique no service **"api"**
4. Vá para **Settings** → **Networking**
5. Clique em **"Generate Domain"**
6. Copie a URL gerada (ex: `limpacelular-api-production.up.railway.app`)

**Formato esperado:**
```
https://[nome-aleatorio]-production.up.railway.app
```

### 2. Gerar Domínio do Web

1. No Railway Dashboard
2. Abra o projeto **limpa-celular-web**
3. Clique no service **"web"**
4. Vá para **Settings** → **Networking**
5. Clique em **"Generate Domain"**
6. Copie a URL gerada

### 3. Configurar Variáveis no Service API

No projeto **limpa-celular-api** → Service **"api"** → **Variables**:

```bash
# Permite CORS do domínio do Web
CORS_ORIGIN=https://[seu-web-domain].up.railway.app

# Conexão com PostgreSQL (copie do service Postgres)
DATABASE_URL=postgresql://postgres:senha@host.railway.internal:5432/railway?schema=public

# Secret para JWT (gere novo ou use existente)
JWT_SECRET=seu-secret-min-16-chars

# Porta do serviço
PORT=4000
```

**Como obter DATABASE_URL:**
- Projeto API → Service **"Postgres"** → **Variables** → copie `DATABASE_URL`
- Adicione `?schema=public` no final se não tiver

**Como gerar JWT_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Configurar Variáveis no Service Web

No projeto **limpa-celular-web** → Service **"web"** → **Variables**:

```bash
# URL pública da API
VITE_API_URL=https://[seu-api-domain].up.railway.app
```

### 5. Configurar GitHub Secrets

Acesse: [GitHub Secrets](https://github.com/cristiano-superacao/limpar-Celular/settings/secrets/actions)

Adicione/Atualize:

| Secret | Valor | Onde Obter |
|--------|-------|------------|
| `RAILWAY_TOKEN` | `RAILWAY_TOKEN_...` | Railway Account → Tokens |
| `RAILWAY_PROJECT_ID_API` | `abc123...` | URL do projeto API (`/project/{ID}`) |
| `RAILWAY_PROJECT_ID_WEB` | `def456...` | URL do projeto Web (`/project/{ID}`) |
| `DATABASE_URL` | `postgresql://...?schema=public` | Postgres service → Variables |
| `JWT_SECRET` | `base64-string` | Gere com comando acima |
| `VITE_API_URL` | `https://[api-domain].up.railway.app` | Domínio gerado da API |
| `CORS_ORIGIN` | `https://[web-domain].up.railway.app` | Domínio gerado do Web |

### 6. Redeploy dos Serviços

Após configurar todas as variáveis:

1. **API**: Railway → Projeto API → Service "api" → ⋮ → **Redeploy**
2. **Web**: Railway → Projeto Web → Service "web" → ⋮ → **Redeploy**
3. Aguarde 3-5 minutos

---

## ✅ Validação

### Teste 1: Health Check da API

```powershell
Invoke-WebRequest -Uri "https://[seu-api-domain].up.railway.app/health"
```

**Esperado:** Status 200, resposta `{"ok":true}`

### Teste 2: Script de CORS

```bash
$env:API_URL="https://[seu-api-domain].up.railway.app"
$env:WEB_ORIGIN="https://[seu-web-domain].up.railway.app"
node scripts/test-cors.js
```

**Esperado:** Todos os 3 testes passam (✅)

### Teste 3: Navegador

1. Abra: `https://[seu-web-domain].up.railway.app/register`
2. F12 → Network → Clear
3. Tente criar uma conta
4. Verifique requisição `OPTIONS` /auth/register:
   - Status: 204
   - Headers: `access-control-allow-origin` presente

---

## 🔍 Troubleshooting

### Erro: "Application not found" (404)

**Causa:** Domínio não foi gerado ou está incorreto

**Solução:**
1. Verifique que clicou em "Generate Domain" no Railway
2. Copie a URL EXATA mostrada no Railway (com ou sem `https://`)
3. Aguarde 2-3 minutos após gerar o domínio

### Erro: "Service Unavailable" (503)

**Causa:** Service não iniciou ou crashou

**Solução:**
1. Railway → Service → Deployments → Veja logs
2. Procure erros de start
3. Verifique todas as variáveis estão configuradas
4. Redeploy manual

### Erro: CORS ainda bloqueando

**Causa:** Variável `CORS_ORIGIN` não configurada ou incorreta

**Solução:**
1. Confirme `CORS_ORIGIN` existe no service API
2. Valor deve ser `https://[web-domain]` (sem barra no final)
3. Redeploy do service API
4. Limpe cache do navegador (Ctrl+Shift+Delete)

### Web mostra página em branco

**Causa:** `VITE_API_URL` não configurada ou incorreta

**Solução:**
1. Confirme `VITE_API_URL` existe no service Web
2. Valor deve apontar para domínio da API
3. Redeploy do service Web
4. Hard refresh no navegador (Ctrl+Shift+R)

---

## 📊 Checklist de Configuração

- [ ] Domínio da API gerado no Railway
- [ ] Domínio do Web gerado no Railway
- [ ] Variáveis configuradas no service API:
  - [ ] `CORS_ORIGIN`
  - [ ] `DATABASE_URL` (com `?schema=public`)
  - [ ] `JWT_SECRET` (min 16 chars)
  - [ ] `PORT=4000`
- [ ] Variáveis configuradas no service Web:
  - [ ] `VITE_API_URL`
- [ ] GitHub Secrets atualizados (7 secrets)
- [ ] Redeploy da API completado (status Online)
- [ ] Redeploy do Web completado (status Online)
- [ ] Health check da API retorna 200
- [ ] Script `test-cors.js` passa
- [ ] Registro no navegador funciona

---

## 🎯 Domínios Comuns Railway

Railway gera domínios no formato:

- **Padrão:** `[nome-app]-production-[hash].up.railway.app`
- **Exemplos:**
  - `limpacelular-api-production-xyz123.up.railway.app`
  - `limpacelular-production-abc456.up.railway.app`

**Importante:** NÃO invente o domínio! Sempre copie exatamente como mostrado no Railway.

---

## 🔗 Links Úteis

- [Railway Docs - Networking](https://docs.railway.app/deploy/exposing-your-app)
- [Railway Docs - Environment Variables](https://docs.railway.app/develop/variables)
- [CORS Troubleshooting](./CORS_TROUBLESHOOTING.md)
- [Deploy Instructions](./DEPLOY_INSTRUCTIONS.md)

---

**Layout responsivo e profissional mantido em todo o sistema! 🎨**
