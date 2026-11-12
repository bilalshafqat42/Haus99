/*
 * Making panel values safe to render. Pure, so tests can import it.
 */

/*
 * The panel lets editors add simple formatting (<b>, <i>, links) to text.
 * This site renders every text value as plain text, so tags are removed and
 * entities decoded here; React then escapes whatever is left. Formatting is
 * dropped, but markup can never reach the page as HTML.
 */
const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  hellip: "…",
  copy: "©",
  reg: "®",
  trade: "™",
};

function decodeEntities(text) {
  return text.replace(/&(#\d+|#x[\da-f]+|[a-z][a-z\d]*);/gi, (match, name) => {
    if (name[0] === "#") {
      const hex = name[1] === "x" || name[1] === "X";
      const code = Number.parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[name.toLowerCase()] ?? match;
  });
}

export function toPlainText(value) {
  if (typeof value !== "string") return "";
  if (!/[<&]/.test(value)) return value;
  return decodeEntities(value.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, ""));
}

/*
 * Links from the panel. The panel already refuses scripting links when they
 * are saved; this is the second line, for anything older or unexpected.
 * Ordinary links (https:, mailto:, tel:, whatsapp:, /page, #section) pass.
 */
const DANGEROUS_SCHEME = /^(?:javascript|vbscript|data|file|blob|filesystem):/i;

export function safeHref(value) {
  if (typeof value !== "string") return "#";
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (/[\u0000-\u001f\u007f\\]/.test(trimmed) || DANGEROUS_SCHEME.test(trimmed)) return "#";
  return trimmed;
}
