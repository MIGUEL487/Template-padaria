type Set={width:number;height:number;count:number;bottomColor:string;poster:string;frames:string[]}
type Manifest={pc:Set;mobile:Set}
export async function framePlayer(root:HTMLElement,canvas:HTMLCanvasElement,poster:HTMLImageElement,onReady:(exit:string)=>void,onDraw:(index:number)=>void=()=>{}){
 const controller=new AbortController();let disposed=false
 const manifest:Manifest=await fetch('/frames/manifest.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json()})
 const mobile=matchMedia('(max-width: 768px), (orientation: portrait)').matches;const set=mobile?manifest.mobile:manifest.pc
 onReady(set.bottomColor);poster.src=set.poster
 const context=canvas.getContext('2d',{alpha:false});if(!context)throw Error('Canvas unavailable');const ctx=context
 type Decoded=ImageBitmap|HTMLImageElement
 const close=(image:Decoded)=>{if('close'in image)image.close()}
 const compressed=new Map<number,Blob>(),bitmaps=new Map<number,Decoded>(),pending=new Set<number>(),fetching=new Set<number>(),failed=new Set<number>(),attempts=new Map<number,number>();let target=0,drawn=-1,fallback=-1,dirty=true,dimensionsDirty=true,rect=[0,0,1,1],active=0,direction=1,fetchQueue:number[]=[],decoding=0,frame:number|undefined
 function invalidate(){dirty=true;if(frame===undefined&&!disposed&&!document.hidden)frame=requestAnimationFrame(tick)}
 const connection=(navigator as Navigator&{connection?:{saveData:boolean;effectiveType:string}}).connection
 const step=connection?.saveData||connection?.effectiveType?.includes('2g')?2:1
 const indices=Array.from({length:Math.ceil(set.count/step)},(_,i)=>Math.min(set.count-1,i*step));if(indices.at(-1)!==set.count-1)indices.push(set.count-1)
 const resize=()=>{
  const w=root.clientWidth,h=mobile?canvas.clientHeight:root.clientHeight;if(!w||!h)return
  const ratio=Math.min(mobile?1:1.25,devicePixelRatio,set.width/w,set.height/h)
  const width=Math.max(1,Math.round(w*ratio)),height=Math.max(1,Math.round(h*ratio))
  if(canvas.width===width&&canvas.height===height&&!dimensionsDirty)return
  canvas.width=width;canvas.height=height
  const scale=Math.max(width/set.width,height/set.height);rect=[(width-set.width*scale)/2,(height-set.height*scale)/2,set.width*scale,set.height*scale];invalidate();dimensionsDirty=true
  // Resizing clears a canvas. Repaint the retained bitmap before the browser paints,
  // rather than showing a black/empty surface while waiting for the next ticker.
  const retained=bitmaps.get(drawn)
  if(retained){ctx.drawImage(retained,rect[0]!,rect[1]!,rect[2]!,rect[3]!);canvas.style.opacity='1';dimensionsDirty=false}
  else canvas.style.opacity='0'
 }
 const ro=new ResizeObserver(resize);ro.observe(canvas);resize()
 const visibility=()=>{if(!document.hidden)invalidate()};document.addEventListener('visibilitychange',visibility)
 const radius=4,ahead=mobile?8:6
 const inWindow=(i:number)=>Math.abs(i-target)<=radius||(direction>0?i>target&&i-target<=ahead:i<target&&target-i<=ahead)
 function trim(){for(const [i,b]of bitmaps){if(!inWindow(i)&&i!==drawn&&i!==fallback){close(b);bitmaps.delete(i)}}}
 async function decodeBlob(blob:Blob):Promise<Decoded>{
  // Safari and older WebViews may reject createImageBitmap for an otherwise valid image.
  try{if(typeof createImageBitmap==='function')return await createImageBitmap(blob)}catch{}
  const url=URL.createObjectURL(blob),image=new Image()
  try{await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error('Image unavailable'));image.src=url});return image}finally{URL.revokeObjectURL(url)}
 }
 function decode(i:number){if(disposed||failed.has(i)||bitmaps.has(i)||pending.has(i)||!compressed.has(i)||(!inWindow(i)&&i!==fallback)||decoding>=2)return;pending.add(i);decoding++;decodeBlob(compressed.get(i)!).then(b=>{if(disposed||(!inWindow(i)&&i!==fallback)){close(b);return}bitmaps.set(i,b);invalidate()}).catch(()=>{failed.add(i)}).finally(()=>{pending.delete(i);decoding--;if(!disposed){trim();warm()}})}
 function warm(){
  // A slow connection can deliver every request after the playhead has moved
  // outside its decode window. Keep the closest downloaded frame usable, too.
  const available=[...compressed.keys()].filter(i=>!failed.has(i))
  fallback=available.length?available.reduce((best,i)=>Math.abs(i-target)<Math.abs(best-target)?i:best,available[0]!):-1
  const near=indices.filter(inWindow).sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))
  if(fallback>=0)decode(fallback)
  for(const i of near)decode(i)
 }
 function pump(){if(disposed)return;while(active<4&&fetchQueue.length){const i=fetchQueue.shift()!;if(compressed.has(i)||fetching.has(i)||(attempts.get(i)||0)>=3)continue;active++;fetching.add(i);attempts.set(i,(attempts.get(i)||0)+1);fetch(set.frames[i]!,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Frame unavailable');return r.blob()}).then(blob=>{if(!disposed){compressed.set(i,blob);warm()}}).catch(()=>{if(!disposed&&(attempts.get(i)||0)<3)fetchQueue.unshift(i)}).finally(()=>{fetching.delete(i);active--;pump()})}}
 function queueCurrent(){
  // Rebuild priority from the current playhead, never from a sparse contact sheet.
  // Finish the visible neighbourhood first, then buffer consecutive frames ahead.
  const near=indices.filter(inWindow).sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))
  const rest=indices.filter(i=>!inWindow(i)).sort((a,b)=>{const score=(i:number)=>Math.abs(i-target)+(direction*(i-target)<0?set.count:0);return score(a)-score(b)})
  fetchQueue=[...near,...rest].filter(i=>!compressed.has(i)&&!fetching.has(i));pump();warm()
 }
 queueCurrent()
 function tick(){frame=undefined;if(disposed||document.hidden||!dirty)return;const ready=[...bitmaps.keys()];if(!ready.length)return;const i=bitmaps.has(target)?target:ready.reduce((best,n)=>Math.abs(n-target)<Math.abs(best-target)?n:best,ready[0]!);if(i!==drawn||dimensionsDirty){const b=bitmaps.get(i)!;ctx.drawImage(b,rect[0]!,rect[1]!,rect[2]!,rect[3]!);drawn=i;canvas.style.opacity='1';canvas.dataset.frame=String(i);dimensionsDirty=false;onDraw(i)}dirty=false}
 return {count:set.count,set(progress:number){const next=Math.max(0,Math.min(set.count-1,Math.round(progress*(set.count-1)/step)*step));if(next===target)return;direction=next>target?1:-1;target=next;invalidate();trim();queueCurrent()},dispose(){disposed=true;controller.abort();ro.disconnect();document.removeEventListener('visibilitychange',visibility);if(frame!==undefined)cancelAnimationFrame(frame);for(const b of bitmaps.values())close(b);bitmaps.clear();compressed.clear()},stats(){return{decoded:bitmaps.size,compressed:compressed.size,target,drawn,width:canvas.width,height:canvas.height,sourceWidth:set.width,sourceHeight:set.height}}}
}
