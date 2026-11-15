import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActionButton, Text } from '@react-spectrum/s2';
import Comment from '@react-spectrum/s2/icons/Comment';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { prependReplyQuote } from '../../model/reply-quote.ts';
import { useShell } from '../../state/shell-store.ts';
import { focusPromptEnd } from '../focus-prompt.ts';
import { T } from './thread-copy.ts';

const floatingAction = style({ position: 'fixed', zIndex: 1000 });

interface QuoteSelection {
  text: string;
  left: number;
  top: number;
}

/**
 * 回复正文里的选区操作（产品设计 §3.2.2）：选中或复制一段后出现「引用对话」。
 * 只把屏幕上选中的显示文字加进草稿，不自动发送，也不另造一份会话上下文。
 */
export function ReplyQuote({ conversationId, children }: { conversationId: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<QuoteSelection | null>(null);

  useEffect(() => setSelection(null), [conversationId]);
  useEffect(() => {
    if (!selection) return undefined;
    const doc = root.current?.ownerDocument;
    if (!doc) return undefined;
    const hide = () => setSelection(null);
    const selectionChanged = () => {
      const selected = doc.getSelection();
      if (!selected || selected.isCollapsed) hide();
    };
    doc.addEventListener('selectionchange', selectionChanged);
    doc.addEventListener('scroll', hide, true);
    return () => {
      doc.removeEventListener('selectionchange', selectionChanged);
      doc.removeEventListener('scroll', hide, true);
    };
  }, [selection]);

  const showSelection = () => {
    const element = root.current;
    const selected = element?.ownerDocument.getSelection();
    if (!element || !selected?.rangeCount || selected.isCollapsed) return setSelection(null);
    const text = selected.toString().trim();
    const range = selected.getRangeAt(0);
    if (!text || !element.contains(range.startContainer) || !element.contains(range.endContainer)) return setSelection(null);
    const rect = range.getBoundingClientRect();
    const win = element.ownerDocument.defaultView;
    if (!win) return;
    setSelection({
      text,
      left: Math.max(8, Math.min(rect.left, win.innerWidth - 140)),
      top: Math.max(8, rect.top - 40),
    });
  };

  const quote = () => {
    if (!selection) return;
    const shell = useShell.getState();
    shell.setDraft(conversationId, prependReplyQuote(shell.drafts[conversationId], selection.text));
    shell.revealConversation();
    setSelection(null);
    const clear = root.current?.ownerDocument.getSelection();
    clear?.removeAllRanges();
    // 等草稿与布局提交后再聚焦；focusPromptEnd 把光标放在已有文字末尾。
    setTimeout(() => {
      const composer = [...document.querySelectorAll<HTMLElement>('[data-composer]')].find((el) => el.dataset.composer === conversationId);
      focusPromptEnd(composer);
    }, 0);
  };

  return (
    <div ref={root} onMouseUp={showSelection} onKeyUp={showSelection} onCopy={showSelection}>
      {children}
      {selection ? (
        <div
          className={floatingAction}
          style={{ left: selection.left, top: selection.top }}
          onPointerDown={(event) => event.preventDefault()}
        >
          <ActionButton size="S" aria-label={T.quoteReply} onPress={quote}>
            <Comment />
            <Text>{T.quoteReply}</Text>
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}
