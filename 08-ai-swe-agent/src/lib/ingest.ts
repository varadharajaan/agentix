import JSZip from "jszip";

// Folders that never contain source worth indexing.
const IGNORED_DIR_SEGMENTS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".nuxt",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".vercel",
  "venv",
  ".venv",
  "__pycache__",
  ".idea",
  ".vscode",
  "target", // rust/java build output
  "vendor",
]);

// Extensions we know how to read as text + attribute a language to.
const LANGUAGE_BY_EXT: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  java: "java",
  go: "go",
  rs: "rust",
  rb: "ruby",
  php: "php",
  cs: "csharp",
  cpp: "cpp",
  cc: "cpp",
  c: "c",
  h: "c",
  hpp: "cpp",
  swift: "swift",
  kt: "kotlin",
  scala: "scala",
  md: "markdown",
  mdx: "markdown",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  html: "html",
  css: "css",
  scss: "scss",
  sql: "sql",
  sh: "shell",
  graphql: "graphql",
  vue: "vue",
};

const MAX_FILE_BYTES = 800_000; // skip anything absurdly large (e.g. lockfiles, bundles)

export interface ExtractedFile {
  path: string;
  language: string;
  content: string;
  sizeBytes: number;
  lines: number;
}

function isIgnoredPath(relPath: string): boolean {
  const segments = relPath.split("/");
  return segments.some((seg) => IGNORED_DIR_SEGMENTS.has(seg));
}

function languageFor(relPath: string): string | null {
  const ext = relPath.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  return LANGUAGE_BY_EXT[ext] ?? null;
}

/**
 * Extracts a ZIP buffer into an in-memory list of source files, applying the
 * same ignore rules a real .gitignore-aware indexer would use. Binary files
 * and anything outside our known language list is skipped.
 */
export async function extractRepository(
  zipBuffer: Buffer
): Promise<ExtractedFile[]> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const results: ExtractedFile[] = [];

  // Some archives wrap everything in a single top-level folder
  // (e.g. `my-project-main/`) — detect and strip it so paths read cleanly.
  const allPaths = Object.keys(zip.files);
  const topLevelDirs = new Set(
    allPaths
      .filter((p) => p.includes("/"))
      .map((p) => p.split("/")[0])
  );
  const stripPrefix =
    topLevelDirs.size === 1 && !allPaths.some((p) => !p.includes("/"))
      ? `${[...topLevelDirs][0]}/`
      : "";

  for (const [rawPath, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;

    const relPath = stripPrefix && rawPath.startsWith(stripPrefix)
      ? rawPath.slice(stripPrefix.length)
      : rawPath;

    if (!relPath || isIgnoredPath(relPath)) continue;

    const language = languageFor(relPath);
    if (!language) continue; // skip binaries / unknown types

    const buf = await entry.async("nodebuffer");
    if (buf.byteLength > MAX_FILE_BYTES) continue;

    const content = buf.toString("utf-8");
    // Skip files that look binary (contain a null byte) despite the extension.
    if (content.includes("\u0000")) continue;

    const lines = content.split("\n").length;

    results.push({
      path: relPath,
      language,
      content,
      sizeBytes: buf.byteLength,
      lines,
    });
  }

  return results;
}
