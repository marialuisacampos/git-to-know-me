import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

/**
 * Sanitiza HTML usando DOMPurify com jsdom
 * Remove scripts, iframes e outros elementos potencialmente perigosos
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  try {
    // Criar um DOM virtual para o DOMPurify
    const window = new JSDOM("").window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const purify = DOMPurify(window as any);

    // Configuração de sanitização
    const clean = purify.sanitize(html, {
      ALLOWED_TAGS: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "a",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "strong",
        "em",
        "b",
        "i",
        "br",
        "hr",
        "img",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "div",
        "span",
      ],
      ALLOWED_ATTR: [
        "href",
        "src",
        "alt",
        "title",
        "class",
        "id",
        "target",
        "rel",
      ],
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });

    return clean;
  } catch (error) {
    console.error("Erro ao sanitizar HTML:", error);
    return "";
  }
}
