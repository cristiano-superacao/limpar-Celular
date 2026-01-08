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

## 🗄️ Passo 3: Provisionar Banco de Dados PostgreSQL

1. Abra o projeto `limpa-celular-api` no Railway
2. Clique em **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Aguarde a provisão do banco
4. Clique no serviço PostgreSQL criado
5. Vá para a aba **"Variables"**
6. Copie o valor da variável **`DATABASE_URL`**
7. **IMPORTANTE**: Adicione `?schema=public` ao final da URL:
   ```
   postgresql://user:pass@host:5432/railway?schema=public
   ```

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

⚠️ **Nota**: O `VITE_API_URL` pode ser temporariamente definido como acima. Atualize após o primeiro deploy com a URL real da API.

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

## 🔧 Troubleshooting

### Problema: Workflow falha com erro de Prisma Client

**Solução**: Verifique que o `DATABASE_URL` no Secret tem `?schema=public` no final.

### Problema: Web não conecta na API

**Solução**: 
1. Verifique que o `VITE_API_URL` está correto (URL da API do Railway)
2. Execute o workflow novamente após atualizar o Secret

### Problema: API retorna erro 500

**Solução**:
1. Vá para o serviço API no Railway
2. Aba **"Deployments"** → clique no último deploy
3. Veja os logs para identificar o erro
4. Verifique as variáveis de ambiente na aba **"Variables"**

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
