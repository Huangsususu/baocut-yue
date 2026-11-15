/** 选中的回复文字转成 Markdown 引用块；空行也保留引用前缀。 */
export function markdownQuote(text: string): string {
  const selected = text.trim();
  return selected ? selected.split('\n').map((line) => `> ${line}`).join('\n') : '';
}

/** 引用放在已有草稿之前，不覆盖用户已经写了一半的话；光标随后由 Composer 放到末尾。 */
export function prependReplyQuote(existing: string | undefined, selected: string): string {
  const quote = markdownQuote(selected);
  if (!quote) return existing ?? '';
  return existing?.trim() ? `${quote}\n\n${existing}` : quote;
}
