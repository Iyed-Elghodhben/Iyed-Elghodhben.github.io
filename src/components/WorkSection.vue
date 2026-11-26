<script setup>
import { projects } from "../data/content";
import ProjectCard from "./ProjectCard.vue";
</script>

<template>
  <section id="work" class="work" v-track-view="'section_work'">
    <div class="container">
      <div class="work-head" v-reveal>
        <p class="eyebrow">02 — Featured work</p>
        <h2>Three systems, three kinds of complexity</h2>
        <p class="work-sub">
          Selected for range: financial-domain depth, mobile &amp; native skill, and systems
          architecture.
        </p>
      </div>

      <div class="work-grid">
        <ProjectCard
          v-for="(p, i) in projects"
          :key="p.slug"
          :project="p"
          :class="{ 'card-wide': projects.length % 2 !== 0 && i === projects.length - 1 }"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.work {
  padding: 88px 0;
  background: var(--green-900);
  color: var(--paper);
}

.work-head h2 {
  color: var(--paper);
  font-size: 1.7rem;
  max-width: 20ch;
  margin: 12px 0 10px;
}

.work .eyebrow {
  color: #8fd6ad;
}

.work-sub {
  color: #c6d9cd;
  max-width: 56ch;
  font-size: 0.98rem;
  margin-bottom: 44px;
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .work-grid {
    grid-template-columns: 1fr;
  }
}
</style>
