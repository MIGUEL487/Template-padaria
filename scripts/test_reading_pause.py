import argparse,json,pathlib
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:8797');args=parser.parse_args()
results=[]
pathlib.Path('artifacts/reading-pause').mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    try:
        for width,lenis in [(360,'on'),(390,'on'),(1440,'on'),(1440,'off')]:
            height=640 if width==360 else 844 if width==390 else 900
            context=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<768,has_touch=width<768)
            page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(args.url+'/?motion=full&lenis='+lenis,wait_until='networkidle')
            distance=page.locator('.hero').evaluate('el=>Number(el.dataset.pinDistance)')
            # A single large wheel gesture reproduces momentum past the whole hero.
            page.mouse.wheel(0,distance*1.7)
            page.wait_for_function("()=>['waiting','reading'].includes(document.querySelector('.hero').dataset.endingPhase)")
            locked=page.evaluate('()=>scrollY')
            page.wait_for_function("()=>document.querySelector('.hero').frameStats().drawn===149",timeout=12000)
            start=page.evaluate('()=>performance.now()')
            copy=page.locator('.hero-copy').bounding_box()
            assert copy['y']>=0 and copy['y']+copy['height']<=height,copy
            for i in range(3):
                page.mouse.wheel(0,800);page.keyboard.press('PageDown');page.wait_for_timeout(100)
                assert abs(page.evaluate('()=>scrollY')-locked)<2,'Momentum escaped the reading pause'
                assert abs(page.locator('.hero').bounding_box()['y'])<2
                assert page.locator('.hero').evaluate('el=>el.dataset.endingPhase') in ['waiting','reading']
            if width==390:
                cdp=context.new_cdp_session(page)
                cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':190,'y':700}]})
                for i in range(1,9):
                    cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':190,'y':700-i*40}]});page.wait_for_timeout(16)
                cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
                assert abs(page.evaluate('()=>scrollY')-locked)<2
            page.wait_for_function("()=>Number(getComputedStyle(document.querySelector('.hero-buttons')).opacity)>.999")
            page.wait_for_function("()=>document.querySelector('.hero').dataset.endingPhase==='done'",timeout=6000)
            elapsed=page.evaluate('()=>performance.now()')-start
            assert 850<=elapsed<=1400,elapsed
            page.screenshot(path=f'artifacts/reading-pause/{width}-{lenis}.png')
            page.wait_for_timeout(150)
            assert abs(page.evaluate('()=>scrollY')-locked)<2,'Old momentum was replayed on release'
            page.mouse.wheel(0,1000)
            page.wait_for_function('(y)=>scrollY>y+100',arg=locked)
            assert not errors,errors
            results.append({'width':width,'lenis':lenis,'lastFrameToReleaseMs':elapsed,'momentumBlocked':True,'newGestureReleased':True,'errors':errors})
            context.close()
        # Explicit navigation bypasses the hold immediately.
        context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        page=context.new_page();page.goto(args.url+'/?motion=full',wait_until='networkidle')
        distance=page.locator('.hero').evaluate('el=>Number(el.dataset.pinDistance)')
        page.evaluate('y=>scrollTo({top:y,behavior:"instant"})',distance*.98)
        page.wait_for_function("()=>Number(getComputedStyle(document.querySelector('.hero-buttons')).opacity)>.7",timeout=12000)
        assert page.locator('.hero').evaluate('el=>el.dataset.endingPhase')=='reading'
        page.get_by_role('link',name='Explorar nosso cardápio').evaluate('el=>el.click()')
        page.wait_for_function("()=>location.hash==='#cardapio'&&scrollY>Number(document.querySelector('.hero').dataset.pinDistance)+100")
        results.append({'ctaBypassesPause':True});context.close()
        # Disabling motion during playback clears the lock and its event listeners.
        context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        page=context.new_page();page.goto(args.url,wait_until='networkidle')
        distance=page.locator('.hero').evaluate('el=>Number(el.dataset.pinDistance)')
        page.evaluate('y=>scrollTo({top:y,behavior:"instant"})',distance*.98)
        page.wait_for_function("()=>document.querySelector('.hero').dataset.endingPhase==='waiting'")
        page.locator('.site-footer button').evaluate('el=>el.click()')
        page.wait_for_function("()=>document.querySelector('.hero').classList.contains('native-motion')")
        page.evaluate('()=>scrollTo({top:1000,behavior:"instant"})');page.wait_for_timeout(100)
        assert page.evaluate('()=>scrollY')==1000
        results.append({'motionToggleClearsPause':True});context.close()
    finally:
        browser.close()
pathlib.Path('docs/reading-pause-tests.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
