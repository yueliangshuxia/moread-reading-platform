<script setup>
import { computed } from "vue";
import { avatarIndex, initialOf } from "../utils/format";

const props = defineProps({
  name: { type: String, default: "读" },
  size: { type: String, default: "" }
});

const index = computed(() => avatarIndex(props.name));
const sizeClass = computed(() => (props.size ? "avatar--" + props.size : ""));
</script>

<template>
  <span :class="['avatar', 'avatar--' + index, sizeClass]" aria-hidden="true">{{ initialOf(name) }}</span>
</template>
