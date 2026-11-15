/* 回复选区「引用对话」的草稿拼装（product-design §3.2.2）。只在 App 入口加载。 */
(function () {
  function markdownQuote(text) {
    const selected = String(text || '').trim();
    return selected ? selected.split('\n').map(line => '> ' + line).join('\n') : '';
  }
  function prependQuote(existing, selected) {
    const quote = markdownQuote(selected);
    if (!quote) return existing || '';
    return String(existing || '').trim() ? quote + '\n\n' + existing : quote;
  }
  Object.assign(window, {BC_AGENT_QUOTE: {markdownQuote, prependQuote}});
}());
