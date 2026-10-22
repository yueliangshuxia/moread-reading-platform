<script setup>
import { useUiStore } from "../stores/ui";
import Icon from "./Icon.vue";

const ui = useUiStore();
</script>

<template>
  <Transition name="toast">
    <div v-if="ui.toast.show" class="toast is-on" role="status">
      <Icon :name="ui.toast.icon" />
      <span>{{ ui.toast.message }}</span>
    </div>
  </Transition>
</template>

<style>
.toast-enter-active,
.toast-leave-active { transition: opacity .25s var(--ease), transform .25s var(--ease); }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translate(-50%, 18px); }
</style>
