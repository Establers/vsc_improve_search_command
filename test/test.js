const assert = require('assert');
const { isCommentLine } = require('../lib/comment-utils');

// basic cases
assert.ok(isCommentLine('// foo'));
assert.ok(isCommentLine('# bar'));
assert.ok(isCommentLine('  /* baz */'));
assert.ok(isCommentLine('<!-- html -->'));
assert.ok(!isCommentLine('const x = 1; // inline comment'));

console.log('All tests passed');
