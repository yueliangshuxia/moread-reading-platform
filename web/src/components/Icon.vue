<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [String, Number], default: null }
});
</script>

<template>
  <iconify-icon
    :icon="'ph:' + name"
    :style="size ? { fontSize: typeof size === 'number' ? size + 'px' : size } : undefined"
    aria-hidden="true"
  />
</template>
