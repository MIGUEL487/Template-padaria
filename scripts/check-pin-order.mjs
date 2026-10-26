import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const width of [390,1440]){
  const height=width===390?844:900;
  const context=await browser.newContext({viewport:{width,height},isMobile:width===390,hasTouch:width===390});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.TEST_URL||'http://127.0.0.1:8780')+'/?motion=full',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>!!document.querySelector('.hero')?.frameStats);
  for(let i=0;i<48;i++){await page.mouse.wheel(0,height*(width===390?4:6)/48);await page.waitForTimeout(40)}
  await page.waitForTimeout(700);
  const result=await page.evaluate(()=>({y:scrollY,heroTop:document.querySelector('.hero').getBoundingClientRect().top,storyTop:document.querySelector('.story-pin').getBoundingClientRect().top,stats:document.querySelector('.hero').frameStats()}));
  assert(Math.abs(result.heroTop)<120,'Hero left viewport before its pin finished');
  assert(result.storyTop>height,'Narrative pin overlaps the hero');
  assert.equal(result.stats.target,width===390?149:238);
  assert.deepEqual(errors,[]);console.log(width,result);await context.close();
 }
}finally{await browser.close()}
