# 🧪 Guia de Teste Local

## Pré-requisitos

- ✅ Docker Desktop instalado e rodando
- ✅ Node.js 18+ instalado
- ✅ npm instalado

## 1. Iniciar PostgreSQL Local

```bash
# Na raiz do projeto
cd "C:\Users\Superação\Desktop\Sistema\Limpa Celular"

# Iniciar PostgreSQL com Docker
docker-compose up -d

# Verificar se está rodando (deve mostrar "healthy")
docker-compose ps
```

## 2. Rodar Migrations

```bash
# Ir para a pasta da API
cd apps/api

# Aplicar migrations no banco local
npx prisma migrate deploy

# (Opcional) Ver o banco de dados
npx prisma studio
```

## 3. Iniciar a API

```bash
# Na pasta apps/api
npm start
```

Você deve ver:
```
🚀 API rodando em http://localhost:4000
✅ Conectado ao banco de dados
```

## 4. Iniciar o Web

Em **outro terminal**:

```bash
# Voltar para a raiz
cd "C:\Users\Superação\Desktop\Sistema\Limpa Celular"

# Ir para a pasta web
cd apps/web

# Iniciar em modo desenvolvimento
npm run dev
```

Você deve ver:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## 5. Testar

1. **Abra o navegador:** `http://localhost:5173`

2. **Teste o cadastro:**
   - Clique em "Criar conta"
   - Preencha: nome, email, senha
   - Clique em "Cadastrar"
   - ✅ Deve criar a conta e fazer login

3. **Teste o login:**
   - Use as credenciais criadas
   - ✅ Deve entrar no dashboard

4. **Teste o backup:**
   - Vá em "Minhas Solicitações"
   - Crie uma nova solicitação
   - Clique em "Fazer backup"
   - ✅ Deve mostrar mensagem de sucesso

## 6. Ver Logs da API

No terminal da API, você deve ver logs como:
```
CORS: origin allowed - http://localhost:5173
POST /auth/register 200
POST /auth/login 200
POST /backups 201
```

## 7. Parar o Ambiente

```bash
# Parar API e Web: Ctrl+C nos terminais

# Parar PostgreSQL (mas mantém dados)
docker-compose stop

# Parar e REMOVER dados (cuidado!)
docker-compose down -v
```

## Problemas Comuns

### Erro: "Docker não está rodando"
- Abra o Docker Desktop
- Aguarde inicializar
- Tente novamente

### Erro: "Porta 5432 já em uso"
- Você já tem PostgreSQL instalado
- Pare o serviço ou mude a porta no docker-compose.yml:
  ```yaml
  ports:
    - "5433:5432"  # Usa 5433 no host
  ```
- Atualize DATABASE_URL no .env:
  ```
  DATABASE_URL="postgresql://limpacelular:dev123456@localhost:5433/limpacelular_dev?schema=public"
  ```

### Erro: "VITE_API_URL is not defined"
- Isso só acontece em produção
- Localmente, o Vite usa `http://localhost:4000` automaticamente

### CORS ainda dá erro localmente
- Verifique se a API está rodando em `http://localhost:4000`
- Verifique se o Web está em `http://localhost:5173`
- Veja os logs da API para confirmar que `http://localhost:5173` está sendo aceito
