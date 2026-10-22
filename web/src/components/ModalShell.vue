<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import Icon from "./Icon.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  wide: { type: Boolean, default: false }
});
const emit = defineEmits(["close"]);

function onKey(e) {
  if (e.key === "Escape" && props.open) emit("close");
}
onMounted(() => document.addEventListener("keydown", onKey));
onBeforeUnmount(() => document.removeEventListener("keydown", onKey));
</script>

<template>
  <div v-if="open" class="modal">
    <div class="modal__backdrop" @click="emit('close')" />
    <div class="modal__panel" :style="wide ? { width: 'min(720px, 100%)' } : undefined" role="dialog" aria-modal="true">
      <div class="modal__head">
        <div>
          <h2>{{ title }}</h2>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
        <button class="icon-btn modal__close" type="button" aria-label="关闭" @click="emit('close')">
          <Icon name="x" />
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>
