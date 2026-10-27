<script setup lang="ts">
import {site} from '../config/site'
import {heroPlayer as framePlayer} from '../lib/video-player'
import frames from '../../public/frames/manifest.json'
const track=ref<HTMLElement>(),root=ref<HTMLElement>(),canvas=ref<HTMLCanvasElement>(),poster=ref<HTMLImageElement>(),enabled=useMotionPreference()
const emit=defineEmits<{nav:[visible:boolean],exit:[color:string]}>();let cleanup=()=>{};let generation=0;let updates=0
let pinnedProgress:()=>number|null=()=>null
onUpdated(()=>{updates++})
onMounted(()=>{
 const engine=useNuxtApp().$scrollEngine
 const setup=async(preserveProgress=false)=>{const resume=preserveProgress?pinnedProgress():null;const gen=++generation;cleanup();if(!root.value||!canvas.value||!poster.value)return;const el=root.value,copy=el.querySelector('.hero-copy')!,shade=el.querySelector('.shade')!,cue=el.querySelector('.scroll-cue')!
 engine.gsap.set([copy.children,shade],{clearProps:'all'});el.classList.toggle('native-motion',!enabled.value)
 if(!enabled.value){emit('nav',true);return}
 const mobile=matchMedia('(max-width:768px), (orientation:portrait)').matches
 el.classList.toggle('hero-native',mobile)
 let drawn=-1,scrollProgress=0,finalVisible=false,renderCopy=()=>{}
 let endingTimer:ReturnType<typeof engine.gsap.delayedCall>|undefined
 try{const player=await framePlayer(el,canvas.value,poster.value,color=>{const ink=[42,24,16];const out='#'+ink.map((base,c)=>Math.round(base*.96+parseInt(color.slice(1+c*2,3+c*2),16)*.04).toString(16).padStart(2,'0')).join('');emit('exit',out)},index=>{drawn=index;if(index===(mobile?frames.mobile.count:frames.pc.count)-1){if(!finalVisible&&!endingTimer)endingTimer=engine.gsap.delayedCall(.35,()=>{finalVisible=true;endingTimer=undefined;renderCopy()})}else{endingTimer?.kill();endingTimer=undefined;finalVisible=false}renderCopy()});if(gen!==generation){player.dispose();return}
 const tl=engine.gsap.timeline({paused:true}).to(shade,{opacity:1,duration:.7},0).to(copy.children,{opacity:1,y:0,stagger:.12,duration:.6,ease:'power2.out'},.1).to(cue,{opacity:0,duration:.2},0)
 const playhead={progress:0}
 const follow=engine.gsap.quickTo(playhead,'progress',{duration:.18,ease:'power2.out',onUpdate:()=>player.set(playhead.progress)})
 let navigation=false
 const screens=Math.max(4,Math.min(6,Math.ceil(player.count/40)))+1
 const videoEnd=.8,copyStart=.86
 el.dataset.videoEnd=String(videoEnd)
 // Copy waits for actual playback to finish, including a fast-scroll backlog.
 renderCopy=()=>{const completed=drawn===player.count-1&&finalVisible;tl.progress(!completed?0:Math.max(0,Math.min(1,(scrollProgress-copyStart)/(1-copyStart))));const next=scrollProgress>.96&&completed;if(next!==navigation){navigation=next;emit('nav',next)}}
 const sync=(self:{progress:number})=>{scrollProgress=self.progress;const progress=Math.min(1,self.progress/videoEnd);if(mobile)player.set(progress);else follow(progress);renderCopy()}
 el.dataset.count=String(player.count)
 ;(el as HTMLElement&{frameStats?:()=>unknown}).frameStats=()=>({...player.stats(),vueUpdates:updates})
 if(mobile&&track.value){
  const runway=track.value,distance=el.clientHeight*screens
  // Older Android Chrome versions retain the pixel fallback if dvh is unsupported.
  runway.style.height=`${distance+el.clientHeight}px`
  runway.style.height=`calc(${distance}px + 100dvh)`
  el.dataset.pinDistance=String(distance);el.dataset.scrollMode='native-sticky'
  let frame:number|undefined
  const update=()=>{frame=undefined;sync({progress:Math.max(0,Math.min(1,-runway.getBoundingClientRect().top/distance))})}
  const schedule=()=>{if(frame===undefined)frame=requestAnimationFrame(update)}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});window.visualViewport?.addEventListener('resize',schedule)
  engine.ScrollTrigger.refresh()
  if(resume!==null)engine.jumpTo(window.scrollY+runway.getBoundingClientRect().top+resume*distance)
  update();pinnedProgress=()=>scrollProgress>0&&scrollProgress<1?scrollProgress:null
  cleanup=()=>{pinnedProgress=()=>null;window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);if(frame!==undefined)cancelAnimationFrame(frame);endingTimer?.kill();follow.tween.kill();tl.kill();player.dispose();runway.style.removeProperty('height');el.classList.remove('hero-native');canvas.value&&(canvas.value.style.opacity='0')}
  return
 }
 el.dataset.scrollMode='gsap-pin'
 const trigger=engine.ScrollTrigger.create({trigger:el,start:'top top',end:()=>`+=${el.clientHeight*screens}`,pin:true,refreshPriority:10,invalidateOnRefresh:true,onUpdate:sync,onRefresh:self=>{el.dataset.pinDistance=String(self.end-self.start);sync(self)}})
 engine.ScrollTrigger.sort();engine.ScrollTrigger.refresh()
 if(resume!==null){engine.jumpTo(trigger.start+resume*(trigger.end-trigger.start));sync({progress:resume})}
 pinnedProgress=()=>trigger.isActive?trigger.progress:null
 cleanup=()=>{pinnedProgress=()=>null;endingTimer?.kill();trigger.kill();follow.tween.kill();tl.kill();player.dispose();canvas.value&&(canvas.value.style.opacity='0')}
 }catch{el.classList.add('native-motion');emit('nav',true)}}
 const stop=watch(enabled,()=>void setup());void setup();const mq=matchMedia('(max-width:768px), (orientation:portrait)');const rotate=()=>void setup(true);mq.addEventListener('change',rotate)
 onBeforeUnmount(()=>{generation++;cleanup();stop();mq.removeEventListener('change',rotate)})
})
</script>
<template>
 <div ref="track" class="hero-track"><section id="inicio" ref="root" class="hero" aria-labelledby="hero-title">
  <picture class="hero-picture">
   <source media="(max-width: 768px), (orientation: portrait)" :srcset="frames.mobile.poster">
   <img ref="poster" class="poster" :src="frames.pc.poster" alt="Farinha sendo polvilhada sobre um pão artesanal" :width="frames.pc.width" :height="frames.pc.height" fetchpriority="high">
  </picture>
  <canvas ref="canvas" aria-hidden="true" style="opacity:0"/>
  <div class="shade"/>
  <div class="hero-copy"><p>{{site.hero.eyebrow}}</p><h1 id="hero-title">{{site.hero.title}}</h1><p>{{site.hero.description}}</p><div class="hero-buttons"><UiShimmerButton href="#cardapio">Explorar nosso cardápio <span aria-hidden="true">↗</span></UiShimmerButton><a class="button secondary" href="#historia">Conheça nossa história</a></div></div>
  <p class="scroll-cue">O tempo faz parte da receita <span aria-hidden="true">↓</span></p>
  <noscript><style>.hero-copy p,.hero-copy h1,.hero-buttons,.shade{opacity:1!important;transform:none!important}</style></noscript>
 </section></div>
</template>
