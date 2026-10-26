<script setup lang="ts">
import {Motion} from 'motion-v'
// Adapted from Inspira UI BlurReveal (MIT). Animated blur removed; 8px grid, once.
const enabled=useMotionPreference()
withDefaults(defineProps<{delay?:number}>(),{delay:0})
</script>
<template><Motion as="div" class="reveal" :initial="{opacity:0,y:enabled?24:0}" :while-in-view="{opacity:1,y:0}" :in-view-options="{once:true,amount:.12}" :transition="{duration:enabled?.8:.16,delay,ease:[.22,1,.36,1]}"><slot/></Motion></template>
