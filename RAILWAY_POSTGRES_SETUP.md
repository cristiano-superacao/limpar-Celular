# 🗄️ Configuração do PostgreSQL no Railway

Guia completo para provisionar e configurar o banco de dados PostgreSQL na nuvem usando Railway com configuração padrão.

---

## 📋 Visão Geral

O Railway fornece PostgreSQL gerenciado na nuvem com:
- ✅ Backup automático
- ✅ Alta disponibilidade
- ✅ Conexão segura via TLS
- ✅ 500MB gratuito (plano Developer)
- ✅ Escalável conforme necessidade

---

## 🚀 Passo a Passo: Provisionar PostgreSQL

### Passo 1: Acessar o Projeto da API

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Localize e abra o projeto **`limpa-celular-api`**
3. Você verá o service **"api"** já criado

### Passo 2: Adicionar Serviço PostgreSQL

1. No projeto `limpa-celular-api`, clique no botão **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Aguarde 30-60 segundos enquanto o Railway provisiona o banco

### Passo 3: Obter a URL de Conexão

Após o PostgreSQL ser provisionado:

1. Clique no serviço **"Postgres"** (ícone de elefante 🐘)
2. Vá para a aba **"Variables"**
3. Você verá várias variáveis, incluindo:
   - `DATABASE_URL` ou `POSTGRES_URL`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_HOST`
   - `POSTGRES_DB`

4. **Copie a variável `DATABASE_URL`** completa

   Formato padrão:
   ```
   postgresql://postgres:senha123@containers-us-west-XXX.railway.app:5432/railway
   ```

### Passo 4: Adicionar Schema ao URL

**⚠️ IMPORTANTE**: O Prisma requer o parâmetro `?schema=public` no final da URL.

Se a URL copiada for:
```
postgresql://postgres:abc123@host.railway.app:5432/railway
```

Adicione `?schema=public` no final:
```
postgresql://postgres:abc123@host.railway.app:5432/railway?schema=public
```

---

## ⚙️ Configurar Variável no Service da API

### Opção 1: Via Interface Railway (Recomendado)

1. No projeto `limpa-celular-api`, clique no service **"api"**
2. Vá para a aba **"Variables"**
3. Clique em **"+ New Variable"**
4. Configure:
   ```
   Variable name: DATABASE_URL
   Value: postgresql://postgres:senha@host.railway.app:5432/railway?schema=public
   ```
5. Clique em **"Add"**

### Opção 2: Referência Automática (Avançado)

O Railway pode criar referências automáticas entre serviços:

1. No service **"api"**, aba **"Variables"**
2. Clique em **"+ New Variable"**
3. Selecione **"Add Reference"**
4. Escolha: Service: **Postgres** → Variable: **`DATABASE_URL`**
5. Clique em **"Add"**
6. **EDITE a variável** e adicione `?schema=public` ao final

---

## 🔐 Configurar GitHub Secret

Para que o GitHub Actions possa configurar a variável durante deploy:

1. Copie a `DATABASE_URL` completa (com `?schema=public`)
2. Vá para: [GitHub Repository Settings](https://github.com/cristiano-superacao/limpar-Celular/settings/secrets/actions)
3. Clique em **"New repository secret"**
4. Configure:
   ```
   Name: DATABASE_URL
   Secret: postgresql://postgres:senha@host:5432/railway?schema=public
   ```
5. Clique em **"Add secret"**

---

## ✅ Verificar Configuração

### 1. Verificar Variáveis no Railway

**API Service deve ter:**
```
DATABASE_URL=postgresql://...?schema=public
JWT_SECRET=seu-secret-aqui
PORT=4000
```

### 2. Testar Conexão Localmente (Opcional)

Para testar a conexão antes do deploy:

1. Copie a `DATABASE_URL` do Railway
2. Crie arquivo `apps/api/.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:senha@host.railway.app:5432/railway?schema=public"
   JWT_SECRET="test-secret-min-16-chars"
   PORT=4000
   ```
3. Execute:
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

Se funcionar, você verá:
```
✔ Migrations applied successfully
```

---

## 🚀 Fazer Deploy

### Opção 1: Via GitHub Actions (Automático)

O workflow já está configurado! Basta fazer push:

```bash
git push origin main
```

O GitHub Actions irá:
1. ✅ Configurar `DATABASE_URL` no Railway
2. ✅ Gerar Prisma Client
3. ✅ Fazer build da API
4. ✅ Deploy no Railway
5. ✅ Executar migrations automaticamente no start

### Opção 2: Redeploy Manual no Railway

1. Railway Dashboard → Projeto API → Service "api"
2. Clique nos **3 pontinhos** (⋮) no canto superior direito
3. Selecione **"Redeploy"**
4. Aguarde o deploy completar (~3-5 min)

---

## 📊 Configuração Padrão do PostgreSQL Railway

O Railway provisiona PostgreSQL com estas configurações:

| Configuração | Valor Padrão |
|--------------|--------------|
| Versão PostgreSQL | 17.x (latest stable) |
| Armazenamento | 500MB (plano free) |
| Conexões simultâneas | 20 (plano free) |
| Backup | Automático (diário) |
| SSL/TLS | Habilitado por padrão |
| Schema padrão | `public` |
| Charset | UTF-8 |
| Timezone | UTC |

---

## 🔍 Verificar Banco de Dados

### Via Railway Dashboard

1. Railway → Projeto API → Service "Postgres"
2. Aba **"Data"** (ícone de tabela)
3. Você pode ver tabelas, executar queries SQL

### Via Client SQL (pgAdmin, DBeaver, etc.)

Use as variáveis individuais para conectar:

```
Host: POSTGRES_HOST (ex: containers-us-west-123.railway.app)
Port: POSTGRES_PORT (geralmente 5432)
Database: POSTGRES_DB (geralmente "railway")
User: POSTGRES_USER (geralmente "postgres")
Password: POSTGRES_PASSWORD (senha gerada automaticamente)
```

---

## 🐛 Troubleshooting

### Erro: "Connection URL is empty"

**Causa**: A variável `DATABASE_URL` não está configurada no Railway.

**Solução**:
1. Railway → API service → Variables
2. Adicione `DATABASE_URL` com o valor completo
3. Clique em "Redeploy"

### Erro: "schema public does not exist"

**Causa**: Falta o `?schema=public` no final da URL.

**Solução**:
1. Edite a variável `DATABASE_URL`
2. Adicione `?schema=public` no final
3. Clique em "Redeploy"

### Erro: "Connection timeout"

**Causa**: Firewall ou network issue.

**Solução**:
1. Verifique que o Postgres service está **Online** (verde)
2. Railway → Postgres service → Settings → Verifique "Public Networking" está habilitado
3. Tente redeployar o Postgres: Settings → "Restart"

### Erro: "password authentication failed"

**Causa**: Senha incorreta ou URL malformada.

**Solução**:
1. Copie novamente a `DATABASE_URL` do Postgres service → Variables
2. NÃO modifique a senha manualmente
3. Use a URL exatamente como fornecida + `?schema=public`

---

## 📈 Monitoramento

### Ver Logs da API

Railway → API service → **"Deployments"** → Clique no deployment ativo → Ver logs em tempo real

Você deve ver:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database
✔ Applied migrations
Server listening on port 4000
```

