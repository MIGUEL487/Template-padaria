import argparse,json,pathlib
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--phase',choices=['before','after'],required=True);parser.add_argument('--url',default='http://127.0.0.1:8801');args=parser.parse_args()
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    try:
        for cpu in [1,4]:
            context=browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=2)
            page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            cdp=context.new_cdp_session(page);cdp.send('Emulation.setCPUThrottlingRate',{'rate':cpu})
            page.goto(args.url+'/?motion=full',wait_until='networkidle')
            page.wait_for_function("()=>document.querySelector('.hero')?.frameStats?.().drawn===0")
            page.evaluate("""()=>{window.__desktop={play:0,pause:0,seek:0,backsteps:0,frames:[],intervals:[],last:-1,lastTime:0,run:true};for(const v of document.querySelectorAll('.hero video')){v.addEventListener('play',()=>window.__desktop.play++);v.addEventListener('pause',()=>window.__desktop.pause++);v.addEventListener('seeking',()=>window.__desktop.seek++)}const sample=t=>{const m=window.__desktop;if(!m.run)return;if(m.lastTime)m.intervals.push(t-m.lastTime);m.lastTime=t;const s=document.querySelector('.hero').frameStats();if(s.drawn!==m.last){if(s.drawn<m.last)m.backsteps++;m.frames.push(s.drawn);m.last=s.drawn}requestAnimationFrame(sample)};requestAnimationFrame(sample)}""")
            # Monotonic wheel motion followed by microsteps exposes direction chatter.
            for delta,delay,count in [(120,90,12),(8,100,12)]:
                for _ in range(count):page.mouse.wheel(0,delta);page.wait_for_timeout(delay)
            page.wait_for_timeout(1000)
            report=page.evaluate("""()=>{const m=window.__desktop;m.run=false;const a=m.intervals.sort((x,y)=>x-y);return {play:m.play,pause:m.pause,seek:m.seek,backsteps:m.backsteps,frames:m.frames,rafP95:a[Math.floor(a.length*.95)],rafOver50:a.filter(x=>x>50).length,stats:document.querySelector('.hero').frameStats(),sources:[...document.querySelectorAll('.hero video')].map(v=>v.getAttribute('src'))}}""")
            report.update({'cpuSlowdown':cpu,'phase':args.phase,'errors':errors})
            if args.phase=='after':
                assert not errors,errors
                assert report['backsteps']==0,report
                assert report['seek']==0,report
                assert report['stats']['droppedFrames']==0,report
                assert report['stats']['renderer']=='gsap-desktop',report
                assert report['stats']['switches']==0,report
                assert len(report['sources'])==1,report
            results.append(report);print(json.dumps({k:v for k,v in report.items() if k!='frames'},indent=2),flush=True)
            context.close()
    finally:browser.close()
pathlib.Path(f'docs/desktop-{args.phase}.json').write_text(json.dumps(results,indent=2))
