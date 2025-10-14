/**
 * Script para popular o KV com dados fake
 * Uso: npm run seed:kv
 */

import {
  setUserRegistered,
  setUserConfig,
  setUserProjects,
  setUserPosts,
  isUserRegistered,
} from "../lib/kv";
import type { ProjectMeta, PostMeta } from "../types/portfolio";

const FAKE_USERNAME = "demouser";

async function seed() {
  console.log("🌱 Iniciando seed do KV...\n");

  try {
    // 1. Marcar usuário como registrado
    console.log(`📝 Registrando usuário: ${FAKE_USERNAME}`);
    await setUserRegistered(FAKE_USERNAME);

    // Verificar
    const registered = await isUserRegistered(FAKE_USERNAME);
    console.log(`✅ Usuário registrado: ${registered}\n`);

    // 2. Adicionar bio customizada
    console.log("💬 Adicionando bio...");
    await setUserConfig(FAKE_USERNAME, {
      bio: "Desenvolvedor full-stack apaixonado por criar experiências únicas. Especialista em React, Next.js e design systems modernos.",
    });
    console.log("✅ Bio adicionada\n");

    // 3. Adicionar 2 projetos fake
    console.log("📦 Adicionando projetos...");

    const projects: ProjectMeta[] = [
      {
        fullName: "demouser/awesome-portfolio",
        name: "awesome-portfolio",
        descriptionHtml: `<h1>Awesome Portfolio</h1>
<p>Um portfolio moderno e inovador construído com Next.js 15 e Tailwind CSS.</p>
<h2>Features</h2>
<ul>
<li>Glassmorphism design</li>
<li>Animações fluidas</li>
<li>Dark mode premium</li>
<li>Performance otimizada</li>
</ul>
<h2>Tech Stack</h2>
<p>Next.js, React, TypeScript, Tailwind CSS, Framer Motion</p>`,
        language: "TypeScript",
        topics: [
          "nextjs",
          "react",
          "tailwindcss",
          "portfolio",
          "glassmorphism",
        ],
        stars: 142,
        pushedAt: "2024-10-10T15:30:00Z",
        homepageUrl: "https://awesome-portfolio.vercel.app",
        previewUrl: "https://awesome-portfolio.vercel.app",
      },
      {
        fullName: "demouser/design-system",
        name: "design-system",
        descriptionHtml: `<h1>Design System</h1>
<p>Sistema de design completo e acessível, pronto para produção.</p>
<h2>Componentes</h2>
<ul>
<li>50+ componentes React</li>
<li>WCAG AAA compliance</li>
<li>Temas customizáveis</li>
<li>Storybook integrado</li>
</ul>
<p><strong>Instalação:</strong> <code>npm install @demouser/design-system</code></p>
<p><strong>Demo:</strong> https://demouser-design-system.netlify.app</p>`,
        language: "TypeScript",
        topics: ["design-system", "react", "accessibility", "components"],
        stars: 89,
        pushedAt: "2024-10-08T10:15:00Z",
        previewUrl: "https://demouser-design-system.netlify.app",
      },
    ];

    await setUserProjects(FAKE_USERNAME, projects);
    console.log(`✅ ${projects.length} projetos adicionados\n`);

    // 4. Adicionar 1 post fake
    console.log("📝 Adicionando post...");

    const posts: PostMeta[] = [
      {
        slug: "construindo-portfolio-moderno",
        title: "Construindo um Portfolio Moderno com Next.js 15",
        summary:
          "Aprenda a criar um portfolio impressionante com as últimas tecnologias web: Next.js 15, React Server Components, Tailwind CSS e animações premium.",
        contentMdx: `# Introdução

Neste artigo, vou compartilhar como construí meu portfolio usando as tecnologias mais modernas do ecossistema React.

## Por que Next.js 15?

Next.js 15 trouxe melhorias significativas:

- **React Server Components** por padrão
- **Turbopack** para builds ultra-rápidos
- **App Router** maduro e estável
- **Streaming SSR** para performance

## Glassmorphism Design

O efeito de vidro fosco (glassmorphism) adiciona profundidade e modernidade:

\`\`\`css
backdrop-blur-2xl
bg-slate-900/30
border-slate-800/50
\`\`\`

### Vantagens

1. **Visual premium** - parece caro e polido
2. **Hierarquia clara** - layers de profundidade
3. **Legibilidade** - contraste mantido
4. **Performance** - GPU accelerated

## Animações Fluidas

Usei Tailwind CSS para animações:

\`\`\`tsx
<div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
  <h1>Título animado</h1>
</div>
\`\`\`

### Princípios

- **Stagger sequences** - elementos aparecem em ritmo
- **Easing suave** - ease-out para naturalidade
- **Duração adequada** - 300-700ms (não muito rápido)

## Código de Exemplo

Aqui está como criar um card com glass effect:

\`\`\`typescript
export function GlassCard({ children }) {
  return (
    <div className="relative group">
      {/* Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r 
           from-blue-600/20 to-purple-600/20 
           opacity-0 group-hover:opacity-100 
           blur-xl transition-opacity duration-500" />
      
      {/* Glass */}
      <div className="relative bg-slate-900/40 
           backdrop-blur-xl border border-slate-800/50 
           rounded-2xl p-6">
        {children}
      </div>
    </div>
  );
}
\`\`\`

## Performance

Mesmo com todas essas animações, o site mantém:

> **LCP** < 2.5s  
> **CLS** < 0.1  
> **FID** < 100ms

## Conclusão

Criar um portfolio moderno não é só sobre tecnologia, mas sobre **craft** - atenção aos detalhes, animações suaves, e uma experiência que surpreende.

**Stack final:**
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Redis (KV)

---

_Espero que este artigo tenha inspirado você a criar algo único!_ ✨`,
        tags: ["nextjs", "react", "typescript", "tutorial", "design"],
        publishedAt: "2024-10-12T09:00:00Z",
      },
    ];

    await setUserPosts(FAKE_USERNAME, posts);
    console.log(`✅ ${posts.length} post adicionado\n`);

    // 5. Resumo
    console.log("🎉 Seed completo!\n");
    console.log("📊 Dados criados:");
    console.log(`   - Username: ${FAKE_USERNAME}`);
    console.log(`   - Projetos: ${projects.length}`);
    console.log(`   - Posts: ${posts.length}`);
    console.log(`   - Bio: ✓\n`);
    console.log("🌐 Links úteis:");
    console.log(`   - Perfil:    http://localhost:3001/u/${FAKE_USERNAME}`);
    console.log(
      `   - Dashboard: http://localhost:3001/dev/login/${FAKE_USERNAME}`
    );
    console.log(`   - Dev Tools: http://localhost:3001/dev\n`);
    console.log("💡 Dica: Acesse /dev/login/demouser para simular login!\n");
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  }
}

// Executar
seed()
  .then(() => {
    console.log("✅ Seed finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });
