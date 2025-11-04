export function normalizeInput(str: string) {
  // 1. Trim whitespace
  let tag = str.trim();

  // 2. Remove unwanted characters (e.g. only allow letters, numbers, space, dash, underscore, emoji, or customize)
  tag = tag.replace(/[^\p{L}\p{N} _\-!?:@#&,.\u{1F300}-\u{1F9FF}]/gu, '');

  // 3. Collapse multiple spaces
  tag = tag.replace(/\s+/g, ' ');

  return tag;
}

export function pluralize(count: number, singular: string, plural: string | null = null) {
  return count === 1 ? singular : plural || singular + 's';
}
