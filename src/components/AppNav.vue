<script setup>
import { ref } from "vue";
import { profile } from "../data/content";

const open = ref(false);
const links = [
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

function close() {
  open.value = false;
}
</script>

<template>
  <header class="nav">
    <div class="nav-inner container">
      <a href="#top" class="nav-mark">EI<span>.</span></a>

      <nav class="nav-links">
        <a v-for="l in links" :key="l.href" :href="l.href">{{ l.label }}</a>
        <a :href="profile.resume" download class="nav-resume">CV ↓</a>
        <a href="#contact" class="nav-cta">Say hello</a>
      </nav>

      <button class="nav-toggle" :aria-expanded="open" aria-label="Toggle menu" @click="open = !open">
        <span></span><span></span>
      </button>
    </div>

    <div v-if="open" class="nav-sheet">
      <a v-for="l in links" :key="l.href" :href="l.href" @click="close">{{ l.label }}</a>
      <a :href="profile.resume" download @click="close">Download CV</a>
      <a href="#contact" class="nav-cta" @click="close">Say hello</a>
    </div>
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

.nav-links a:hover {
  color: var(--ink-900);
}

.nav-resume {
  color: var(--green-600) !important;
  border-bottom: 1px solid transparent;
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

.nav-cta:hover {
  background: var(--ink-900);
  color: var(--paper) !important;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  background: none;
  border: 1px solid var(--rule-strong);
}

.nav-toggle span {
  display: block;
  height: 1px;
  margin: 0 8px;
  background: var(--ink-900);
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
  .nav-sheet {
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-top: 1px solid var(--rule);
    background: var(--paper);
  }
  .nav-sheet a {
    padding: 14px var(--gutter);
    font-family: var(--font-mono);
    font-size: 0.88rem;
    text-decoration: none;
    color: var(--ink);
    border-bottom: 1px solid var(--rule);
  }
}
</style>
