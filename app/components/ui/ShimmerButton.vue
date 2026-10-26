<script setup lang="ts">
// Adapted from Inspira UI ShimmerButton (MIT): transform-only sheen; no animated shadow/blur.
withDefaults(defineProps<{href?:string}>(),{href:'#cardapio'})
</script>
<template><a :href="href" class="button shimmer-button"><span class="sheen" aria-hidden="true"/><slot/></a></template>
