# 🚨 Guia de Resolução CORS - Railway Deploy

Este guia resolve definitivamente o erro: **"No 'Access-Control-Allow-Origin' header is present on the requested resource"**

---

## 🔍 Diagnóstico Rápido

Execute o script de teste:

```bash
node scripts/test-cors.js
```

Ou teste manualmente no PowerShell:

```powershell
# Teste 1: Health Check
Invoke-WebRequest -Uri "https://limpacelular-api.up.railway.app/health"

# Teste 2: Preflight OPTIONS
$headers = @{
  "Origin" = "https://limpacelular.up.railway.app"
  "Access-Control-Request-Method" = "POST"
  "Access-Control-Request-Headers" = "content-type"
}
Invoke-WebRequest -Uri "https://limpacelular-api.up.railway.app/auth/register" -Method Options -Headers $headers
```

---

## ✅ Solução Passo a Passo

### Passo 1: Verificar Status do Deploy

1. Acesse [GitHub Actions](https://github.com/cristiano-superacao/limpar-Celular/actions)
2. Verifique se o último workflow **"Deploy to Railway"** completou com sucesso (✅ verde)
3. Se ainda está rodando (🟡 amarelo), aguarde 3-5 minutos

### Passo 2: Verificar Variáveis no Railway

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Abra o projeto **limpa-celular-api**
3. Clique no service **"api"**
4. Vá para a aba **"Variables"**
5. Confirme que existem:

```
DATABASE_URL=postgresql://...?schema=public
JWT_SECRET=<seu-secret>
PORT=4000
CORS_ORIGIN=https://limpacelular.up.railway.app  (IMPORTANTE!)
```

**❌ Se CORS_ORIGIN está ausente:**

- Clique em **"+ New Variable"**
- Nome: `CORS_ORIGIN`
- Valor: `https://limpacelular.up.railway.app`
- Clique em **"Add"**

### Passo 3: Redeploy Manual da API

1. No service **"api"**, clique nos **3 pontinhos** (⋮) no canto superior direito
2. Selecione **"Redeploy"**
3. Aguarde 3-5 minutos para o deploy completar
4. Verifique que o status mudou para **"Online"** (verde)

### Passo 4: Verificar Logs da API

1. No service **"api"**, clique em **"Deployments"**
2. Clique no deployment mais recente
3. Verifique os logs. Você deve ver:

```
API rodando em http://localhost:4000
```

**❌ Se vir erros:**
- `Connection URL is empty` → Falta `DATABASE_URL` ou está incorreta
- `Invalid JWT secret` → Falta `JWT_SECRET` ou tem menos de 16 caracteres

### Passo 5: Adicionar CORS_ORIGIN no GitHub Secret

Para deploys futuros serem automáticos:

1. Vá para [GitHub Secrets](https://github.com/cristiano-superacao/limpar-Celular/settings/secrets/actions)
2. Clique em **"New repository secret"**
3. Configure:
   - Name: `CORS_ORIGIN`
   - Secret: `https://limpacelular.up.railway.app`
4. Clique em **"Add secret"**

### Passo 6: Testar no Navegador

1. Abra o DevTools (F12)
2. Vá para a aba **Network**
3. Acesse: https://limpacelular.up.railway.app/register
4. Tente criar uma conta
5. Verifique a requisição `OPTIONS` (preflight):
   - Status deve ser **204**
   - Headers de resposta devem incluir:
     - `access-control-allow-origin: https://limpacelular.up.railway.app`
     - `access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`
     - `access-control-allow-headers: Content-Type, content-type, Authorization, authorization, Origin`

---

## 🔧 Troubleshooting Avançado

### Problema: API retorna 502 Bad Gateway

**Causa**: API não iniciou ou crashou

**Solução**:
1. Railway → API service → Deployments → Ver logs
2. Procure por erros de start
3. Verifique `DATABASE_URL` está com `?schema=public`
4. Verifique `JWT_SECRET` existe

### Problema: Preflight retorna 404

**Causa**: Middleware CORS não está ativo ou deploy não completou

**Solução**:
1. Confirme que o último commit (`bd65d22`) está deployado
2. Verifique `apps/api/src/index.ts` tem o middleware defensivo
3. Redeploy manual

### Problema: "Vary" header ausente

**Causa**: Proxy ou CDN pode estar cacheando resposta incorreta

**Solução**:
1. Limpe cache do navegador (Ctrl+Shift+Delete)
2. Teste em aba anônima
3. Aguarde 5-10 minutos para cache do Railway expirar

### Problema: CORS funciona em curl mas não no navegador

**Causa**: Navegador é mais estrito que curl com preflight

**Solução**:
1. Verifique que `OPTIONS` retorna 204 (não 200)
2. Confirme todos os headers CORS estão presentes
3. Teste com `node scripts/test-cors.js`

---

## 🧪 Testes de Validação

### Teste Manual Completo (PowerShell)

```powershell
# 1. Health Check
$health = Invoke-WebRequest -Uri "https://limpacelular-api.up.railway.app/health"
Write-Host "Health: $($health.StatusCode)" -ForegroundColor Green

# 2. Preflight OPTIONS
$headers = @{
  "Origin" = "https://limpacelular.up.railway.app"
  "Access-Control-Request-Method" = "POST"
  "Access-Control-Request-Headers" = "content-type,authorization"
}
$preflight = Invoke-WebRequest -Uri "https://limpacelular-api.up.railway.app/auth/register" -Method Options -Headers $headers
Write-Host "Preflight: $($preflight.StatusCode)" -ForegroundColor Green
Write-Host "CORS Headers:"
$preflight.Headers['Access-Control-Allow-Origin']
$preflight.Headers['Access-Control-Allow-Methods']
$preflight.Headers['Access-Control-Allow-Headers']

# 3. POST Register (teste com e-mail único)
$body = @{
  email = "test-$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
  password = "Test1234!"
} | ConvertTo-Json

$register = Invoke-WebRequest -Uri "https://limpacelular-api.up.railway.app/auth/register" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"; "Origin"="https://limpacelular.up.railway.app"} `
  -Body $body

Write-Host "Register: $($register.StatusCode)" -ForegroundColor Green
```

---

## 📞 Suporte Adicional

Se após seguir todos os passos o erro persistir:

1. Execute `node scripts/test-cors.js` e copie a saída completa
2. Verifique os logs do Railway (API service → Deployments → última deployment → logs)
3. Compartilhe:
   - Output do `test-cors.js`
   - Screenshot dos logs do Railway
   - Screenshot do Network do DevTools (aba Headers da requisição OPTIONS)

---

## ✅ Checklist Final

- [ ] Workflow GitHub Actions completou com sucesso
- [ ] Variável `CORS_ORIGIN` existe no Railway API service
- [ ] Variável `DATABASE_URL` existe e termina com `?schema=public`
- [ ] Variável `JWT_SECRET` existe (mínimo 16 caracteres)
- [ ] Variável `PORT` configurada como `4000`
- [ ] API service status é "Online" (verde)
- [ ] `node scripts/test-cors.js` passa nos 3 testes
- [ ] Registro no navegador funciona sem erro de CORS

---

**Layout responsivo e profissional mantido em todo o sistema! 🎨**
