import { remark } from "remark";
import remarkHtml from "remark-html";
import { sanitizeHtml } from "./sanitize";

/**
 * Converte Markdown para HTML sanitizado
 * Usa remark para conversão e DOMPurify para sanitização
 *
 * @param markdown - String com conteúdo Markdown
 * @returns Promise com HTML sanitizado
 *
 * @example
 * ```typescript
 * const html = await mdToHtml("# Título\n\nParagrafo");
 * // "<h1>Título</h1>\n<p>Paragrafo</p>"
 * ```
 */
export async function mdToHtml(markdown: string): Promise<string> {
  if (!markdown) return "";

  try {
    // Converter Markdown para HTML usando remark
    const processed = await remark()
      .use(remarkHtml, {
        sanitize: false, // Não sanitizar aqui, vamos fazer depois
      })
      .process(markdown);

    const html = processed.toString();

    // Sanitizar HTML para remover elementos perigosos
    return sanitizeHtml(html);
  } catch (error) {
    console.error("Erro ao converter Markdown para HTML:", error);
    return "";
  }
}

/**
 * Converte Markdown para HTML sem sanitização
 * Use apenas se tiver certeza que o conteúdo é seguro
 *
 * @param markdown - String com conteúdo Markdown
 * @returns Promise com HTML não sanitizado
 */
export async function mdToHtmlUnsafe(markdown: string): Promise<string> {
  if (!markdown) return "";

  try {
    const processed = await remark().use(remarkHtml).process(markdown);

    return processed.toString();
  } catch (error) {
    console.error("Erro ao converter Markdown para HTML:", error);
    return "";
  }
}
