import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 const context=await browser.newContext({viewport:{width:360,height:640},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 9; moto z3 play) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const cdp=await context.newCDPSession(page);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await cdp.send('Network.enable');
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:120,downloadThroughput:200000,uploadThroughput:100000});
 await page.goto((process.env.TEST_URL||'http://127.0.0.1:8781')+'/?motion=full',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('.hero')?.frameStats?.().drawn>=0);
 assert.equal(await page.locator('.hero').evaluate(el=>el.dataset.scrollMode),'native-sticky');
 assert.equal(await page.locator('.hero').evaluate(el=>getComputedStyle(el).position),'sticky');
 assert.equal(await page.locator('.hero').evaluate(el=>!!el.closest('.pin-spacer')),false);
 const distance=await page.locator('.hero').evaluate(el=>Number(el.dataset.pinDistance)),samples=[];
 // Record coverage during touch movement, not only after the gesture settles.
 await page.evaluate(()=>{window.__gaps=[];window.__probing=true;const sample=()=>{if(!window.__probing)return;const el=document.querySelector('.hero'),r=el.getBoundingClientRect();if(r.top>1||r.left>1||r.bottom<innerHeight-1||r.right<innerWidth-1)window.__gaps.push({top:r.top,left:r.left,bottom:r.bottom,right:r.right,width:innerWidth,height:innerHeight});requestAnimationFrame(sample)};requestAnimationFrame(sample)});
 for(let swipe=0;swipe<9;swipe++){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:550}]});
  for(let i=1;i<=16;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y:550-i*20}]});await page.waitForTimeout(20)}
  await page.waitForTimeout(100);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(300);
  const stats=await page.locator('.hero').evaluate(el=>el.frameStats());samples.push(stats);
  assert(stats.target>0,'Native scroll did not advance the playhead');
  if(swipe===3){
   const before=stats.target;
   for(const height of [720,600,680]){await page.setViewportSize({width:360,height});await page.waitForTimeout(100);assert.equal(await page.locator('.hero').evaluate(el=>el.frameStats().target),before,'Viewport height reset the playhead')}
   assert.equal(await page.locator('.hero').evaluate(el=>Number(el.dataset.pinDistance)),distance,'Toolbar height changed sequence distance');
  }
 }
 await page.waitForFunction(()=>document.querySelector('.hero').frameStats().drawn===149,{},{timeout:60000});
 const gaps=await page.evaluate(()=>{window.__probing=false;return window.__gaps});assert.deepEqual(gaps,[]);assert.deepEqual(errors,[]);
 assert(samples.at(-1).target>samples[0].target,'Frames froze during touch gestures');
 assert(new Set(samples.slice(0,4).map(s=>s.drawn)).size>=3,'Incoming frames were discarded during the first gestures');
 assert(samples.every(s=>s.decoded<=15),'Decoded window grew beyond the mobile budget');
 const final=await page.locator('.hero').evaluate(el=>el.frameStats());
 const report={viewport:'360×640, DPR 3',cpuSlowdown:4,downloadBytesPerSecond:200000,latencyMs:120,mode:'native-sticky',samples,final,gaps,errors,physicalDevice:false};
 await writeFile('docs/native-mobile-checks.json',JSON.stringify(report,null,2));console.log(report);
 await context.close();
}finally{await browser.close()}
