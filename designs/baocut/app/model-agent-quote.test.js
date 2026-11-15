const test = require('node:test');
const assert = require('node:assert/strict');
global.window = {};
require('./model-agent-quote.js');
const Q = global.window.BC_AGENT_QUOTE;

test('引用回复：逐行加 Markdown 引用前缀，保留空行', () => {
  assert.equal(Q.markdownQuote('  第一段\n\n第二段  '), '> 第一段\n> \n> 第二段');
});

test('引用回复：放在已有草稿之前，不覆盖、不自动发送', () => {
  assert.equal(Q.prependQuote('接着修改', '这段结论'), '> 这段结论\n\n接着修改');
  assert.equal(Q.prependQuote('', '这段结论'), '> 这段结论');
  assert.equal(Q.prependQuote('保留', ' \n '), '保留');
});
