# Guia de Contribuição - Limpa Celular

## Bem-vindo!

Obrigado por considerar contribuir com o projeto **Limpa Celular**. Este documento fornece diretrizes para manter a qualidade e consistência do código.

## Como Contribuir

### 1. Reportar Bugs

Antes de reportar um bug:
- Verifique se já não existe uma issue aberta
- Teste na última versão da `main`

**Template de Bug Report**:
```markdown
**Descrição**: Breve descrição do problema
**Passos para Reproduzir**:
1. ...
2. ...
**Comportamento Esperado**: O que deveria acontecer
**Comportamento Atual**: O que está acontecendo
**Screenshots**: (se aplicável)
**Ambiente**:
- OS: [Windows/Mac/Linux]
- Node: [versão]
- Navegador: [se web]
- Dispositivo: [se mobile]
```

### 2. Propor Funcionalidades

Abra uma issue com o label `enhancement` descrevendo:
- Problema que a feature resolve
- Solução proposta
- Alternativas consideradas

### 3. Submeter Pull Requests

#### Antes de Começar
1. Fork o repositório
2. Clone seu fork: `git clone https://github.com/SEU-USER/limpar-Celular.git`
3. Crie uma branch: `git checkout -b feature/nome-da-feature`

#### Durante o Desenvolvimento
- Siga as convenções de código (veja abaixo)
- Mantenha commits pequenos e focados
- Escreva mensagens de commit claras
- Teste localmente antes de fazer push

#### Ao Finalizar
1. Certifique-se de que o código compila sem erros
2. Adicione/atualize documentação se necessário
3. Push para seu fork: `git push origin feature/nome-da-feature`
4. Abra um Pull Request para `main`

**Template de Pull Request**:
```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código compila sem erros
- [ ] Layout responsivo mantido (se UI)
- [ ] Testado localmente
- [ ] Documentação atualizada (se necessário)
```

## Convenções de Código

### TypeScript/JavaScript

#### Estilo Geral
- **Indentação**: 2 espaços
- **Quotes**: Aspas duplas `"` (exceto quando necessário `'`)
- **Semicolons**: Obrigatórios
- **Naming**:
  - Componentes React: `PascalCase`
  - Funções/variáveis: `camelCase`
  - Constantes: `UPPER_SNAKE_CASE` (apenas se realmente constante)
  - Arquivos: `PascalCase.tsx` para componentes, `camelCase.ts` para utils

#### React/React Native

**Componentes funcionais com tipos explícitos**:
```tsx
// ✅ Bom
type Props = {
  title: string;
  onPress?: () => void;
};

export function MyComponent({ title, onPress }: Props) {
  // ...
}

// ❌ Evitar
export const MyComponent = (props: any) => {
  // ...
};
```

**Hooks no topo, lógica depois**:
```tsx
export function MyComponent() {
  // Hooks
  const [state, setState] = useState();
  const auth = useAuth();
  
  // Lógica/handlers
  const handlePress = () => { /* ... */ };
  
  // Render
  return <div>...</div>;
}
```

**Conditional rendering conciso**:
```tsx
// ✅ Bom
{isLoading && <Spinner />}
{error && <ErrorMessage text={error} />}

// ❌ Evitar ternários quando desnecessário
{isLoading ? <Spinner /> : null}
```

#### API/Backend

**Async/await sempre que possível**:
```ts
// ✅ Bom
async function getUser(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new Error("Not found");
  return user;
}

// ❌ Evitar promises encadeadas
function getUser(id: string) {
  return db.user.findUnique({ where: { id } })
    .then(user => { /* ... */ });
}
```

**Validação de input com Zod**:
```ts
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const parsed = schema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ message: "Dados inválidos" });
}
```

### CSS/Tailwind

**Ordem de classes** (sugerida):
1. Layout (`flex`, `grid`, `block`)
2. Posicionamento (`absolute`, `relative`)
3. Sizing (`w-`, `h-`, `max-w-`)
4. Spacing (`p-`, `m-`, `gap-`)
5. Tipografia (`text-`, `font-`)
6. Cores (`bg-`, `text-`, `border-`)
7. Efeitos (`shadow-`, `rounded-`)
8. Estados (`hover:`, `focus:`)

```tsx
<div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm hover:shadow-md">
  {/* ... */}
</div>
```

