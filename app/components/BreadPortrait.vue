<script setup lang="ts">
// animate: scroll-linked editorial reveal. One intact photograph, no cloned crops.
const root=ref<HTMLElement>(),enabled=useMotionPreference()
let clear=()=>{}
onMounted(()=>{
 const {gsap}=useNuxtApp().$scrollEngine
 const setup=()=>{
  clear();if(!root.value||!enabled.value)return
  const context=gsap.context(()=>{
   gsap.fromTo('.bread-photo',{yPercent:-4,scale:1.08},{yPercent:4,scale:1.02,ease:'none',scrollTrigger:{trigger:root.value,start:'top bottom',end:'bottom top',scrub:.6}})
   gsap.fromTo('.bread-caption',{opacity:0,y:16},{opacity:1,y:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:root.value,start:'top 80%',once:true}})
  },root.value)
  clear=()=>context.revert()
 }
 const stop=watch(enabled,setup);setup()
 onBeforeUnmount(()=>{stop();clear()})
})
</script>
<template>
 <figure ref="root" class="bread-portrait">
  <div class="bread-window"><picture class="bread-photo"><source type="image/avif" srcset="/images/Pao-640.avif 640w, /images/Pao-960.avif 960w, /images/Pao-1440.avif 1440w" sizes="(max-width:768px) 100vw, 50vw"><img src="/images/Pao-960.webp" srcset="/images/Pao-640.webp 640w, /images/Pao-960.webp 960w, /images/Pao-1440.webp 1440w" sizes="(max-width:768px) 100vw, 50vw" alt="Pães dourados inteiros sobre a bancada, com a casca aberta pela fornada" width="640" height="476" loading="lazy"></picture></div>
  <figcaption class="bread-caption"><span>Da nossa fornada.</span><span>Feito para repartir.</span></figcaption>
 </figure>
</template>
<style scoped>
.bread-portrait{margin:0;width:100%;position:relative}
.bread-window{aspect-ratio:1.12;overflow:hidden;border-radius:48% 48% 24px 24px;background:var(--beige)}
.bread-photo,.bread-photo img{display:block;width:100%;height:100%}
.bread-photo img{object-fit:cover}
.bread-caption{display:flex;justify-content:space-between;gap:16px;padding:24px 0 0;color:var(--coffee);font:italic 16px/24px Georgia,serif}
@media(max-width:768px){.bread-window{aspect-ratio:1.16}.bread-caption{padding-top:16px}}
@media(prefers-reduced-motion:reduce){.bread-photo{transform:none!important}.bread-caption{opacity:1!important;transform:none!important}}
</style>
