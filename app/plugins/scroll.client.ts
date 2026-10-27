import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
export default defineNuxtPlugin(nuxt=>{
 gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});gsap.ticker.lagSmoothing(0)
 const enabled=useMotionPreference(),query=matchMedia('(prefers-reduced-motion: reduce)');let lenis:Lenis|undefined
 const forced=new URLSearchParams(location.search).get('motion');let saved:string|null=null;try{saved=localStorage.getItem('refugio-motion')}catch{}
 const initialPreference=forced==='full'?true:forced==='off'?false:saved!==null?saved==='on':!query.matches
 document.documentElement.classList.toggle('motion-off',!initialPreference)
 const tick=(time:number)=>{if(!document.hidden)lenis?.raf(time*1000)};gsap.ticker.add(tick)
 const configure=()=>{lenis?.destroy();lenis=undefined;if(enabled.value&&!matchMedia('(pointer: coarse)').matches&&new URLSearchParams(location.search).get('lenis')!=='off'){lenis=new Lenis({autoRaf:false,syncTouch:false});lenis.on('scroll',ScrollTrigger.update)}document.documentElement.classList.toggle('motion-off',!enabled.value);ScrollTrigger.refresh()}
 watch(enabled,configure,{flush:'post'});nuxt.hook('app:mounted',()=>{enabled.value=initialPreference;configure()})
 const visibility=()=>document.documentElement.classList.toggle('page-hidden',document.hidden);document.addEventListener('visibilitychange',visibility)
 const preference=()=>{try{if(localStorage.getItem('refugio-motion')===null&&forced===null)enabled.value=!query.matches}catch{enabled.value=!query.matches}};query.addEventListener('change',preference)
 let releaseScroll=()=>{}
 const scrollTo=(target:string)=>{releaseScroll();const el=document.querySelector(target);if(!el)return;if(lenis)lenis.scrollTo(el as HTMLElement,{offset:-80});else el.scrollIntoView({behavior:enabled.value?'smooth':'instant'})}
 const jumpTo=(top:number)=>{if(lenis)lenis.scrollTo(top,{immediate:true,force:true});else window.scrollTo({top,behavior:'instant'});ScrollTrigger.update()}
 const lockAt=(top:number)=>{
  releaseScroll();const pausedLenis=lenis;pausedLenis?.stop()
  const prevent=(event:Event)=>event.preventDefault()
  const key=(event:KeyboardEvent)=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)&&!(event.target as HTMLElement).closest('a,button,input,select,textarea,[contenteditable]'))event.preventDefault()}
  const clamp=()=>{if(Math.abs(window.scrollY-top)>1)jumpTo(top)}
  window.addEventListener('wheel',prevent,{passive:false,capture:true});window.addEventListener('touchmove',prevent,{passive:false,capture:true});window.addEventListener('keydown',key,true);window.addEventListener('scroll',clamp,{passive:true})
  let active=true
  const release=()=>{if(!active)return;active=false;window.removeEventListener('wheel',prevent,true);window.removeEventListener('touchmove',prevent,true);window.removeEventListener('keydown',key,true);window.removeEventListener('scroll',clamp);if(lenis===pausedLenis)pausedLenis?.start();if(releaseScroll===release)releaseScroll=()=>{}}
  releaseScroll=release;jumpTo(top);return release
 }
 const click=(event:MouseEvent)=>{const a=(event.target as HTMLElement).closest('a[href^="#"]');if(a){const href=a.getAttribute('href');if(href&&href.length>1&&document.querySelector(href)){event.preventDefault();scrollTo(href);history.replaceState(null,'',href)}}};document.addEventListener('click',click)
 nuxt.hook('app:beforeMount',()=>{})
 return {provide:{scrollEngine:{gsap,ScrollTrigger,scrollTo,jumpTo,lockAt}}}
})
