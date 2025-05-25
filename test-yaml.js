const YAML = require('yaml');

const doc = YAML.parseDocument('test: value\nother: data', { keepSourceTokens: true });
console.log('Document keys:', Object.keys(doc));
console.log('Contents keys:', Object.keys(doc.contents || {}));
console.log('Range available:', 'range' in (doc.contents || {}));

if (doc.contents && doc.contents.items) {
  const firstItem = doc.contents.items[0];
  console.log('First item keys:', Object.keys(firstItem || {}));
  console.log('First item range:', firstItem.range);
}
