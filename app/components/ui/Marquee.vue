<script setup lang="ts">
// Adapted from Inspira UI Marquee (MIT); one duplicate, viewport pause.
const el=ref<HTMLElement>();onMounted(()=>{const io=new IntersectionObserver(([e])=>el.value?.classList.toggle('running',!!e?.isIntersecting));if(el.value)io.observe(el.value);onBeforeUnmount(()=>io.disconnect())})
</script>
<template><div ref="el" class="marquee"><div class="marquee-track"><div><slot/></div><div aria-hidden="true"><slot/></div></div></div></template>
