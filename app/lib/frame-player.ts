import type {gsap as GSAP} from 'gsap'
type Set={width:number;height:number;count:number;bottomColor:string;poster:string;frames:string[]}
type Manifest={pc:Set;mobile:Set}
export async function framePlayer(root:HTMLElement,canvas:HTMLCanvasElement,poster:HTMLImageElement,gsap:typeof GSAP,onReady:(exit:string)=>void){
 const controller=new AbortController();let disposed=false
 const manifest:Manifest=await fetch('/frames/manifest.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json()})
 const mobile=matchMedia('(max-width: 768px), (orientation: portrait)').matches;const set=mobile?manifest.mobile:manifest.pc
 onReady(set.bottomColor);poster.src=set.poster
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Canvas unavailable')
 const compressed=new Map<number,Blob>(),bitmaps=new Map<number,ImageBitmap>(),pending=new Set<number>(),fetching=new Set<number>(),failed=new Set<number>();let target=0,drawn=-1,dirty=true,dimensionsDirty=true,rect=[0,0,1,1],active=0,visible=true,direction=1,fetchQueue:number[]=[],decoding=0
 const connection=(navigator as Navigator&{connection?:{saveData:boolean;effectiveType:string}}).connection
 const step=connection?.saveData||connection?.effectiveType?.includes('2g')?2:1
 const indices=Array.from({length:Math.ceil(set.count/step)},(_,i)=>Math.min(set.count-1,i*step));if(indices.at(-1)!==set.count-1)indices.push(set.count-1)
 const resize=()=>{const w=root.clientWidth,h=root.clientHeight;const ratio=Math.min(mobile?1:1.25,devicePixelRatio,set.width/w,set.height/h);canvas.width=Math.max(1,Math.round(w*ratio));canvas.height=Math.max(1,Math.round(h*ratio));const scale=Math.max(canvas.width/set.width,canvas.height/set.height);rect=[(canvas.width-set.width*scale)/2,(canvas.height-set.height*scale)/2,set.width*scale,set.height*scale];dirty=true;dimensionsDirty=true}
 const ro=new ResizeObserver(resize);ro.observe(root);resize()
 const io=new IntersectionObserver(([entry])=>{visible=!!entry?.isIntersecting;dirty=true});io.observe(root)
 const radius=8,ahead=12
 const inWindow=(i:number)=>Math.abs(i-target)<=radius||(direction>0?i>target&&i-target<=ahead:i<target&&target-i<=ahead)
 function trim(){for(const [i,b]of bitmaps){if(!inWindow(i)&&i!==drawn){b.close();bitmaps.delete(i)}}}
 function decode(i:number){if(disposed||failed.has(i)||bitmaps.has(i)||pending.has(i)||!compressed.has(i)||!inWindow(i)||decoding>=2)return;pending.add(i);decoding++;createImageBitmap(compressed.get(i)!).then(b=>{if(disposed||!inWindow(i)){b.close();return}bitmaps.set(i,b);dirty=true}).catch(()=>{failed.add(i)}).finally(()=>{pending.delete(i);decoding--;if(!disposed){trim();warm()}})}
 function warm(){const near=indices.filter(inWindow).sort((a,b)=>Math.abs(a-target)-Math.abs(b-target));for(const i of near)decode(i)}
 function pump(){if(disposed)return;while(active<4&&fetchQueue.length){const i=fetchQueue.shift()!;if(compressed.has(i)||fetching.has(i))continue;active++;fetching.add(i);fetch(set.frames[i]!,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Frame unavailable');return r.blob()}).then(blob=>{if(!disposed){compressed.set(i,blob);decode(i)}}).catch(()=>{}).finally(()=>{fetching.delete(i);active--;pump()})}}
 function queueCurrent(){const near=indices.filter(inWindow).sort((a,b)=>Math.abs(a-target)-Math.abs(b-target));fetchQueue=[...near,...fetchQueue.filter(i=>!near.includes(i))];pump();warm()}
 fetchQueue=[0,...indices.filter(i=>i%10===0),...indices];pump()
 const tick=()=>{if(disposed||document.hidden||!visible||!dirty)return;const ready=[...bitmaps.keys()];if(!ready.length)return;const i=bitmaps.has(target)?target:ready.reduce((best,n)=>Math.abs(n-target)<Math.abs(best-target)?n:best,ready[0]!);if(i!==drawn||dimensionsDirty){const b=bitmaps.get(i)!;ctx.drawImage(b,rect[0]!,rect[1]!,rect[2]!,rect[3]!);drawn=i;canvas.style.opacity='1';canvas.dataset.frame=String(i);dimensionsDirty=false}dirty=false}
 gsap.ticker.add(tick)
 return {count:set.count,set(progress:number){const next=Math.min(set.count-1,Math.round(progress*(set.count-1)/step)*step);if(next===target)return;direction=next>target?1:-1;target=next;dirty=true;trim();queueCurrent()},dispose(){disposed=true;controller.abort();ro.disconnect();io.disconnect();gsap.ticker.remove(tick);for(const b of bitmaps.values())b.close();bitmaps.clear();compressed.clear()},stats(){return{decoded:bitmaps.size,compressed:compressed.size,target,drawn,width:canvas.width,height:canvas.height,sourceWidth:set.width,sourceHeight:set.height}}}
}
