export function formatNumber(value) {
  const n = Number(value || 0);
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + " 万";
  return String(n);
}

export function initialOf(name) {
  return (name || "读").slice(0, 1);
}

export function avatarIndex(name) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i += 1) h = (h * 31 + (name || "").charCodeAt(i)) >>> 0;
  return h % 6;
}

export function ratingText(rating) {
  return Number(rating || 0).toFixed(1);
}

export function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
