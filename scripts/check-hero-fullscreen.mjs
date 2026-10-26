import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const base=process.env.TEST_URL||'http://127.0.0.1:8780';
await mkdir('artifacts/fullscreen',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
function assertCover(r){assert(Math.abs(r.left)<1,JSON.stringify(r));assert(r.right>=r.viewportWidth-1,JSON.stringify(r));assert(Math.abs(r.top)<2,JSON.stringify(r));assert(r.bottom>=r.viewportHeight-1,JSON.stringify(r));assert(!r.overflow,JSON.stringify(r))}
const cover=page=>page.evaluate(()=>{const h=document.querySelector('.hero').getBoundingClientRect();return{left:h.left,right:h.right,top:h.top,bottom:h.bottom,viewportWidth:innerWidth,viewportHeight:innerHeight,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}});
try{
 for(const [width,height] of [[375,667],[390,844],[393,723],[768,1024],[1440,900],[1920,1080]]){
  const mobile=width<=768;
  const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:2});
  const page=await context.newPage();const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.goto(base+'/?motion=full',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('.hero')?.frameStats&&document.querySelector('canvas').style.opacity==='1');
  assert.equal(await page.locator('.hero-brand').count(),0);
  assertCover(await cover(page));
  const stats=await page.locator('.hero').evaluate(el=>el.frameStats());
  assert.equal(stats.sourceWidth,mobile?720:1920);
  if(mobile)assert(!requests.some(url=>url.includes('/frames/pc/')),'Mobile fetched PC frames');
  else assert(!requests.some(url=>url.includes('/frames/mobile/')),'PC fetched mobile frames');
  await page.screenshot({path:`artifacts/fullscreen/${width}-entry.png`});
  const distance=await page.locator('.hero').evaluate(el=>Number(el.dataset.pinDistance));
  for(const progress of [.25,.5,.75,.98]){
   const target=distance*progress;const y=await page.evaluate(()=>scrollY);
   for(let i=0;i<8;i++){await page.mouse.wheel(0,(target-y)/8);await page.waitForTimeout(40)}
   await page.waitForTimeout(500);assertCover(await cover(page));
   assert.equal(await page.locator('canvas').evaluate(el=>getComputedStyle(el).opacity),'1');
   const painted=await page.locator('canvas').evaluate(el=>{const ctx=el.getContext('2d');return [.3,.5,.7].some(y=>{const d=ctx.getImageData(Math.floor(el.width/2),Math.floor(el.height*y),1,1).data;return d[0]+d[1]+d[2]>12})});assert(painted,'Blank canvas during scroll');
   if(width===393||width===1440)await page.screenshot({path:`artifacts/fullscreen/${width}-${progress}.png`});
  }
  if(width===393){
   await page.evaluate(()=>{window.__blankResizes=0;window.__resizeProbe=new ResizeObserver(()=>{if(document.querySelector('canvas').style.opacity!=='1')window.__blankResizes++});window.__resizeProbe.observe(document.querySelector('.hero'))});
   for(const nextHeight of [844,640,780]){await page.setViewportSize({width,height:nextHeight});await page.waitForTimeout(100);assertCover(await cover(page))}
   assert.equal(await page.evaluate(()=>window.__blankResizes),0,'Canvas blanked on viewport height change');
   await page.evaluate(()=>window.__resizeProbe.disconnect());
   await page.setViewportSize({width:844,height:390});await page.waitForTimeout(400);await page.waitForFunction(()=>document.querySelector('.hero').frameStats().sourceWidth===1920);assertCover(await cover(page));
  }
  assert.deepEqual(errors,[]);results.push({width,height,sourceWidth:stats.sourceWidth,sourceHeight:stats.sourceHeight,stages:4,fullscreen:true,noBadge:true,errors});console.log(results.at(-1));await context.close();
 }
 const plain=await browser.newContext({viewport:{width:393,height:723},isMobile:true,hasTouch:true,javaScriptEnabled:false});const page=await plain.newPage();await page.goto(base,{waitUntil:'networkidle'});assertCover(await cover(page));assert(await page.locator('.poster').evaluate(el=>el.complete&&el.naturalWidth===720));await plain.close();
 await writeFile('docs/fullscreen-checks.json',JSON.stringify({results,posterBeforeJavaScript:true},null,2));
}finally{await browser.close()}
