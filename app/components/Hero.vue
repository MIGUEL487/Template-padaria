<script setup lang="ts">
import {site} from '../config/site'
import {framePlayer} from '../lib/frame-player'
const root=ref<HTMLElement>(),canvas=ref<HTMLCanvasElement>(),poster=ref<HTMLImageElement>(),enabled=useMotionPreference()
const emit=defineEmits<{nav:[visible:boolean],exit:[color:string]}>();let cleanup=()=>{};let generation=0;let updates=0
onUpdated(()=>{updates++})
onMounted(()=>{
 const engine=useNuxtApp().$scrollEngine
 const setup=async()=>{const gen=++generation;cleanup();if(!root.value||!canvas.value||!poster.value)return;const el=root.value,copy=el.querySelector('.hero-copy')!,shade=el.querySelector('.shade')!,cue=el.querySelector('.scroll-cue')!
 engine.gsap.set([copy.children,shade],{clearProps:'all'});el.classList.toggle('native-motion',!enabled.value)
 if(!enabled.value){emit('nav',true);return}
 try{const player=await framePlayer(el,canvas.value,poster.value,engine.gsap,color=>{const ink=[42,24,16];const out='#'+ink.map((base,c)=>Math.round(base*.96+parseInt(color.slice(1+c*2,3+c*2),16)*.04).toString(16).padStart(2,'0')).join('');emit('exit',out)});if(gen!==generation){player.dispose();return}
 const tl=engine.gsap.timeline({paused:true}).to(shade,{opacity:1,duration:.7},0).to(copy.children,{opacity:1,y:0,stagger:.12,duration:.6},.1).to(cue,{opacity:0,duration:.2},0)
 let navigation=false
 const trigger=engine.ScrollTrigger.create({trigger:el,start:'top top',end:()=>`+=${innerHeight*(matchMedia('(pointer:coarse)').matches?4:6)}`,pin:true,refreshPriority:10,invalidateOnRefresh:true,onUpdate:self=>{player.set(self.progress);tl.progress(Math.max(0,Math.min(1,(self.progress-.72)/.28)));const next=self.progress>.96;if(next!==navigation){navigation=next;emit('nav',next)}},onRefresh:self=>player.set(self.progress)})
 el.dataset.count=String(player.count)
 ;(el as HTMLElement&{frameStats?:()=>unknown}).frameStats=()=>({...player.stats(),vueUpdates:updates})
 engine.ScrollTrigger.sort();engine.ScrollTrigger.refresh()
 cleanup=()=>{trigger.kill();tl.kill();player.dispose();canvas.value&&(canvas.value.style.opacity='0')}
 }catch{el.classList.add('native-motion');emit('nav',true)}}
 const stop=watch(enabled,setup);void setup();const mq=matchMedia('(max-width:768px), (orientation:portrait)');mq.addEventListener('change',setup)
 onBeforeUnmount(()=>{generation++;cleanup();stop();mq.removeEventListener('change',setup)})
})
</script>
<template><section id="inicio" ref="root" class="hero" aria-labelledby="hero-title"><picture><source media="(max-width: 768px), (orientation: portrait)" srcset="/frames/mobile/poster.webp"><img ref="poster" class="poster" src="/frames/pc/poster.webp" alt="Padeiro trabalhando a massa de um pão artesanal" width="1080" height="720" fetchpriority="high"></picture><canvas ref="canvas" aria-hidden="true" style="opacity:0"/><div class="shade"/><div class="hero-brand"><a class="brand" href="#inicio">o refúgio<span class="brand-dot">.</span><small>pão, café & tempo</small></a></div><div class="hero-copy"><p>{{site.hero.eyebrow}}</p><h1 id="hero-title">{{site.hero.title}}</h1><p>{{site.hero.description}}</p><div class="hero-buttons"><UiShimmerButton href="#cardapio">Explorar nosso cardápio <span aria-hidden="true">↗</span></UiShimmerButton><a class="button secondary" href="#historia">Conheça nossa história</a></div></div><p class="scroll-cue">O tempo faz parte da receita <span aria-hidden="true">↓</span></p><noscript><style>.hero-copy p,.hero-copy h1,.hero-buttons,.shade{opacity:1!important;transform:none!important}</style></noscript></section></template>
