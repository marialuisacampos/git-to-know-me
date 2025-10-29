import Link from "next/link";
import { HiChevronLeft, HiRefresh, HiEye, HiFolder } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import { BackgroundAnimation } from "@/components/BackgroundAnimation";

export default function HowToUsePage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <BackgroundAnimation />

      <div className="relative z-10 min-h-screen px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-8 group"
          >
            <HiChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Link>

          <div className="space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-slate-100">
                Como usar o git-to-know-me
              </h1>
              <p className="text-slate-400 text-lg">
                Transforme seus repositórios do GitHub em um portfólio
                profissional
              </p>
            </div>

            <section className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-semibold">
                    1
                  </span>
                  <h2 className="text-xl font-semibold text-slate-100">
                    Como funciona
                  </h2>
                </div>
                <div className="pl-10 space-y-3">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    O git-to-know-me conecta-se à API do GitHub para buscar seus
                    repositórios públicos e posts do blog. Você tem controle
                    total sobre o que exibir e como personalizar seu portfólio.
                  </p>
                  <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-500">
                      <FaGithub className="inline w-3.5 h-3.5 mr-1" />
                      Conecta via OAuth • Lê apenas dados públicos • Sem acesso
                      de escrita
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-semibold">
                    2
                  </span>
                  <h2 className="text-xl font-semibold text-slate-100">
                    Sincronizar seus dados
                  </h2>
                </div>
                <div className="pl-10 space-y-3">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    No primeiro login, seus repositórios são sincronizados
                    automaticamente. Após isso, você controla quando atualizar:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400/50 mt-2 flex-shrink-0" />
                      <span>
                        Acesse o{" "}
                        <strong className="text-slate-300">Dashboard</strong> e
                        clique em{" "}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800/50 rounded text-xs">
                          <HiRefresh className="w-3 h-3" />
                          Sincronizar
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400/50 mt-2 flex-shrink-0" />
                      <span>
                        Ou clique no ícone de configurações no seu perfil
                        público
                      </span>
                    </li>
                  </ul>
                  <div className="bg-slate-800/20 border border-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">
                      <strong className="text-slate-400">Dica:</strong>{" "}
                      Sincronize sempre que criar novos repositórios ou publicar
                      posts
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-semibold">
                    3
                  </span>
                  <h2 className="text-xl font-semibold text-slate-100">
                    Criar um blog
                  </h2>
                </div>
                <div className="pl-10 space-y-3">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Para ter um blog integrado ao seu portfólio:
                  </p>
                  <ol className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-medium flex-shrink-0">
                        1.
                      </span>
                      <span>
                        Crie um repositório público chamado{" "}
                        <code className="px-1.5 py-0.5 bg-slate-800/50 text-blue-400 rounded text-xs">
                          blog-posts
                        </code>{" "}
                        no GitHub
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-medium flex-shrink-0">
                        2.
                      </span>
                      <span>
                        Adicione arquivos{" "}
                        <code className="px-1.5 py-0.5 bg-slate-800/50 text-slate-300 rounded text-xs">
                          .md
                        </code>{" "}
                        com frontmatter YAML:
                      </span>
                    </li>
                  </ol>
                  <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-slate-300 font-mono">
                      <code>
                        {`---
title: Meu Primeiro Post
date: 2025-01-20
excerpt: Uma breve descrição do post
tags: [tech, javascript]
---

# Conteúdo do Post

Seu conteúdo em Markdown aqui...`}
                      </code>
                    </pre>
                  </div>
                  <ol start={3} className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-medium flex-shrink-0">
                        3.
                      </span>
                      <span>
                        Sincronize novamente e seus posts aparecerão
                        automaticamente
                      </span>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-semibold">
                    4
                  </span>
                  <h2 className="text-xl font-semibold text-slate-100">
                    Adicionar preview dos projetos
                  </h2>
                </div>
                <div className="pl-10 space-y-3">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Para exibir uma prévia ao vivo dos seus projetos:
                  </p>
                  <ol className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-medium flex-shrink-0">
                        1.
                      </span>
                      <span>Vá para o Dashboard</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-medium flex-shrink-0">
                        2.
                      </span>
                      <span>
                        Encontre o repositório que deseja adicionar preview
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-medium flex-shrink-0">
                        3.
                      </span>
                      <span>
                        No campo{" "}
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <HiEye className="w-3 h-3" />
                          Preview
                        </span>
                        , cole a URL do seu projeto em produção
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 font-medium flex-shrink-0">
                        4.
                      </span>
                      <span>
                        Clique em &ldquo;Testar link&rdquo; para verificar se
                        está correto
                      </span>
                    </li>
                  </ol>
                  <div className="bg-slate-800/20 border border-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">
                      <strong className="text-slate-400">Exemplos:</strong>{" "}
                      Vercel, Netlify, GitHub Pages, Railway, Render, etc.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-semibold">
                    5
                  </span>
                  <h2 className="text-xl font-semibold text-slate-100">
                    Escolher quais repositórios exibir
                  </h2>
                </div>
                <div className="pl-10 space-y-3">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Por padrão, todos os seus repositórios públicos são
                    exibidos. Para personalizar:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400/50 mt-2 flex-shrink-0" />
                      <span>
                        Use a <strong className="text-slate-300">busca</strong>{" "}
                        para filtrar repositórios específicos
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400/50 mt-2 flex-shrink-0" />
                      <span>
                        Clique em{" "}
                        <strong className="text-slate-300">
                          &ldquo;Desmarcar todos&rdquo;
                        </strong>{" "}
                        e selecione apenas os que deseja
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400/50 mt-2 flex-shrink-0" />
                      <span>
                        Use{" "}
                        <strong className="text-slate-300">
                          &ldquo;Marcar filtrados&rdquo;
                        </strong>{" "}
                        para selecionar apenas os resultados da busca
                      </span>
                    </li>
                  </ul>
                  <div className="space-y-2 mt-4">
                    <p className="text-xs text-slate-500 font-medium">
                      Exemplo de fluxo:
                    </p>
                    <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-4 space-y-1.5">
                      <p className="text-xs text-slate-400">
                        1. Desmarcar todos os repositórios
                      </p>
                      <p className="text-xs text-slate-400">
                        2. Buscar &ldquo;portfolio&rdquo; → encontra 3
                      </p>
                      <p className="text-xs text-slate-400">
                        3. Marcar filtrados → seleciona os 3
                      </p>
                      <p className="text-xs text-slate-400">
                        4. Limpar busca e marcar mais alguns manualmente
                      </p>
                      <p className="text-xs text-slate-400">
                        5. Salvar configurações
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-slate-800/50">
              <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <HiFolder className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      Pronto para começar?
                    </h3>
                    <p className="text-xs text-slate-500">
                      Faça login e crie seu portfólio em menos de 2 minutos
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 h-9 px-4 bg-blue-600/90 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Começar agora
                  </Link>
                  <Link
                    href="https://github.com/marialuisacampos/git-to-know-me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-9 px-4 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    <FaGithub className="w-4 h-4" />
                    Ver código-fonte
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
