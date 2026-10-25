import { readdir, readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'assets/bakery');
const out = join(root, 'dist');

async function filesIn(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const lists = await Promise.all(entries.map(e => e.isDirectory() ? filesIn(join(dir, e.name)) : [join(dir, e.name)]));
  return lists.flat().sort();
}

export async function build() {
  const files = await filesIn(source);
  const html = await readFile(join(root, 'index.html'), 'utf8');
  const hash = createHash('sha256').update(html);
  for (const path of files) hash.update(path.slice(source.length)).update(await readFile(path));
  const revision = hash.digest('hex').slice(0, 12);
  const assetPath = `/assets/miolo-${revision}/`;
  // Only remove our generated output; never touch source files.
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  for (const path of files) {
    const dest = join(out, assetPath, path.slice(source.length));
    await mkdir(dirname(dest), { recursive: true });
    if (/\.(js|css|svg)$/.test(path)) {
      const text = await readFile(path, 'utf8');
      await writeFile(dest, text.replaceAll('/assets/bakery/', assetPath));
    } else await copyFile(path, dest);
  }
  await writeFile(join(out, 'index.html'), html.replaceAll('/assets/bakery/', assetPath).replace('</head>', `<meta name="miolo-release" content="${revision}"></head>`));
  // Physical aliases also work on a plain static server without Vercel redirects.
  const redirect = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/"><title>Miolo</title><script>location.replace("/"+location.hash)</script></head><body><a href="/">Ir para a Miolo</a></body></html>';
  for (const path of ['design-system.html', 'design-systems/cedric-grolet-home/index.html']) {
    await mkdir(dirname(join(out, path)), { recursive: true });
    await writeFile(join(out, path), redirect);
  }
  await writeFile(join(out, 'release.json'), JSON.stringify({ name: 'Miolo', version: '2.0.0', revision, assetPath }, null, 2));
  console.log(`Miolo ${revision}: ${files.length} assets → dist/`);
  return { out, revision, assetPath };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
