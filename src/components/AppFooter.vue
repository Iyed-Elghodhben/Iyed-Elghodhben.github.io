<script setup>
import { profile } from "../data/content";
const year = new Date().getFullYear();
</script>

<template>
  <footer class="footer">
    <div class="container footer-row">
      <span>{{ profile.name }} · {{ profile.title }}</span>
      <span>© {{ year }}</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--ink-900);
  color: #7f9488;
  border-top: 1px solid #2a3a32;
}

.footer-row {
  display: flex;
  justify-content: space-between;
  padding: 18px var(--gutter);
  font-family: var(--font-mono);
  font-size: 0.78rem;
}
</style>
