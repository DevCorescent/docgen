const TOKEN_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function extractVariables(content: string): string[] {
  const matches = content.matchAll(TOKEN_REGEX);
  const variables = new Set<string>();

  for (const match of matches) {
    const token = match[1]?.trim();
    if (token) {
      variables.add(token);
    }
  }

  return [...variables];
}

export function renderTemplate(content: string, payload: Record<string, string>) {
  const missing = new Set<string>();
  const output = content.replace(TOKEN_REGEX, (_token, variable: string) => {
    const value = payload[variable];
    if (typeof value !== "string" || value.trim().length === 0) {
      missing.add(variable);
      return `{{${variable}}}`;
    }
    return value;
  });

  return {
    output,
    missing: [...missing]
  };
}
