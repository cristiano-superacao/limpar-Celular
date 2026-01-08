# 🚂 Configuração Railway - Guia Completo

## 📊 Status Atual
- ✅ **Web**: Online em `limpa-celular.up.railway.app`
- ✅ **Postgres**: Online com volume configurado
- ❌ **API**: Falha de build (será corrigido)

---

## 🔧 Variáveis de Ambiente Obrigatórias

### API Service

Configure estas variáveis no Railway Dashboard → Seu Projeto → API → Variables:

```bash
# Banco de Dados (fornecido automaticamente pelo Railway ao conectar o Postgres)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secret (gere uma chave segura)
JWT_SECRET=sua-chave-secreta-super-segura-com-minimo-32-caracteres

# CORS (opcional - domínio do frontend)
CORS_ORIGIN=https://limpa-celular.up.railway.app

# PORT (opcional - Railway define automaticamente)
PORT=3000
```

### Web Service

```bash
# URL da API (após API estar online)
VITE_API_URL=${{API.RAILWAY_PUBLIC_DOMAIN}}
```

---

## 🔗 Conectar Serviços

### 1. Conectar API com Postgres

1. Abra o projeto no Railway
2. Clique no serviço **API**
3. Vá em **Variables** → **+ New Variable**
4. Adicione:
   ```
   DATABASE_URL = ${{Postgres.DATABASE_URL}}
   ```
5. Salve

### 2. Conectar Web com API

1. Clique no serviço **Web**
2. Vá em **Variables** → **+ New Variable**
3. Adicione:
   ```
   VITE_API_URL = https://${{API.RAILWAY_PUBLIC_DOMAIN}}
   ```
4. Salve

---

## 🚀 Deploy Atualizado

### Após corrigir os arquivos

1. **Commit e Push**:
   ```bash
   git add .
   git commit -m "fix: corrigir configuração de build da API"
   git push origin main
   ```

2. **Railway fará deploy automático**
3. Aguarde ~3-5 minutos
4. Verifique os logs no Railway Dashboard

---

## ✅ Checklist de Validação

- [ ] API está online (sem erros de build)
- [ ] Postgres está conectado à API
- [ ] Web está conectado à API
- [ ] Teste de health: `https://sua-api.railway.app/health`
- [ ] Login funciona no frontend
- [ ] Dados são salvos no banco

---

## 🐛 Troubleshooting

### API não inicia

**Problema**: Erro "Config inválida" ou "DATABASE_URL"
**Solução**: 
1. Verifique se `DATABASE_URL` está configurado
2. Use formato: `${{Postgres.DATABASE_URL}}`

### CORS Error

**Problema**: Frontend não consegue conectar
**Solução**:
1. Adicione `CORS_ORIGIN` na API
2. Use o domínio exato do frontend
3. Exemplo: `https://limpa-celular.up.railway.app`

### Build Timeout

**Problema**: Build demora muito
**Solução**:
1. Use `npm ci --legacy-peer-deps`
2. Já corrigido no `nixpacks.toml`

---

## 📝 Comandos Úteis

### Gerar JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Verificar Logs Railway
```bash
# Via CLI (se instalado)
railway logs
```

### Testar API Local
```bash
npm run dev:api
curl http://localhost:3000/health
```

---

## 🔒 Segurança

- ✅ **JWT_SECRET**: Mínimo 32 caracteres aleatórios
- ✅ **DATABASE_URL**: Nunca commitar no git
- ✅ **CORS**: Configure apenas domínios confiáveis
- ✅ **HTTPS**: Railway fornece certificado SSL automático

---

## 📚 Referências

- [Railway Docs](https://docs.railway.app)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)
