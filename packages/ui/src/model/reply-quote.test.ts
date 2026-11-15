import { describe, expect, it } from 'vitest';
import { markdownQuote, prependReplyQuote } from './reply-quote.ts';

describe('reply quote', () => {
  it('quotes every selected line and trims the outer whitespace', () => {
    expect(markdownQuote('  first\n\nsecond  ')).toBe('> first\n> \n> second');
  });

  it('puts the quote before an existing draft without overwriting it', () => {
    expect(prependReplyQuote('Please adjust this.', 'The selected answer')).toBe('> The selected answer\n\nPlease adjust this.');
  });

  it('uses only the quote for an empty draft and ignores an empty selection', () => {
    expect(prependReplyQuote('', 'answer')).toBe('> answer');
    expect(prependReplyQuote('keep me', ' \n ')).toBe('keep me');
  });
});
