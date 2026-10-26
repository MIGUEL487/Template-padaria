<script setup lang="ts">
withDefaults(defineProps<{tone?:string;next?:string;id?:string;class?:string}>(),{tone:'var(--cream)',next:'var(--cream)'})
</script>
<template><section :id="id" class="tone-section" :class="$props.class" :style="{background:tone}"><slot/><div class="tone-join" :style="{background:`linear-gradient(${tone},${next})`}" aria-hidden="true"/></section></template>
