import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
const base=process.env.TEST_URL||'http://127.0.0.1:8780';
await mkdir('artifacts/first-scroll',{recursive:true});
try{
 for(const [width,height,fallback] of [[390,844,false],[1440,900,false],[390,844,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width===390,hasTouch:width===390});
  const page=await context.newPage(),requests=[],errors=[];let failedOnce=false;
  page.on('pageerror',e=>errors.push(e.message));
  if(fallback)await page.addInitScript(()=>{window.createImageBitmap=()=>Promise.reject(Error('Simulated unavailable bitmap decoder'))});
  await page.route('**/frames/**',async route=>{
   const url=route.request().url();
   if(/manifest|poster/.test(url))return route.continue();
   requests.push(url.split('/').at(-1));
   await new Promise(r=>setTimeout(r,100));
   if(requests.length===8&&!failedOnce){failedOnce=true;return route.abort('failed')}
   await route.continue();
  });
  await page.goto((process.env.TEST_URL||'http://127.0.0.1:8780')+'/?motion=full&lenis=off',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.hero')?.frameStats?.().drawn>=0);
  // Inspect an uncached first pass; do not wait for networkidle or scroll back.
  const distance=await page.locator('.hero').evaluate(el=>Number(el.dataset.pinDistance));
  const videoEnd=await page.locator('.hero').evaluate(el=>Number(el.dataset.videoEnd||1));
  const samples=[];
  for(const progress of [.08,.16,.24,.32,.4,.48,.56,.64,.72,.8,.9,.98]){
   await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),distance*progress);
   await page.waitForTimeout(250);
   await page.waitForFunction(()=>{const s=document.querySelector('.hero').frameStats();return Math.abs(s.drawn-s.target)<=1},{},{timeout:2500});
   const stats=await page.locator('.hero').evaluate(el=>el.frameStats());samples.push(stats);
   assert(Math.abs(stats.target-Math.round(Math.min(1,progress/videoEnd)*149))<=1,'Playhead did not follow the requested first-pass position');
   assert.equal(await page.locator('.hero canvas').evaluate(el=>getComputedStyle(el).opacity),'1');
  }
  assert.deepEqual(errors,[]);assert(failedOnce,'Retry scenario was not exercised');
  // First requests must be consecutive, not 0/10/20/30 contact-sheet sampling.
  const first=requests.slice(0,4).map(s=>Number(s.match(/\d+/)[0]));
  assert.deepEqual(first,first[0]===0?[0,1,2,3]:[1,2,3,4]);
  assert.equal(await page.locator('.orbit-piece').count(),0);
  const portrait=page.locator('.bread-portrait');await portrait.scrollIntoViewIfNeeded();await page.waitForTimeout(800);
  await page.screenshot({path:`artifacts/first-scroll/${width}-${fallback}.png`});
  assert.equal(await portrait.locator('img').count(),1);
  await context.close();results.push({width,height,fallback,firstRequests:first,firstPassSamples:samples,errors});console.log({width,fallback,firstPass:'passed'});
 }
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage();
 await page.goto(base+'/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.hero').evaluate(el=>el.classList.contains('native-motion')),true);
 await page.locator('.bread-portrait').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('.bread-photo').evaluate(el=>getComputedStyle(el).transform),'none');await context.close();
 await writeFile('docs/first-scroll-checks.json',JSON.stringify({results,reducedMotion:true},null,2));
}finally{await browser.close()}
