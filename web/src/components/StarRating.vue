<script setup>
defineProps({
  rating: { type: [Number, String], default: 0 },
  large: { type: Boolean, default: false }
});
</script>

<template>
  <span :class="['rating', { 'rating--lg': large }]">
    <span class="rating__star">★</span>{{ Number(rating || 0).toFixed(1) }}
  </span>
</template>
