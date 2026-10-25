const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const results=[];
 for(const width of [390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:844}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/?motion=full');await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.frame==='0');await page.waitForTimeout(800);
  assert.equal(await page.locator('.hero a,.hero button').count(),0,'Hero sem botões');
  assert.equal(await page.locator('header').evaluate(e=>e.inert),true,'Menu oculto inicialmente');
  await page.screenshot({path:`/tmp/refined-${width}-hero.png`});
  const manifest=await (await page.request.get(`http://127.0.0.1:4173/frames/${width<=768?'mobile':'pc'}/manifest.json`)).json();
  const lastFrame=manifest.count-1;
  const geometry=await page.locator('.hero').evaluate(e=>({height:e.offsetHeight,viewport:innerHeight}));
  await page.evaluate(()=>{window.__seen=new Set;new MutationObserver(()=>window.__seen.add(document.querySelector('canvas').dataset.frame)).observe(document.querySelector('canvas'),{attributes:true,attributeFilter:['data-frame']})});
  for(let i=0;i<58;i++){await page.mouse.wheel(0,24);await page.waitForTimeout(45)}
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),geometry.height-geometry.viewport-geometry.viewport*.08);
  await page.waitForTimeout(400);
  assert.equal(await page.locator('canvas').getAttribute('data-frame'),String(lastFrame),'Sequência chega ao último frame');
  assert.equal(await page.locator('header').evaluate(e=>e.inert),true,'Menu segue oculto durante a sequência');
  const top=await page.locator('.hero-sticky').evaluate(e=>e.getBoundingClientRect().top);assert(Math.abs(top)<2,'Hero fica preso até terminar');
  const seen=await page.evaluate(()=>[...window.__seen]);
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),geometry.height-geometry.viewport+96);await page.waitForTimeout(650);
  assert.equal(await page.locator('header').evaluate(e=>e.inert),false,'Menu aparece durante a saída');
  await page.screenshot({path:`/tmp/refined-${width}-transition.png`});
  if(width<=600)await page.getByRole('button',{name:'Abrir navegação'}).click();
  await page.getByRole('link',{name:'O cardápio',exact:true}).click();await page.waitForTimeout(1000);
  await page.getByRole('button',{name:'Café',exact:true}).click();assert.equal(await page.locator('.product').count(),1);
  await page.getByRole('button',{name:'Pedir Café & croissant'}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);
  await page.getByRole('button',{name:'Todos (6)',exact:true}).click();
  await page.locator('#historia').scrollIntoViewIfNeeded();await page.waitForTimeout(750);await page.screenshot({path:`/tmp/refined-${width}-history.png`});
  const motion=await page.locator('.history .picture img').evaluate(e=>({state:getComputedStyle(e).animationPlayState,name:getComputedStyle(e).animationName}));assert.equal(motion.state,'running');
  await page.locator('.experience').scrollIntoViewIfNeeded();await page.waitForTimeout(750);await page.screenshot({path:`/tmp/refined-${width}-experience.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(650);assert.equal(await page.locator('header').evaluate(e=>e.inert),true);
  assert.equal(errors.length,0);results.push({width,lastFrame,seenFrames:seen,stickyUntilComplete:true,navAfterSequence:true,overflow:false,errors});await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.frame==='0');assert.equal(await page.locator('.hero').evaluate(e=>Math.abs(e.getBoundingClientRect().height-innerHeight)<2),true);await page.locator('#historia').scrollIntoViewIfNeeded();await page.waitForTimeout(600);assert.equal(await page.locator('.history .picture img').evaluate(e=>getComputedStyle(e).animationName),'none');results.push({reducedMotion:true,posterOnly:true,loopsStopped:true});await page.close();
 fs.writeFileSync('docs/refinement-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
