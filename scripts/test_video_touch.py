import argparse,json,pathlib
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:8792');args=parser.parse_args()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    try:
        context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2)
        page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(args.url+'/?motion=full',wait_until='networkidle')
        cdp=context.new_cdp_session(page)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':190,'y':700}]})
        for i in range(1,17):
            cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':190,'y':700-i*24}]});page.wait_for_timeout(20)
        page.wait_for_timeout(100);cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        page.wait_for_function("()=>{const s=document.querySelector('.hero').frameStats();return s.drawn>=s.target&&s.drawn>0}")
        page.screenshot(path='artifacts/playback-review/mobile-movement.png')
        snapshots=[]
        for width,height in [(844,390),(390,844)]:
            page.set_viewport_size({'width':width,'height':height})
            page.wait_for_function('(w)=>document.querySelector(".hero").frameStats().sourceWidth===w',arg=1920 if width==844 else 720)
            page.wait_for_function('()=>[...document.querySelectorAll(".hero video")].some(v=>v.style.opacity==="1")')
            bounds=page.locator('.hero').bounding_box()
            assert abs(bounds['y'])<2 and bounds['width']>=width-1 and bounds['height']>=height-1,bounds
            assert page.locator('.hero video').count()==2,'Video elements leaked during orientation change'
            snapshots.append({'width':width,'height':height,'bounds':bounds,'stats':page.locator('.hero').evaluate('el=>el.frameStats()')})
        assert not errors,errors
        pathlib.Path('docs/video-touch-tests.json').write_text(json.dumps({'snapshots':snapshots,'errors':errors},indent=2))
        print('Native video: touch movement and both orientation changes passed')
    finally:
        browser.close()
