# 🚀 Instruções de Deploy no Railway

Este guia ajudará você a configurar os Secrets necessários no GitHub e realizar o deploy automático no Railway.

---

## 📋 Pré-requisitos

1. ✅ Conta no [Railway](https://railway.app)
2. ✅ Conta no [GitHub](https://github.com)
3. ✅ Repositório: `cristiano-superacao/limpar-Celular`

---

## 🔐 Passo 1: Obter Token do Railway

1. Acesse [Railway Dashboard](https://railway.app/account/tokens)
2. Clique em **"Create New Token"**
3. Dê um nome (ex: `GitHub Actions Deploy`)
4. Copie o token gerado (começa com `RAILWAY_TOKEN_...`)

---

## 🗂️ Passo 2: Criar Projetos no Railway

### 2.1 Projeto para API

1. No [Railway Dashboard](https://railway.app/dashboard), clique em **"New Project"**
2. Selecione **"Empty Project"**
3. Nomeie como `limpa-celular-api`
4. Clique no projeto criado e copie o **Project ID** da URL:
   ```
   https://railway.app/project/{PROJECT_ID}
   ```

### 2.2 Projeto para Web

1. Repita o processo acima
2. Nomeie como `limpa-celular-web`
3. Copie o **Project ID** da URL

---

## 🗄️ Passo 3: Provisionar Banco de Dados PostgreSQL na Nuvem

⚠️ **IMPORTANTE**: O Railway provisiona PostgreSQL gerenciado na nuvem com configuração padrão otimizada.

### 3.1 Criar PostgreSQL no Railway

1. Abra o projeto `limpa-celular-api` no Railway
2. Clique em **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Aguarde 30-60 segundos (o Railway provisionará automaticamente)
4. O PostgreSQL será criado com **configuração padrão em nuvem**:
   - PostgreSQL 17.x (latest)
   - 500MB storage (plano free)
   - SSL/TLS habilitado
   - Backups automáticos
   - Schema `public` padrão

### 3.2 Obter DATABASE_URL

1. Clique no serviço **"Postgres"** criado (ícone 🐘)
2. Vá para a aba **"Variables"**
3. Copie o valor da variável **`DATABASE_URL`**
4. **ADICIONE** `?schema=public` ao final:
   ```
   postgresql://postgres:senha@host.railway.app:5432/railway?schema=public
   ```

📖 **Guia detalhado**: [RAILWAY_POSTGRES_SETUP.md](RAILWAY_POSTGRES_SETUP.md)

---

## 🔑 Passo 4: Gerar JWT Secret

Execute no terminal (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copie o valor gerado (algo como `Xk9Ym3Qp7Rw8...`).

---

## 🔒 Passo 5: Configurar GitHub Secrets

1. Vá para o repositório: [https://github.com/cristiano-superacao/limpar-Celular](https://github.com/cristiano-superacao/limpar-Celular)
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **"New repository secret"** para cada um:

| Nome do Secret | Valor | Origem |
|----------------|-------|--------|
| `RAILWAY_TOKEN` | `RAILWAY_TOKEN_...` | Passo 1 |
| `RAILWAY_PROJECT_ID_API` | `abc123...` | Passo 2.1 (Project ID da API) |
| `RAILWAY_PROJECT_ID_WEB` | `def456...` | Passo 2.2 (Project ID da Web) |
| `DATABASE_URL` | `postgresql://...?schema=public` | Passo 3 |
| `JWT_SECRET` | `Xk9Ym3Qp7Rw8...` | Passo 4 |
| `VITE_API_URL` | `https://limpa-celular-api.up.railway.app` | Será atualizado após deploy |

---

## ⚙️ Passo 5.1: Configurar Variáveis DIRETAMENTE no Railway

**⚠️ IMPORTANTE**: Além dos GitHub Secrets, você DEVE configurar as variáveis diretamente nos serviços do Railway:

### API Service Variables

1. Vá para Railway Dashboard → Projeto `limpa-celular-api`
2. Clique no service **"api"**
3. Vá para a aba **"Variables"**
4. Adicione EXATAMENTE estas variáveis (nomes corretos):

```bash
DATABASE_URL=postgresql://postgres:senha@host.railway.internal:5432/railway?schema=public
JWT_SECRET=seu-jwt-secret-aqui-min-16-chars
PORT=4000
```

### Web Service Variables

1. Vá para Railway Dashboard → Projeto `limpa-celular-web`
2. Clique no service **"web"**
3. Vá para a aba **"Variables"**
4. Adicione EXATAMENTE esta variável:

```bash
VITE_API_URL=https://[dominio-real-da-api].up.railway.app
```

**✅ Nomes corretos das variáveis**:
- ✅ `DATABASE_URL` (não `URL_DO_BANCO_DE_DADOS`)
- ✅ `JWT_SECRET` (não `JWT_TOKEN` ou `SECRET`)
- ✅ `VITE_API_URL` (não `URL_DA_API_VITE` ou `API_URL`)

---

## 🚀 Passo 6: Iniciar Deploy Automático

1. Após configurar todos os Secrets, vá para o repositório
2. Vá para a aba **Actions**
3. Clique no workflow **"Deploy to Railway"**
4. Clique em **"Run workflow"** → **"Run workflow"**
5. Aguarde a conclusão (≈5-10 minutos)

---

## ✅ Passo 7: Obter URLs Públicas

### 7.1 URL da API

1. Vá para o projeto `limpa-celular-api` no Railway
2. Clique no serviço **"api"** criado pelo workflow
3. Vá para a aba **"Settings"**
4. Em **"Networking"**, clique em **"Generate Domain"**
5. Copie a URL gerada (ex: `https://limpa-celular-api.up.railway.app`)

### 7.2 URL do Web

1. Vá para o projeto `limpa-celular-web` no Railway
2. Clique no serviço **"web"** criado pelo workflow
3. Vá para a aba **"Settings"**
4. Em **"Networking"**, clique em **"Generate Domain"**
5. Copie a URL gerada (ex: `https://limpa-celular-web.up.railway.app`)

---

## 🔄 Passo 8: Atualizar VITE_API_URL

1. Copie a URL da API do Passo 7.1
2. Vá para **Settings** → **Secrets and variables** → **Actions**
3. Edite o Secret `VITE_API_URL` com a URL real da API
4. Execute o workflow novamente para atualizar o Web

---

## 🧪 Passo 9: Testar Deploy

### 9.1 Testar API

Abra no navegador:
```
https://limpa-celular-api.up.railway.app/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T..."
}
```

### 9.2 Testar Web

1. Abra no navegador: `https://limpa-celular-web.up.railway.app`
2. Clique em **"Criar Conta"**
3. Cadastre um usuário de teste
4. Faça login

✅ **Sucesso!** Sistema funcionando em produção.

---

## 👤 Passo 10: Promover Primeiro Usuário a Admin

Para acessar funcionalidades administrativas (Configurações de Nuvem):

1. Conecte-se ao banco de dados PostgreSQL no Railway:
   - Vá para o serviço PostgreSQL
   - Aba **"Variables"** → copie valores de `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`
   
2. Use um cliente PostgreSQL (ex: DBeaver, pgAdmin, ou CLI):
   ```bash
   psql -h PGHOST -U PGUSER -d PGDATABASE -p PGPORT
   ```

3. Execute:
   ```sql
   UPDATE "User" 
   SET role = 'ADMIN' 
   WHERE email = 'seu-email@exemplo.com';
   ```

4. Faça logout e login novamente no Web para ver o menu Admin

---

## � Troubleshooting

### Problema: Workflow falha com erro de Prisma Client

**Solução**: Verifique que o `DATABASE_URL` no Secret tem `?schema=public` no final.

### Problema: Web não conecta na API (ERR_CONNECTION_REFUSED)

**Solução**: 
1. Verifique que `VITE_API_URL` está configurado NO RAILWAY (não só no GitHub)
2. Railway Dashboard → Web service → Variables → `VITE_API_URL`
3. Valor deve ser: `https://[dominio-api].up.railway.app`
4. Clique em **"Redeploy"** após alterar

### Problema: API retorna "Connection URL is empty"

**Solução**:
1. Vá para Railway Dashboard → API service → Variables
2. Verifique que `DATABASE_URL` existe e está preenchida
3. Deve ser EXATAMENTE: `DATABASE_URL` (não `URL_DO_BANCO_DE_DADOS`)
4. Formato: `postgresql://user:pass@host:5432/db?schema=public`
5. Clique em **"Redeploy"** após corrigir

### Problema: Build falha com "apt-get install libatomic1"

**Solução**: Este erro foi corrigido! Removemos o Dockerfile e agora usamos Nixpacks.
1. Certifique-se que `apps/api/Dockerfile` NÃO existe
2. Certifique-se que `nixpacks.toml` existe na raiz
3. Execute novo deploy: `git push origin main`

---

## 📚 Próximos Passos

Após deploy bem-sucedido:

1. 📱 Configure o app Mobile em `apps/mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://limpa-celular-api.up.railway.app
   ```

2. 🎨 Personalize branding (logos, cores, nomes)

3. ☁️ Configure integração real com Google Drive/Dropbox (atualmente mock)

4. 📊 Implemente lógica de varredura real do WhatsApp

5. 🔒 Configure domínio customizado no Railway (opcional)

---

## 📞 Suporte

- 📖 Documentação completa: [SYSTEM_AUDIT.md](SYSTEM_AUDIT.md)
- 🏗️ Arquitetura: [ARCHITECTURE.md](ARCHITECTURE.md)
- 🤝 Contribuições: [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Desenvolvido com ❤️ usando GitHub Copilot**
