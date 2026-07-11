const DENY_REGEX =
  /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE|ATTACH|DETACH|VACUUM|PRAGMA)\b/i;

export function validateSQL(sql: string): string {
  let query = sql.trim();

  // Remove a single trailing semicolon
  query = query.replace(/;\s*$/, "");

  // Disallow multiple statements
  const statements = query
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  if (statements.length > 1) {
    throw new Error("Multiple SQL statements are not allowed.");
  }

  // Only allow SELECT queries
  if (!/^select\b/i.test(query)) {
    throw new Error("Only SELECT statements are allowed.");
  }

  // Block dangerous SQL keywords
  if (DENY_REGEX.test(query)) {
    throw new Error("Only read-only SELECT queries are permitted.");
  }

  return query;
}
