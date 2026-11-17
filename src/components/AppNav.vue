<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { profile } from "../data/content";

const open = ref(false);
const active = ref("");
const links = [
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

function close() {
  open.value = false;
}

watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? "hidden" : "";
});

let observer;

onMounted(() => {
  const targets = links
    .map((l) => document.querySelector(l.href))
    .filter(Boolean);

  if (typeof IntersectionObserver === "undefined" || targets.length === 0) return;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          active.value = `#${entry.target.id}`;
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );

  targets.forEach((t) => observer.observe(t));
});

onUnmounted(() => {
  observer?.disconnect();
  document.body.style.overflow = "";
});
</script>

<template>
  <header class="nav" @keydown.esc="close">
    <div class="nav-inner container">
      <a href="#top" class="nav-mark">EI<span>.</span></a>

      <nav class="nav-links">
        <a
          v-for="l in links"
          :key="l.href"
          :href="l.href"
          :class="{ 'is-active': active === l.href }"
          >{{ l.label }}</a
        >
        <a :href="profile.resume" download class="nav-resume">CV ↓</a>
        <a href="#contact" class="nav-cta">Say hello</a>
      </nav>

      <button
        class="nav-toggle"
        :class="{ 'is-open': open }"
        :aria-expanded="open"
        aria-label="Toggle menu"
        @click="open = !open"
      >
        <span></span><span></span>
      </button>
    </div>

    <Transition name="backdrop">
      <div v-if="open" class="nav-backdrop" @click="close"></div>
    </Transition>

    <Transition name="sheet">
      <div v-if="open" class="nav-sheet">
        <a
          v-for="l in links"
          :key="l.href"
          :href="l.href"
          :class="{ 'is-active': active === l.href }"
          @click="close"
          >{{ l.label }}</a
        >
        <a :href="profile.resume" download @click="close">Download CV</a>
        <a href="#contact" class="nav-cta" @click="close">Say hello</a>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--rule);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-mark {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  color: var(--ink-900);
  letter-spacing: 0.02em;
  transition: opacity 0.18s ease;
}

.nav-mark:hover {
  opacity: 0.72;
}

.nav-mark span {
  color: var(--green);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
  font-family: var(--font-mono);
  font-size: 0.82rem;
}

.nav-links a {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--ink-soft);
  position: relative;
  padding: 14px 2px;
  margin: -14px -2px;
}

.nav-links a::after {
  content: "";
  position: absolute;
  left: 2px;
  right: 2px;
  bottom: 10px;
  height: 1px;
  background: var(--green);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease;
}

.nav-links a:hover {
  color: var(--ink-900);
}

.nav-links a:hover::after {
  transform: scaleX(1);
}

.nav-links a.is-active {
  color: var(--ink-900);
}

.nav-links a.is-active::after {
  transform: scaleX(1);
}

.nav-resume {
  color: var(--green-600) !important;
  border-bottom: 1px solid transparent;
}

.nav-resume::after {
  display: none;
}

.nav-resume:hover {
  border-bottom-color: var(--green-600);
}

.nav-cta {
  border: 1px solid var(--ink-900);
  padding: 13px 16px;
  margin: -13px -2px;
  color: var(--ink-900) !important;
}

.nav-cta::after {
  display: none;
}

.nav-cta:hover {
  background: var(--ink-900);
  color: var(--paper) !important;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  background: none;
  border: 1px solid var(--rule-strong);
  cursor: pointer;
}

.nav-toggle span {
  display: block;
  width: 18px;
  height: 1px;
  background: var(--ink-900);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.nav-toggle.is-open span:first-child {
  transform: translateY(2.5px) rotate(45deg);
}

.nav-toggle.is-open span:last-child {
  transform: translateY(-2.5px) rotate(-45deg);
}

.nav-backdrop {
  display: none;
}

.nav-sheet {
  display: none;
}

@media (max-width: 760px) {
  .nav-links {
    display: none;
  }
  .nav-toggle {
    display: flex;
  }
  .nav-backdrop {
    display: block;
    position: fixed;
    inset: 64px 0 0 0;
    background: rgba(14, 22, 18, 0.35);
    z-index: 49;
  }
  .nav-sheet {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    top: 64px;
    z-index: 50;
    flex-direction: column;
    gap: 2px;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    background: var(--paper);
    box-shadow: 0 16px 32px -20px rgba(15, 51, 34, 0.4);
    transform-origin: top;
  }
  .nav-sheet a {
    padding: 14px var(--gutter);
    font-family: var(--font-mono);
    font-size: 0.88rem;
    text-decoration: none;
    color: var(--ink);
    border-bottom: 1px solid var(--rule);
  }
  .nav-sheet a.is-active {
    color: var(--green-600);
  }
  .nav-sheet a.nav-cta {
    border-bottom: 1px solid var(--rule);
  }
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  transform: scaleY(0.96) translateY(-4px);
  opacity: 0;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .sheet-enter-active,
  .sheet-leave-active,
  .backdrop-enter-active,
  .backdrop-leave-active {
    transition: none;
  }
}
</style>
