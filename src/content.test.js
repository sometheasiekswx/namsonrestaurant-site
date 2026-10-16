import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseCSV, normalizeMenu, safeURL, loadContent, defaults } from './content.js';

test('CSV supports BOM, quoted commas, line breaks, escaped quotes and CRLF', () => {
  assert.deepEqual(parseCSV('\uFEFFname,description\r\nPhở,"Warm, fresh\nwith ""herbs"""\r\n'), [{name:'Phở', description:'Warm, fresh\nwith "herbs"'}]);
  assert.throws(() => parseCSV('name\n"unfinished'));
});
test('menu hides unavailable entries and validates URLs and required fields', () => {
  const result = normalizeMenu([{name:'Soup', category:'Noodles', image:'javascript:alert(1)', featured:'TRUE'}, {name:'Rice', category:'Rice', available:'false'}]);
  assert.equal(result.length, 1); assert.equal(result[0].image, ''); assert.equal(result[0].featured, true);
  assert.throws(() => normalizeMenu([{title:'Incorrect heading'}]));
  assert.equal(safeURL('https://example.com/photo.jpg'), 'https://example.com/photo.jpg');
  assert.equal(safeURL('http://example.com'), '');
});
test('import templates are valid', async () => {
  const rows = parseCSV(await readFile(new URL('../public/menu-template.csv', import.meta.url), 'utf8'));
  assert.equal(normalizeMenu(rows).length, 5);
  const settings = parseCSV(await readFile(new URL('../public/settings-template.csv', import.meta.url), 'utf8'));
  assert.equal(settings.find(r => r.key === 'headline').value, defaults.headline);
});
test('missing configuration uses labelled sample content', async () => {
  const result = await loadContent({}); assert.equal(result.isSample, true); assert.equal(result.menu.length, 5);
});
test('live CSV loads settings and menu independently with safe link fallback', async t => {
  t.mock.method(globalThis, 'fetch', async url => new Response(url === 'menu' ? 'name,category,price\nSoup,Noodles,$18' : 'key,value\nname,New name\nuber,javascript:alert(1)'));
  const result = await loadContent({menuURL:'menu', settingsURL:'settings'});
  assert.equal(result.isSample, false); assert.equal(result.menu[0].price, '$18');
  assert.equal(result.settings.name, 'New name'); assert.equal(result.settings.uber, defaults.uber);
});
test('failed feed falls back while valid all-hidden menu stays empty', async t => {
  t.mock.method(globalThis, 'fetch', async url => url === 'bad' ? new Response('<html>Sign in</html>') : new Response('name,category,available\nSoup,Noodles,false'));
  const failed = await loadContent({menuURL:'bad'}); assert.equal(failed.isSample, true); assert.equal(failed.failed, true);
  const empty = await loadContent({menuURL:'good'}); assert.equal(empty.menu.length, 0); assert.equal(empty.isSample, false);
});
