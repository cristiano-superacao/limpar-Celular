# Arquitetura do Sistema - Limpa Celular

## Visão Geral

Sistema MVP para limpeza de celulares com foco em mídia do WhatsApp, estruturado como monorepo com três aplicações independentes.

## Estrutura do Monorepo

```
limpa-celular/
├── apps/
│   ├── api/          # Backend REST API
│   ├── web/          # Frontend Web (React)
│   └── mobile/       # App Mobile (Expo/React Native)
├── .github/
│   └── copilot-instructions.md
├── package.json      # Workspaces root
└── README.md
```

## 1. API (Backend)

### Stack Técnica
- **Runtime**: Node.js v20+
- **Framework**: Express 5
- **Linguagem**: TypeScript
- **ORM**: Prisma 7
- **Database**: SQLite (desenvolvimento)
- **Auth**: JWT (jsonwebtoken)
- **Validação**: Zod

### Estrutura de Pastas

```
apps/api/
├── src/
│   ├── index.ts          # Entrypoint + rotas
│   ├── auth.ts           # JWT sign/verify + middleware
│   ├── env.ts            # Validação de variáveis de ambiente
│   └── db.ts             # PrismaClient configurado
├── prisma/
│   ├── schema.prisma     # Modelos do banco
│   └── migrations/       # Histórico de migrações
├── generated/prisma/     # Cliente Prisma gerado
├── .env                  # Variáveis de ambiente
└── tsconfig.json
```

### Modelos de Dados

#### User
- `id` (CUID)
- `email` (único)
- `passwordHash` (bcrypt)
- `role` (USER | ADMIN)
- `createdAt`

#### CleaningRequest
- `id` (CUID)
- `userId` (FK → User)
- `status` (PENDING | APPROVED | REJECTED | SCANNED | COMPLETED)
- `deviceInfo` (string opcional)
- `scanResultJson` (JSON com resultado da varredura)
- `createdAt` / `updatedAt`

#### CloudConfig
- `id` (CUID)
- `provider` (NONE | AZURE_BLOB | AWS_S3 | GOOGLE_DRIVE | OTHER)
- `enabled` (boolean)
- `bucketOrContainer` (string opcional)
- `region` (string opcional)
- `createdAt` / `updatedAt`

### Endpoints da API

#### Autenticação
- `POST /auth/register` - Cadastro de usuário
- `POST /auth/login` - Login (retorna JWT)
- `GET /me` - Dados do usuário logado (requer token)

#### Solicitações de Limpeza
- `POST /requests` - Criar solicitação (user)
- `GET /requests` - Listar (user vê suas, admin vê todas)
- `PATCH /requests/:id/status` - Alterar status (admin only)
- `POST /requests/:id/scan/mock` - Gerar varredura mock

#### Configuração de Nuvem (Admin)
- `GET /admin/cloud-config` - Obter configuração
- `PUT /admin/cloud-config` - Atualizar configuração

### Fluxo de Autenticação
1. Usuário registra (`/auth/register`) → senha é hasheada com bcrypt
2. Usuário faz login (`/auth/login`) → API retorna JWT com payload: `{ sub: userId, role: "USER"|"ADMIN" }`
3. Cliente armazena token e envia em `Authorization: Bearer <token>`
4. Middleware `requireAuth` valida token e injeta dados em `req.auth`
5. Middleware `requireRole("ADMIN")` valida role específica

### Varredura Mock
A API gera dados simulados de varredura agrupados por temas:
- **WhatsApp**: fotos, vídeos, áudios, documentos
- **Downloads**: arquivos gerais

Estrutura do JSON:
```json
{
  "generatedAt": "ISO timestamp",
  "groups": [
    {
      "theme": "WhatsApp",
      "items": [
        { "id": "...", "type": "photo", "sizeBytes": 2400000, "path": "..." }
      ]
    }
  ]
}
```

## 2. Web (Frontend)

