import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const script=fileURLToPath(new URL('./harden-output.mjs',import.meta.url));
const html='<html><head><script>window.example = true;</script></head><body>Refúgio</body></html>';
const hash=createHash('sha256').update('window.example = true;').digest('base64');

for(const [name,vercel,expected,other] of [
 ['local','','.output/public','.vercel/output/static'],
 ['Vercel','1','.vercel/output/static','.output/public'],
])test(`CSP uses ${name} output even if the other directory exists`,async()=>{
 const dir=await mkdtemp(join(tmpdir(),'refugio-output-test-'));
 try{
  for(const p of [expected,other]){await mkdir(join(dir,p),{recursive:true});await writeFile(join(dir,p,'index.html'),html)}
  const result=spawnSync(process.execPath,[script],{cwd:dir,env:{...process.env,VERCEL:vercel},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const output=await readFile(join(dir,expected,'index.html'),'utf8');
  assert.ok(output.includes('Content-Security-Policy'));
  assert.ok(output.includes(`sha256-${hash}`));
  assert.equal(await readFile(join(dir,other,'index.html'),'utf8'),html);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('Vercel fails if its output is missing, instead of hardening stale local output',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'refugio-output-test-'));
 try{
  await mkdir(join(dir,'.output/public'),{recursive:true});await writeFile(join(dir,'.output/public/index.html'),html);
  const result=spawnSync(process.execPath,[script],{cwd:dir,env:{...process.env,VERCEL:'1'},encoding:'utf8'});
  assert.notEqual(result.status,0);assert.match(result.stderr,/ENOENT/);
  assert.equal(await readFile(join(dir,'.output/public/index.html'),'utf8'),html);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('Vercel config lets Nuxt Build Output API own the output',async()=>{
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
 assert.equal(config.framework,'nuxtjs');assert.equal(config.buildCommand,'npm run generate');
 assert.equal(Object.hasOwn(config,'outputDirectory'),false);
});
