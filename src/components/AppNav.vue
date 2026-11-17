<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { profile } from "../data/content";

const open = ref(false);
const active = ref("");
const scrolled = ref(false);
const links = [
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

function close() {
  open.value = false;
}

function onScroll() {
  scrolled.value = window.scrollY > 8;
}

watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? "hidden" : "";
});

let observer;

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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
  window.removeEventListener("scroll", onScroll);
  document.body.style.overflow = "";
});
</script>

<template>
  <header class="nav" :class="{ 'is-scrolled': scrolled }" @keydown.esc="close">
    <div class="nav-accent" aria-hidden="true"></div>
    <div class="nav-inner container">
      <a href="#top" class="nav-mark">
        <span class="nav-mark-badge">EI</span>
      </a>

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
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.nav.is-scrolled {
  border-bottom-color: var(--rule-strong);
  box-shadow: 0 10px 28px -20px rgba(15, 51, 34, 0.45);
}

.nav-accent {
  height: 3px;
  background: var(--green);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  transition: height 0.25s ease;
}

.nav-mark {
  display: inline-flex;
  text-decoration: none;
}

.nav-mark-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--ink-900);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--ink-900);
  transition: background 0.18s ease, color 0.18s ease;
}

.nav-mark-badge::after {
  content: "";
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  border: 2px solid var(--paper-raised);
}

.nav-mark:hover .nav-mark-badge {
  background: var(--ink-900);
  color: var(--paper-raised);
}

@media (min-width: 761px) {
  .nav.is-scrolled .nav-inner {
    height: 58px;
  }
  .nav.is-scrolled .nav-mark-badge {
    width: 32px;
    height: 32px;
  }
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
  background: var(--green-900);
  border: 1px solid var(--green-900);
  padding: 13px 18px;
  margin: -13px -2px;
  color: var(--paper-raised) !important;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.nav-cta::after {
  display: none;
}

.nav-cta:hover {
  background: var(--green-600);
  border-color: var(--green-600);
  transform: translateY(-1px);
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
    inset: 72px 0 0 0;
    background: rgba(14, 22, 18, 0.35);
    z-index: 49;
  }
  .nav-sheet {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    top: 72px;
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
    margin: 2px 14px 14px;
    padding: 14px 18px;
    text-align: center;
    border: 1px solid var(--green-900);
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
