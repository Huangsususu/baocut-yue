/* 回复选区上方的「引用对话」（product-design §3.2.2）。 */
(function () {
  const {useEffect, useRef, useState} = React;
  const R = window.RSP;

  function AgentReplyQuote({sessionId, children}) {
    const app = useApp();
    const root = useRef(null);
    const [selection, setSelection] = useState(null);
    useEffect(() => setSelection(null), [sessionId]);
    useEffect(() => {
      if (!selection) return;
      const hide = () => setSelection(null);
      const changed = () => { const current = document.getSelection(); if (!current || current.isCollapsed) hide(); };
      document.addEventListener('selectionchange', changed);
      document.addEventListener('scroll', hide, true);
      return () => { document.removeEventListener('selectionchange', changed); document.removeEventListener('scroll', hide, true); };
    }, [selection]);
    const show = () => {
      const current = document.getSelection();
      if (!root.current || !current || !current.rangeCount || current.isCollapsed) return setSelection(null);
      const text = current.toString().trim();
      const range = current.getRangeAt(0);
      if (!text || !root.current.contains(range.startContainer) || !root.current.contains(range.endContainer)) return setSelection(null);
      const rect = range.getBoundingClientRect();
      setSelection({text, left: Math.max(8, Math.min(rect.left, window.innerWidth - 140)), top: Math.max(8, rect.top - 40)});
    };
    const quote = () => {
      if (!selection) return;
      app.patchSession(sessionId, {draftQuote: selection.text});
      setSelection(null);
      document.getSelection()?.removeAllRanges();
    };
    return <div ref={root} onMouseUp={show} onKeyUp={show} onCopy={show}>
      {children}
      {selection ? <div className="aquote" style={{left: selection.left, top: selection.top}} onPointerDown={event => event.preventDefault()}>
        <R.ActionButton size="S" aria-label="引用对话" onPress={quote}><R.Icons.Comment /><R.Text>引用对话</R.Text></R.ActionButton>
      </div> : null}
    </div>;
  }
  Object.assign(window, {AgentReplyQuote});
}());
