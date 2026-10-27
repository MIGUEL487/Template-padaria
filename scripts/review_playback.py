import argparse, json, pathlib
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--phase', choices=['before','after'], required=True)
parser.add_argument('--url', default='http://127.0.0.1:8781')
args=parser.parse_args()
pathlib.Path('artifacts/playback-review').mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    # Reconnaissance with settled DOM, as required by webapp-testing.
    page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    page.goto(args.url+'/?motion=full',wait_until='networkidle')
    page.screenshot(path=f'artifacts/playback-review/{args.phase}-entry.png')
    assert page.locator('.hero').count()==1
    page.close()
    context=browser.new_context(viewport={'width':360,'height':640},is_mobile=True,has_touch=True,device_scale_factor=3)
    page=context.new_page(); errors=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    cdp=context.new_cdp_session(page)
    cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    cdp.send('Network.enable')
    cdp.send('Network.emulateNetworkConditions',{'offline':False,'latency':120,'downloadThroughput':400000,'uploadThroughput':100000})
    page.goto(args.url+'/?motion=full',wait_until='domcontentloaded')
    page.wait_for_function("() => !!document.querySelector('.hero')?.frameStats")
    page.evaluate("""() => {window.__changes=[];window.__last=-1;window.__running=true;const tick=t=>{if(!window.__running)return;const s=document.querySelector('.hero').frameStats();if(s.drawn!==window.__last){window.__changes.push({t,frame:s.drawn});window.__last=s.drawn}requestAnimationFrame(tick)};requestAnimationFrame(tick)}""")
    distance=page.locator('.hero').evaluate('el=>Number(el.dataset.pinDistance)')
    page.evaluate('y=>scrollTo({top:y,behavior:"instant"})',distance*.98)
    page.wait_for_timeout(10000)
    report=page.evaluate("""() => {window.__running=false;const frames=window.__changes.filter(s=>s.frame>=0),gaps=frames.slice(1).map((s,i)=>s.t-frames[i].t);return {frames,maxGapMs:Math.max(0,...gaps),gapsOver100ms:gaps.filter(x=>x>100).length,stats:document.querySelector('.hero').frameStats(),videos:[...document.querySelectorAll('.hero video')].map(v=>({width:v.videoWidth,height:v.videoHeight,droppedFrames:v.getVideoPlaybackQuality().droppedVideoFrames,totalFrames:v.getVideoPlaybackQuality().totalVideoFrames,error:v.error?.message}))}}""")
    report.update({'phase':args.phase,'cpuSlowdown':4,'downloadBytesPerSecond':400000,'latencyMs':120,'errors':errors})
    page.screenshot(path=f'artifacts/playback-review/{args.phase}-end.png')
    pathlib.Path(f'docs/playback-{args.phase}.json').write_text(json.dumps(report,indent=2))
    print(json.dumps({k:v for k,v in report.items() if k!='frames'},indent=2))
    if args.phase=='after':
        assert not errors,errors
        assert report['stats']['renderer']=='native-video',report['stats']
        assert report['stats']['drawn']==149,report['stats']
        assert report['gapsOver100ms']<=2,report['gapsOver100ms']
    context.close();browser.close()
