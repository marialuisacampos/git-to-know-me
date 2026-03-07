# UI Consistency

## Design tokens

Definidos em `app/globals.css` via `@theme`:

- **Paleta base**: slate (100-950), blue, purple, cyan, pink, red.
- **Tokens semanticos**: `--color-background`, `--color-foreground`, `--color-card`, `--color-primary`, `--color-border`, `--color-muted`, `--color-destructive`.
- **Radius**: `--radius: 0.5rem`.
- **Fontes**: Geist Sans (corpo), Geist Mono (codigo).

Nao criar cores avulsas fora dos tokens. Para variantes de opacidade, usar o padrao `rgb(R G B / alpha)` ja existente.

## Componentes base

Localizados em `components/base-ui/`:

- **Button**: variantes `default`, `primary`, `ghost`, `outline`; tamanhos `sm`, `default`, `lg`, `icon`.
- **Input**, **TextArea**, **Switch**: primitivos Radix + Tailwind.
- **cn()** (`lib/utils.ts`): usar sempre para classes condicionais (`clsx` + `tailwind-merge`).

Preferir compor sobre esses primitivos em vez de criar novos do zero.

## Padrao visual

- Fundo escuro: `from-slate-950 via-slate-900 to-slate-950`.
- Cards: `bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-xl`.
- Animacoes de entrada: `animate-in fade-in slide-in-from-*`.
- Hover em cards: `hover:border-slate-700/80 hover:scale-[1.01]`.

## Estados obrigatorios

Todo componente que carrega dados deve implementar:

| Estado | Implementacao |
|--------|--------------|
| **Loading** | Skeleton (`SkeletonBase`) ou spinner; nunca tela em branco |
| **Empty** | Componente `EmptyState` com icone, titulo e acao |
| **Error** | Mensagem visivel ao usuario; nao falhar silenciosamente |

## Acessibilidade minima

- `aria-label` em botoes sem texto visivel (ex: icones).
- Foco visivel em elementos interativos (outline padrao do browser ou custom).
- Contraste minimo: texto claro sobre fundo escuro (slate-300+ sobre slate-900+).
- Semantica HTML: `<main>`, `<article>`, `<header>`, `<footer>`, `<nav>`, `<time>`.

## Responsividade

- Mobile-first: estilizar base para mobile, expandir com `sm:`, `md:`, `lg:`.
- Breakpoints usados: `sm` (640px), `md` (768px), `lg` (1024px).
- Containers: `max-w-3xl` (post), `max-w-4xl` (listagens), `max-w-6xl` (dashboard).
- Padding lateral: `px-4 sm:px-6 lg:px-8`.

## Markdown

Dois estilos definidos em `globals.css`:

- `.markdown-preview`: para posts de blog (tamanho padrao).
- `.markdown-preview-sm`: para READMEs em modais (menor).

Nao criar estilos de markdown avulsos; estender os existentes se necessario.
