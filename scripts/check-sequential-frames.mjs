import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[],base=process.env.TEST_URL||'http://127.0.0.1:8781';
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900},isMobile:width===390,hasTouch:width===390});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  let release;const gate=new Promise(r=>release=r);
  await page.route(width===390?'**/frames/mobile/frame_076.webp':'**/frames/pc/ezgif-frame-076.jpg',async route=>{await gate;await route.continue()});
  await page.goto(base+'/?motion=full&lenis=off&renderer=frames',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.hero')?.frameStats?.().drawn===0);
  await page.evaluate(()=>{const c=document.querySelector('.hero canvas');window.__frames=[0];window.__times=[performance.now()];window.__observer=new MutationObserver(()=>{const i=Number(c.dataset.frame);if(window.__frames.at(-1)!==i){window.__frames.push(i);window.__times.push(performance.now())}});window.__observer.observe(c,{attributes:true,attributeFilter:['data-frame']})});
  // Jump over the whole sequence in one gesture. Every intermediate must be painted.
  const distance=await page.locator('.hero').evaluate(el=>Number(el.dataset.pinDistance));
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),distance*.98);
  await page.waitForFunction(()=>document.querySelector('.hero').frameStats().drawn===74,{},{timeout:12000});
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.hero').evaluate(el=>el.frameStats().drawn),74,'Skipped the missing frame');
  assert.equal(await page.locator('.shade').evaluate(el=>Number(getComputedStyle(el).opacity)),0);
  release();
  await page.waitForFunction(()=>document.querySelector('.hero').frameStats().drawn===149,{},{timeout:12000});
  const forward=await page.evaluate(()=>({frames:window.__frames,times:window.__times}));
  assert.deepEqual(forward.frames,Array.from({length:150},(_,i)=>i));
  assert(forward.times.at(-1)-forward.times[0]>=4500,'Playback compressed into a burst');
  await page.evaluate(()=>{window.__frames=[149];window.__times=[performance.now()]});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('.hero').frameStats().drawn===0,{},{timeout:12000});
  const reverse=await page.evaluate(()=>window.__frames);
  assert.deepEqual(reverse,Array.from({length:150},(_,i)=>149-i));
  assert.deepEqual(errors,[]);results.push({width,forward:forward.frames,reverse,forwardDurationMs:forward.times.at(-1)-forward.times[0],waitedForMissingFrame:true,errors});
  console.log({width,forwardCount:forward.frames.length,reverseCount:reverse.length,allAdjacent:true});await context.close();
 }
 await writeFile('docs/sequential-frame-checks.json',JSON.stringify(results,null,2));
}finally{await browser.close()}