### Stack Técnica
- **Bundler**: Vite 7
- **Framework**: React 19
- **Linguagem**: TypeScript
- **Roteamento**: React Router v7
- **Estilização**: Tailwind CSS v4 (PostCSS plugin)
- **HTTP**: Fetch API nativa

### Estrutura de Pastas

```
apps/web/
├── src/
│   ├── pages/              # Páginas principais
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── RequestDetail.tsx
│   │   └── AdminCloud.tsx
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Shell.tsx       # Layout com header/footer
│   │   └── Protected.tsx   # HOC para rotas autenticadas
│   ├── lib/
│   │   ├── api.ts          # Cliente HTTP + tipos
│   │   ├── auth.ts         # LocalStorage token
│   │   └── format.ts       # Formatação (bytes, status)
│   ├── App.tsx             # Configuração de rotas
│   ├── main.tsx            # Entrypoint
│   └── index.css           # Tailwind imports
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

### Fluxo de Navegação

```
/ → Redirect para /dashboard (se autenticado) ou /login
/login → Página de login
/register → Página de cadastro
/dashboard → Lista de solicitações + criar nova (protegido)
/requests/:id → Detalhes da solicitação + scan (protegido)
/admin/cloud → Configuração de nuvem (protegido + admin)
```

### Design System (Tailwind)

**Cores principais**:
- Primary: `slate-900` (texto e elementos principais)
- Background: `slate-50` (fundo geral)
- Card: `white` com `border` e `rounded-xl`
- Hover states: `slate-100`

**Layout responsivo**:
- Mobile-first
- Breakpoints padrão do Tailwind
- Container: `max-w-6xl mx-auto`
- Cards com `flex-col` em mobile, `flex-row` em desktop quando apropriado

## 3. Mobile (App)

### Stack Técnica
- **Framework**: Expo SDK 54
- **Runtime**: React Native 0.81
- **Linguagem**: TypeScript
- **Navegação**: React Navigation (native-stack)
- **Armazenamento**: expo-secure-store (token)
- **HTTP**: Fetch API nativa

### Estrutura de Pastas

```
apps/mobile/
├── src/
│   ├── screens/            # Telas principais
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── RequestDetailScreen.tsx
│   │   └── AdminCloudScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx  # Configuração de navegação
│   ├── auth/
│   │   └── AuthContext.tsx   # Context + token loading
│   ├── lib/
│   │   ├── api.ts            # Cliente HTTP + tipos
│   │   ├── auth.ts           # SecureStore token
│   │   └── format.ts         # Formatação
│   └── ui/
│       ├── theme.ts          # Cores, espaçamentos
│       └── components.tsx    # Componentes base (Button, Input, Card)
├── App.tsx                   # Entrypoint + AuthProvider
├── index.ts                  # Registro da app
├── app.json                  # Configuração Expo
└── package.json
```

### Design System (React Native)

**Theme** (`src/ui/theme.ts`):
```ts
colors: {
  primary: "#0f172a",    // slate-900
  bg: "#f8fafc",         // slate-50
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0"
}

spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 }
radius: { sm: 8, md: 12, lg: 16 }
```

**Componentes base**:
- `Card` → Container branco com sombra
- `Button` → Primário (bg) + Secondary (outline)
- `Input` → Campo de texto com borda
- `Title`, `Subtitle` → Tipografia consistente
- `InlineMessage` → Alertas inline (erro/sucesso)

### Navegação

**Auth Stack** (não autenticado):
- Login
- Register

**Main Stack** (autenticado):
- Dashboard
- RequestDetail
- AdminCloud

**Context de Auth**:
- Carrega token do SecureStore no mount
- Alterna stacks automaticamente

## Fluxo de Dados Completo

### 1. Cadastro/Login
```
User → Web/Mobile (form) → API /auth/register ou /login
API valida → gera JWT → retorna token
Client armazena token (localStorage/SecureStore)
```

### 2. Criar Solicitação
```
User → Dashboard → preenche deviceInfo → POST /requests
API cria CleaningRequest (status: PENDING) → retorna criado
Dashboard atualiza lista
```

### 3. Varredura Mock
```
User → RequestDetail → clica "Rodar scan"
Client → POST /requests/:id/scan/mock
API gera JSON fake → salva em scanResultJson → status = SCANNED
Client exibe grupos de itens por tema
```

### 4. Backup/Exclusão (Demo)
```
User → RequestDetail → clica "Backup" ou "Excluir" em item
Client exibe Alert/Modal informando que é demo
(Implementação real requer integração com sistema de arquivos nativo)
```

## Considerações de Segurança

### Implementado
- Senhas hasheadas com bcrypt (custo 10)
- JWT com secret configurável
- CORS habilitado (sem restrição no MVP)
- Token validado em todas as rotas protegidas
- Role-based access control (USER vs ADMIN)

### Pendente (Produção)
- HTTPS obrigatório
- Refresh tokens
- Rate limiting
- CORS com whitelist
- Rotação de JWT_SECRET
- Auditoria de ações sensíveis
- Validação de input mais rigorosa

## Limitações do MVP

### Varredura Real de Arquivos
- **Atual**: Mock JSON gerado pela API
- **Real**: Requer:
  - Permissões nativas Android (READ_EXTERNAL_STORAGE)
  - Acesso ao sistema de arquivos via React Native File System
  - Parsing de estrutura de pastas do WhatsApp
  - Identificação de tipos MIME

### Backup para Nuvem
- **Atual**: Configuração salva mas não executada
- **Real**: Requer:
  - SDKs específicos (Azure Blob, AWS S3, Google Drive)
  - Upload multipart para arquivos grandes
  - Progresso de upload
  - Retry logic

### Exclusão de Arquivos
- **Atual**: Apenas UI demonstrativa
- **Real**: Requer:
  - Permissões nativas Android (WRITE_EXTERNAL_STORAGE)
  - Confirmação dupla do usuário
  - Possível root access para arquivos do WhatsApp

## Compatibilidade

### Node.js
- Mínimo: v20 LTS
- Recomendado: v20.18+

### Navegadores (Web)
- Chrome/Edge: últimas 2 versões
- Firefox: últimas 2 versões
- Safari: últimas 2 versões

### Mobile
- Android: 8.0+ (API 26+)
- iOS: 13.4+

## Ambiente de Desenvolvimento

### Variáveis de Ambiente

**API** (`.env`):
```
DATABASE_URL=file:./dev.db
JWT_SECRET=sua-chave-secreta-minimo-16-chars
PORT=4000
```

**Mobile** (runtime):
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
```

### Comandos Úteis

```bash
# Instalar dependências
npm install

# Dev
npm run dev:api
npm run dev:web
npm run dev:mobile

# Build
npm run -w apps/api build
npm run -w apps/web build

# Prisma
cd apps/api
npx prisma studio          # UI do banco
npx prisma migrate dev     # Criar migração
npx prisma generate        # Gerar client
```

## Próximos Passos (Roadmap)

### Curto Prazo
- [ ] Seed script para usuário admin
- [ ] Testes unitários (API endpoints)
- [ ] CI/CD básico (GitHub Actions)
- [ ] Deploy API (Railway/Render)
- [ ] Deploy Web (Vercel/Netlify)

### Médio Prazo
- [ ] PostgreSQL em produção
- [ ] Implementar varredura real (Android)
- [ ] Integração com Azure Blob
- [ ] Push notifications (Expo)
- [ ] Histórico de varreduras

### Longo Prazo
- [ ] Suporte iOS
- [ ] ML para categorização inteligente
- [ ] Compressão antes do upload
- [ ] Agendamento de limpezas
- [ ] Dashboard analytics (admin)
