import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { build } from './build.mjs';

test('published output includes versioned entry points, dynamic modules and local assets', async () => {
  const { out, revision, assetPath } = await build();
  const html = await readFile(join(out, 'index.html'), 'utf8');
  assert.match(html, /<title>Miolo/);
  assert.ok(html.includes(`name="miolo-release" content="${revision}"`));
  assert.ok(!html.includes('/assets/bakery/'));
  for (const path of [...html.matchAll(/(?:src|href)="(\/assets\/[^"#]+)"/g)].map(m => m[1])) {
    assert.ok((await stat(join(out, path))).isFile(), `missing published asset ${path}`);
  }
  const app = await readFile(join(out, assetPath, 'app.js'), 'utf8');
  assert.ok(!app.includes('/assets/bakery/'));
  assert.ok(app.includes("import('./model.js')"));
  for (const path of ['model.js', 'vendor/three.module.js', 'morning.webp', 'bread.svg', 'coffee.svg', 'croissant.svg']) {
    assert.ok((await stat(join(out, assetPath, path))).size > 0, `missing ${path}`);
  }
  const manifest = JSON.parse(await readFile(join(out, 'release.json'), 'utf8'));
  assert.equal(manifest.revision, revision);
  const alias = await readFile(join(out, 'design-systems/cedric-grolet-home/index.html'), 'utf8');
  assert.ok(alias.includes('location.replace("/"+location.hash)'));
  assert.ok(!html.includes('location.replace'));
});

test('Vercel uses the build artifact and redirects previous entry points', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(config.buildCommand, 'npm run build');
  assert.equal(config.outputDirectory, 'dist');
  for (const path of ['/design-systems/:path*', '/design-system', '/design-system.html']) {
    assert.ok(config.redirects.some(r => r.source === path && r.destination === '/'));
  }
});