### Métricas do PostgreSQL

Railway → Postgres service → **"Metrics"**

Você pode ver:
- CPU usage
- Memory usage
- Disk usage
- Active connections

---

## 💰 Custos e Limites

### Plano Developer (Grátis)

- ✅ 500MB de armazenamento PostgreSQL
- ✅ 5 USD de crédito mensal
- ✅ Backups automáticos
- ⚠️ Sem SLA de uptime

### Plano Pro

- 💎 8GB+ armazenamento
- 💎 SLA 99.9% uptime
- 💎 Prioridade no suporte
- 💎 A partir de $20/mês

---

## 🎯 Próximos Passos

Após configurar o PostgreSQL:

1. ✅ Redeploy da API no Railway
2. ✅ Testar endpoint: `https://[api-url].up.railway.app/health`
3. ✅ Configurar `VITE_API_URL` no Web service
4. ✅ Redeploy do Web no Railway
5. ✅ Testar registro/login no frontend
6. ✅ Promover primeiro usuário a ADMIN via SQL:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'seu@email.com';
   ```

---

## 📚 Recursos Adicionais

- [Railway PostgreSQL Docs](https://docs.railway.app/databases/postgresql)
- [Prisma Railway Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

---

**✅ Configuração Padrão do Railway = Pronto para Produção!**

Não é necessário ajustar parâmetros do PostgreSQL. A configuração padrão é otimizada para aplicações web modernas.

---

**Layout responsivo e profissional mantido em toda a aplicação! 🎨**