**Mobile-first**:
```tsx
// ✅ Bom - padrão mobile, breakpoints desktop
<div className="flex-col md:flex-row">

// ❌ Evitar - força desktop primeiro
<div className="flex-row md:flex-col">
```

### Git

#### Branches
- `main` - código em produção
- `develop` - desenvolvimento principal (se aplicável)
- `feature/nome-curto` - novas funcionalidades
- `fix/nome-curto` - correções
- `docs/nome-curto` - apenas documentação

#### Commits

**Formato**:
```
tipo(escopo): descrição curta

Descrição detalhada (opcional)
```

**Tipos**:
- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `docs` - Apenas documentação
- `style` - Formatação, sem mudança de lógica
- `refactor` - Refatoração sem mudar comportamento
- `test` - Adicionar/corrigir testes
- `chore` - Tarefas de manutenção (deps, config)

**Exemplos**:
```bash
git commit -m "feat(api): adicionar endpoint de scan real"
git commit -m "fix(web): corrigir padding em mobile"
git commit -m "docs: atualizar README com setup do banco"
git commit -m "style(mobile): ajustar cores do tema"
```

## Testes

### Atualmente
O projeto **não possui** testes automatizados ainda. Contribuições nessa área são bem-vindas!

### Plano Futuro
- **API**: Jest + Supertest para endpoints
- **Web**: Vitest + React Testing Library
- **Mobile**: Jest + React Native Testing Library

### Testes Manuais Obrigatórios
Antes de submeter PR, teste manualmente:

**API**:
```bash
npm run dev:api
# Teste endpoints via curl/Postman/Thunder Client
```

**Web**:
```bash
npm run dev:web
# Navegue pelas páginas em Chrome + mobile view
```

**Mobile**:
```bash
npm run dev:mobile
# Teste em emulador Android ou dispositivo físico
```

## Documentação

### Quando Documentar
- Novos endpoints da API → atualizar `ARCHITECTURE.md`
- Novas telas/componentes → adicionar descrição no código
- Mudanças no fluxo → atualizar `README.md`
- Novas variáveis de ambiente → documentar em ambos

### Estilo de Comentários

**TypeScript**:
```ts
/**
 * Cria uma nova solicitação de limpeza para o usuário.
 * @param userId - ID do usuário solicitante
 * @param deviceInfo - Descrição opcional do dispositivo
 * @returns Promise com a solicitação criada
 */
async function createRequest(userId: string, deviceInfo?: string) {
  // ...
}
```

**Evitar comentários óbvios**:
```ts
// ❌ Ruim
const total = 0; // declara total como 0

// ✅ Bom - explica o "por quê"
// Inicializa em 0 pois será incrementado no loop abaixo
const total = 0;
```

## Mantendo o Layout Responsivo e Profissional

### Princípios

1. **Mobile-first**: Desenhe para mobile, adapte para desktop
2. **Consistência**: Use o design system estabelecido (cores, espaçamentos)
3. **Acessibilidade**: Contraste adequado, touch targets de 44x44px mínimo
4. **Performance**: Evite animações complexas, otimize imagens

### Checklist de UI

Ao adicionar/modificar UI, verifique:

- [ ] Funciona em mobile (320px - 768px)
- [ ] Funciona em tablet (768px - 1024px)
- [ ] Funciona em desktop (1024px+)
- [ ] Botões têm área de toque suficiente (min 44px)
- [ ] Contraste de cores é adequado
- [ ] Estados de hover/focus são visíveis
- [ ] Loading states estão implementados
- [ ] Mensagens de erro são claras

### Padrões Visuais

**Espaçamento** (Web):
```tsx
// Cards
<div className="rounded-xl border bg-white p-4 shadow-sm md:p-6">

// Formulários
<form className="space-y-3"> {/* gap entre campos */}
  <input className="w-full rounded-xl border px-3 py-2" />
</form>
```

**Espaçamento** (Mobile):
```tsx
// Cards
<Card style={{ gap: spacing.md }}>

// Listas
<FlatList
  contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
/>
```

## Dúvidas?

- Abra uma issue com a label `question`
- Consulte a documentação em `ARCHITECTURE.md`
- Veja exemplos no código existente

## Código de Conduta

- Seja respeitoso e construtivo
- Aceite feedback com mente aberta
- Foque no problema, não na pessoa
- Comunique claramente e objetivamente

---

**Obrigado por contribuir! 🚀**
