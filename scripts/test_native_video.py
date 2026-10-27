import argparse, json, pathlib
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:8781');args=parser.parse_args();base=args.url
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    try:
        for width,height in [(360,640),(390,844),(1440,900)]:
            print('Testing viewport',width,flush=True)
            context=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<768,has_touch=width<768)
            page=context.new_page(); errors=[]; requests=[]
            page.route('https://maps.google.com/**',lambda route:route.abort())
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('request', lambda r: requests.append(r.url))
            page.goto(base+'/?motion=full&lenis=off',wait_until='networkidle')
            page.wait_for_function("()=>document.querySelector('.hero').frameStats().drawn===0")
            assert page.locator('.hero').evaluate('el=>el.frameStats().renderer')=='native-video'
            assert not any('/frames/' in u and ('frame_' in u or 'ezgif-frame-' in u) for u in requests), 'Default renderer fetched individual frames'
            distance=page.locator('.hero').evaluate('el=>Number(el.dataset.pinDistance)')
            page.evaluate("""()=>{window.__seen=[];window.__obs=new MutationObserver(()=>{const i=Number(document.querySelector('.hero canvas').dataset.frame);if(window.__seen.at(-1)!==i)window.__seen.push(i)});window.__obs.observe(document.querySelector('.hero canvas'),{attributes:true,attributeFilter:['data-frame']})}""")
            # A partial gesture must play to its destination, then really pause.
            page.evaluate('y=>scrollTo({top:y,behavior:"instant"})',distance*.2)
            page.wait_for_function("()=>{const s=document.querySelector('.hero').frameStats();return s.drawn>=s.target&&s.drawn>0}")
            paused=page.locator('.hero').evaluate('el=>el.frameStats().drawn')
            page.wait_for_timeout(250)
            assert page.locator('.hero').evaluate('el=>el.frameStats().drawn')==paused
            page.evaluate('y=>scrollTo({top:y,behavior:"instant"})',distance*.98)
            page.wait_for_function("()=>document.querySelector('.hero').frameStats().drawn===149",timeout=12000)
            page.wait_for_timeout(400)
            assert page.locator('.navbar').evaluate('el=>el.classList.contains("nav-visible")')
            quality=page.locator('.hero').evaluate('el=>el.frameStats()')
            assert quality['droppedFrames']==0,quality
            page.screenshot(path=f'artifacts/playback-review/native-{width}-end.png')
            # Reverse is native forward playback of the reverse-ordered asset.
            page.evaluate('()=>scrollTo({top:0,behavior:"instant"})')
            page.wait_for_function("()=>document.querySelector('.hero').frameStats().drawn===0",timeout=12000)
            if width==390:
                page.evaluate('y=>scrollTo({top:y,behavior:"instant"})',distance*.35)
                page.wait_for_timeout(600)
                before=page.locator('.hero').evaluate('el=>el.frameStats().target')
                for h in [720,600,844]:
                    page.set_viewport_size({'width':width,'height':h});page.wait_for_timeout(150)
                    assert page.locator('.hero').evaluate('el=>el.frameStats().target')==before
                    bounds=page.locator('.hero').bounding_box()
                    assert abs(bounds['y'])<2 and bounds['height']>=h-1 and bounds['width']>=width-1,bounds
            seen=page.evaluate('()=>window.__seen')
            assert len(seen)>200, len(seen)
            assert not errors,errors
            results.append({'width':width,'nativeForward':True,'nativeReverse':True,'pauseAtTarget':True,'observedUpdates':len(seen),'quality':quality,'errors':errors})
            context.close()
        context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        page=context.new_page()
        page.route('**/video/*.mp4',lambda route:route.abort())
        page.goto(base+'/?motion=full',wait_until='networkidle')
        page.wait_for_function("()=>document.querySelector('.hero').frameStats().renderer==='canvas-fallback'&&document.querySelector('.hero').frameStats().drawn===0")
        results.append({'videoErrorFallback':True});context.close()
        context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
        page=context.new_page();requests=[];page.on('request',lambda r:requests.append(r.url))
        page.goto(base,wait_until='networkidle')
        assert not any('/video/' in u for u in requests)
        results.append({'reducedMotionNoVideoDownload':True});context.close()
    finally:
        browser.close()
pathlib.Path('docs/native-video-tests.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
