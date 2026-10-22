<script setup>
import { computed } from "vue";

const props = defineProps({
  points: { type: Array, default: () => [] }
});

const W = 640;
const H = 250;
const pad = { l: 46, r: 18, t: 22, b: 36 };

const maxValue = computed(() => {
  const raw = Math.max(1, ...props.points.map((p) => Number(p.value) || 0));
  let step;
  if (raw <= 20) step = Math.max(1, Math.ceil(raw / 4));
  else if (raw <= 100) step = Math.ceil(raw / 4 / 5) * 5;
  else step = Math.ceil(raw / 4 / 50) * 50;
  return step * 4;
});

const step = computed(() => (props.points.length > 1 ? (W - pad.l - pad.r) / (props.points.length - 1) : 0));
const x = (i) => pad.l + i * step.value;
const y = (v) => H - pad.b - (Number(v) / maxValue.value) * (H - pad.t - pad.b);

const grid = computed(() => {
  const lines = [];
  for (let i = 0; i <= 4; i += 1) {
    const val = (maxValue.value / 4) * i;
    lines.push({ val, y: y(val) });
  }
  return lines;
});

const linePath = computed(() => props.points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(p.value)}`).join(" "));
const areaPath = computed(() => {
  if (!props.points.length) return "";
  return `${linePath.value} L${x(props.points.length - 1)} ${H - pad.b} L${x(0)} ${H - pad.b} Z`;
});

const peakIndex = computed(() => {
  let idx = 0;
  props.points.forEach((p, i) => { if (Number(p.value) > Number(props.points[idx].value)) idx = i; });
  return idx;
});
</script>

<template>
  <svg v-if="points.length" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="活跃读者折线图">
    <g class="viz-grid">
      <template v-for="g in grid" :key="g.val">
        <line :x1="pad.l" :y1="g.y" :x2="W - pad.r" :y2="g.y" />
        <text class="viz-axis" :x="pad.l - 10" :y="g.y + 3" text-anchor="end">{{ Math.round(g.val) }}</text>
      </template>
    </g>
    <path class="viz-area" :d="areaPath" />
    <path class="viz-line-path" :d="linePath" />
    <g>
      <circle
        v-for="(p, i) in points"
        :key="p.label"
        class="viz-dot"
        :class="{ 'viz-dot--peak': i === peakIndex }"
        :cx="x(i)"
        :cy="y(p.value)"
        :r="i === peakIndex ? 5 : 4"
      />
    </g>
    <text
      class="viz-label viz-label--value"
      :x="x(peakIndex)"
      :y="y(points[peakIndex].value) - 13"
      text-anchor="middle"
    >{{ points[peakIndex].value }}</text>
    <g class="viz-axis">
      <text
        v-for="(p, i) in points"
        :key="'x' + p.label"
        :x="x(i)"
        :y="H - 12"
        text-anchor="middle"
      >{{ p.label }}</text>
    </g>
  </svg>
</template>
