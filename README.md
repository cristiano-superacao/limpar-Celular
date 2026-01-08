# Limpa Celular 🧹📱

Sistema MVP para limpeza de celulares com foco em mídia do WhatsApp, oferecendo opção de backup na nuvem antes da exclusão.

## 🎯 Funcionalidades

- 📝 Cadastro e autenticação de usuários (JWT)
- 🔍 Solicitação de varredura de arquivos
- 🗂️ Categorização por temas (WhatsApp, Downloads)
- ☁️ Configuração de backup em nuvem (Azure, AWS, Google Drive)
- 👤 Painel administrativo para gestão
- 📱 Interface web responsiva + app mobile nativo

## 🏗️ Arquitetura

Monorepo com três aplicações independentes:

- **Web**: Vite + React 19 + TypeScript + Tailwind CSS v4
- **API**: Node.js + Express + TypeScript + Prisma 7 + PostgreSQL
- **Mobile**: Expo SDK 54 + React Native + TypeScript

> ⚠️ **Nota importante**: Este MVP usa **varredura mock** (simulação). Acesso real a arquivos do WhatsApp no Android exige permissões nativas e implementação específica com React Native File System.

## Requisitos

- Node.js (recomendado: **20 LTS** ou superior compatível com Expo)
- npm

## Instalação

Na raiz do projeto:

```bash
npm install
```

## Rodando a API

```bash
npm run dev:api
```

- API padrão: `http://localhost:4000`
- Health check: `GET /health`

Configure `DATABASE_URL` (PostgreSQL) no `.env` da API. Exemplo:

```
DATABASE_URL=postgresql://usuario:senha@host:5432/banco?schema=public
JWT_SECRET=sua-chave-secreta
PORT=4000
```

Dica: você pode copiar o modelo em `apps/api/.env.example`.

## Rodando o Web

```bash
npm run dev:web
```

## Rodando o Mobile (Expo)

```bash
npm run dev:mobile
```

### Configurando a URL da API no celular

No app mobile, a URL é lida de `EXPO_PUBLIC_API_URL`.

Exemplo (substitua pelo IP do seu PC na mesma rede do celular):

```bash
set EXPO_PUBLIC_API_URL=http://192.168.0.10:4000
npm run dev:mobile
```

Se estiver usando emulador Android, normalmente funciona:
- `http://10.0.2.2:4000`

## Usuário Admin

O endpoint de configuração de nuvem (`/admin/cloud-config`) exige `role=ADMIN`.

Para promover um usuário para ADMIN no banco (modo simples):

1) Abra o Prisma Studio:
```bash
cd apps/api
npx prisma studio
```

2) Em `User`, altere o campo `role` para `ADMIN`.

## Deploy (Railway)

### 🔍 Verificar Configuração

```bash
node scripts/check-railway-config.js
```

### 📖 Guia Completo

Siga o passo a passo detalhado em **[DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)**:

1. Configurar 6 GitHub Secrets
2. Criar projetos Railway (API + Web)
3. Provisionar PostgreSQL
4. Deploy automático via GitHub Actions

### ⚙️ Variáveis de Ambiente

- `DATABASE_URL` - Conexão PostgreSQL (com `?schema=public`)
- `JWT_SECRET` - Chave para JWT (mínimo 16 chars)
- `VITE_API_URL` - URL pública da API no Railway

### 🐛 Troubleshooting

**Erro "Failed to connect" no Web:**

1. Verifique `VITE_API_URL` no GitHub Secrets
2. Deve apontar para URL da API: `https://[projeto]-api.up.railway.app`
3. Execute novo deploy: `git push origin main`

**API não inicia:**

1. Confirme `DATABASE_URL` termina com `?schema=public`
2. Verifique logs no Railway Dashboard → API service → Deployments

## 📋 Fluxo do MVP

1. **Registrar/Login**: Crie uma conta ou entre com credenciais existentes
2. **Solicitar limpeza**: Descreva o dispositivo e o que deseja limpar
3. **Varredura mock**: Sistema gera dados simulados separados por temas
4. **Backup/Exclusão**: Ações demonstrativas na UI (implementação real pendente)

## 📚 Documentação Adicional

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detalhes técnicos da arquitetura
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guia para contribuidores

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes.

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**Cristiano Superação**  
GitHub: [@cristiano-superacao](https://github.com/cristiano-superacao)

---

**Status do Projeto**: 🚧 MVP em desenvolvimento ativo
