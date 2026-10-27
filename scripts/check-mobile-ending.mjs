import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const base=process.env.TEST_URL||'http://127.0.0.1:8781',results=[];
await mkdir('artifacts/mobile-ending',{recursive:true});
try{
 for(const delayed of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  let release;const gate=new Promise(r=>release=r);
  if(delayed)await page.route('**/frames/mobile/frame_150.webp',async route=>{await gate;await route.continue()});
  await page.goto(base+'/?motion=full',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.hero')?.frameStats?.().drawn>=0);
  const distance=await page.locator('.hero').evaluate(el=>Number(el.dataset.pinDistance));
  const cdp=await context.newCDPSession(page);
  // Real touch-source scroll gestures; no wheel and no return to warm the cache.
  for(const p of [.2,.4,.6,.82]){
   for(let swipe=0;swipe<16;swipe++){
    const before=await page.evaluate(()=>scrollY),remaining=distance*p-before;if(remaining<2)break;
    const delta=Math.min(480,remaining+16);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:700}]});
    for(let i=1;i<=16;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:700-delta*i/16}]});await page.waitForTimeout(16)}
    await page.waitForTimeout(100);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(80);
    assert(await page.evaluate(()=>scrollY)>before,'Touch gesture did not scroll');
   }
  }
  const status=()=>page.evaluate(()=>({stats:document.querySelector('.hero').frameStats(),shade:Number(getComputedStyle(document.querySelector('.shade')).opacity),copy:Number(getComputedStyle(document.querySelector('.hero-copy h1')).opacity),top:document.querySelector('.hero').getBoundingClientRect().top}));
  if(!delayed){
   await page.waitForFunction(()=>document.querySelector('.hero').frameStats().drawn===149);
   const final=await status();assert.equal(final.shade,0);assert.equal(final.copy,0);assert(Math.abs(final.top)<2);assert.equal(final.stats.target,149);
   await page.screenshot({path:'artifacts/mobile-ending/final-frame-uncovered.png'});
  }
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),distance*.98);
  await page.waitForTimeout(300);
  if(delayed){const waiting=await status();assert.notEqual(waiting.stats.drawn,149);assert.equal(waiting.shade,0);assert.equal(waiting.copy,0);release();await page.waitForFunction(()=>document.querySelector('.hero').frameStats().drawn===149);const uncovered=await status();assert.equal(uncovered.shade,0);assert.equal(uncovered.copy,0)}
  await page.waitForFunction(()=>document.querySelector('.hero').frameStats().drawn===149&&Number(getComputedStyle(document.querySelector('.hero-copy h1')).opacity)>.9);
  assert(await page.locator('.navbar').evaluate(el=>el.classList.contains('nav-visible')));
  assert.deepEqual(errors,[]);results.push({delayedFinalFrame:delayed,finalVisibleBeforeCopy:true,touchScroll:true,errors});await context.close();
 }
 await writeFile('docs/mobile-ending-checks.json',JSON.stringify(results,null,2));console.log(results);
}finally{await browser.close()}
