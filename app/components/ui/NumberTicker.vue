<script setup lang="ts">
// Adapted from Inspira UI NumberTicker (MIT), native Intl + motion-v; no reactive scroll path.
import {animate} from 'motion-v'
const props=defineProps<{value:number}>(),el=ref<HTMLElement>(),enabled=useMotionPreference()
const price=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'})
onMounted(()=>{let stop:(()=>void)|undefined;const io=new IntersectionObserver(([entry])=>{if(!entry?.isIntersecting||!el.value)return;io.disconnect();if(!enabled.value)return;const control=animate(0,props.value,{duration:.8,onUpdate:n=>{if(el.value)el.value.textContent=price.format(n)}});stop=()=>control.stop()});if(el.value)io.observe(el.value);onBeforeUnmount(()=>{io.disconnect();stop?.()})})
</script>
<template><span ref="el" class="price" :aria-label="price.format(value)">{{price.format(value)}}</span></template>
