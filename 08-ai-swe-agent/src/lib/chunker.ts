import { ExtractedFile } from "./ingest";

export interface RawChunk {
  path: string;
  language: string;
  startLine: number;
  endLine: number;
  content: string;
  symbol: string | null;
}

const MAX_CHUNK_LINES = 120;
const MIN_CHUNK_LINES = 8;
const OVERLAP_LINES = 15;

// Rough heuristics for "this line starts a new top-level symbol" per language
// family. This is intentionally simple — good enough to make chunk
// boundaries land on function/class edges most of the time, without needing
// a full parser for every language.
const SYMBOL_PATTERNS: RegExp[] = [
  /^\s*(export\s+)?(default\s+)?(async\s+)?function\s+([A-Za-z0-9_$]+)/, // JS/TS function
  /^\s*(export\s+)?(default\s+)?class\s+([A-Za-z0-9_$]+)/, // JS/TS/Python/Java class
  /^\s*(export\s+)?(const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(async\s*)?\(?.*=>/, // arrow fn assigned to const
  /^\s*def\s+([A-Za-z0-9_]+)\s*\(/, // Python function
  /^\s*(public|private|protected|static|\s)*\s*(async\s+)?[A-Za-z0-9_<>\[\]]+\s+([A-Za-z0-9_]+)\s*\(.*\)\s*{?\s*$/, // Java/C#/Go-ish method
  /^\s*func\s+([A-Za-z0-9_]+)\s*\(/, // Go function
  /^\s*(pub\s+)?fn\s+([A-Za-z0-9_]+)\s*\(/, // Rust function
];

function extractSymbol(line: string): string | null {
  for (const pattern of SYMBOL_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      const name = match.slice(1).reverse().find((g) => g && /^[A-Za-z0-9_$]+$/.test(g));
      if (name) return name;
    }
  }
  return null;
}

/**
 * Splits one file's source into overlapping chunks, trying to break on
 * function/class boundaries when we can detect them, and falling back to a
 * fixed-size sliding window otherwise. Markdown/JSON/YAML get a simpler
 * paragraph/whole-file treatment since "symbols" don't apply.
 */
export function chunkFile(file: ExtractedFile): RawChunk[] {
  const lines = file.content.split("\n");

  if (lines.length <= MAX_CHUNK_LINES) {
    return [
      {
        path: file.path,
        language: file.language,
        startLine: 1,
        endLine: lines.length,
        content: file.content,
        symbol: null,
      },
    ];
  }

  const isCodeLanguage = ![
    "markdown",
    "json",
    "yaml",
    "toml",
  ].includes(file.language);

  const chunks: RawChunk[] = [];

  if (isCodeLanguage) {
    // Find candidate boundary line numbers where a new symbol appears to start.
    const boundaries: { line: number; symbol: string }[] = [];
    lines.forEach((line, idx) => {
      const symbol = extractSymbol(line);
      if (symbol) boundaries.push({ line: idx, symbol });
    });

    if (boundaries.length >= 2) {
      for (let i = 0; i < boundaries.length; i++) {
        const start = boundaries[i].line;
        const end =
          i + 1 < boundaries.length ? boundaries[i + 1].line - 1 : lines.length - 1;

        if (end - start + 1 <= MAX_CHUNK_LINES) {
          chunks.push({
            path: file.path,
            language: file.language,
            startLine: start + 1,
            endLine: end + 1,
            content: lines.slice(start, end + 1).join("\n"),
            symbol: boundaries[i].symbol,
          });
        } else {
          // Symbol body itself is huge — fall back to windowing within it.
          chunks.push(
            ...slidingWindow(lines, start, end, file.path, file.language, boundaries[i].symbol)
          );
        }
      }

      // Anything before the first detected symbol (imports, header comments).
      if (boundaries[0].line > 0) {
        chunks.unshift({
          path: file.path,
          language: file.language,
          startLine: 1,
          endLine: boundaries[0].line,
          content: lines.slice(0, boundaries[0].line).join("\n"),
          symbol: null,
        });
      }

      return chunks;
    }
  }

  // Fallback: fixed-size sliding window with overlap.
  return slidingWindow(lines, 0, lines.length - 1, file.path, file.language, null);
}

function slidingWindow(
  lines: string[],
  from: number,
  to: number,
  path: string,
  language: string,
  symbol: string | null
): RawChunk[] {
  const chunks: RawChunk[] = [];
  let start = from;
  while (start <= to) {
    const end = Math.min(start + MAX_CHUNK_LINES - 1, to);
    if (end - start + 1 >= MIN_CHUNK_LINES || start === from) {
      chunks.push({
        path,
        language,
        startLine: start + 1,
        endLine: end + 1,
        content: lines.slice(start, end + 1).join("\n"),
        symbol,
      });
    }
    if (end >= to) break;
    start = end - OVERLAP_LINES + 1;
  }
  return chunks;
}
