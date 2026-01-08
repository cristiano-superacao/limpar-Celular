# 🧪 Guia de Teste Local - CORS

## Problema Identificado

O erro CORS no Railway indica que o preflight (OPTIONS) não está retornando os headers corretos.

## Correção Aplicada

✅ **CORS mais permissivo para Railway**
- Agora aceita qualquer origem que contenha `.railway.app` (mais robusto)
- Adiciona logs de debug para diagnóstico
- Callback com Error() para rejeitar origens não permitidas

## Como Testar Localmente

### Opção 1: Teste com Railway (Recomendado)

1. **Faça o commit e push:**
   ```bash
   cd "C:\Users\Superação\Desktop\Sistema\Limpa Celular"
   git add -A
   git commit -m "fix: corrige CORS para aceitar Railway domains de forma robusta"
   git push origin main
   ```

2. **Aguarde o deploy automático no Railway** (5-10 min)

3. **Verifique os logs da API no Railway:**
   - Procure por mensagens `CORS: origin allowed` ou `CORS: origin rejected`
   - Se aparecer "rejected", verifique o origin que está sendo enviado

4. **Teste no navegador:**
   - Abra `https://limpacelular.up.railway.app`
   - Tente fazer cadastro/login
   - Abra o Console (F12) para ver se o erro CORS ainda aparece

### Opção 2: Teste Localmente (Requer PostgreSQL)

Se você tem PostgreSQL instalado localmente:

1. **Configure o DATABASE_URL:**
   ```bash
   # No arquivo apps/api/.env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/limpacelular?schema=public"
   ```

2. **Rode as migrations:**
   ```bash
   cd apps/api
   npm run migrate
   ```

3. **Inicie a API:**
   ```bash
   npm start
   ```

4. **Em outro terminal, inicie o Web:**
   ```bash
   cd apps/web
   npm run dev
   ```

5. **Abra o navegador:**
   - Vá em `http://localhost:5173`
   - Tente fazer cadastro
   - Verifique o Console (F12)

### Opção 3: Teste Manual com HTML

Criamos um arquivo `test-cors-local.html` na raiz do projeto.

1. **Com a API rodando** (veja Opção 2), abra o arquivo no navegador:
   ```
   C:\Users\Superação\Desktop\Sistema\Limpa Celular\test-cors-local.html
   ```

2. Clique no botão "Testar Cadastro"

3. Veja o resultado na tela

## Verificações no Railway

### Variáveis de Ambiente (CRÍTICO)

**Serviço API:**
- ✅ `DATABASE_URL` (vem do Postgres, deve existir automaticamente)
- ✅ `JWT_SECRET` (qualquer string com 16+ caracteres)
- ✅ `PORT` (Railway define automaticamente, mas pode forçar 4000)
- ⚠️ `CORS_ORIGIN` (OPCIONAL - se ausente, aceita todos .railway.app)

**Serviço Web:**
- ⚠️ `VITE_API_URL` (**OBRIGATÓRIO**) - Deve apontar para o domínio público da API
  - Exemplo: `https://limpacelular-api.up.railway.app`
  - **ATENÇÃO**: Nome EXATO `VITE_API_URL` (sem espaços, sem acentos)

### Domínios Públicos

1. **API precisa de domínio público:**
   - No Railway, vá no serviço API → Settings → Networking
   - Clique em "Generate Domain"
   - Copie o domínio gerado (ex: `https://limpacelular-api.up.railway.app`)

2. **Configure VITE_API_URL no Web:**
   - No Railway, vá no serviço Web → Variables
   - Adicione: `VITE_API_URL=https://limpacelular-api.up.railway.app`
   - **Faça um novo deploy do Web** (Vite lê essa variável no build)

## Logs de Debug

Com as mudanças, a API agora loga:
- `CORS: origin allowed` - quando aceita
- `CORS: origin rejected` - quando rejeita (com detalhes)
- `CORS: request without origin allowed` - requisições sem origin

Verifique os logs da API no Railway para diagnosticar.

## Próximos Passos

1. Commitar e fazer push das alterações CORS
2. Aguardar deploy no Railway
3. Verificar logs da API
4. Testar cadastro/login no navegador
5. Se ainda der erro, compartilhe os logs da API (Railway Dashboard → API service → Deployments → View Logs)
