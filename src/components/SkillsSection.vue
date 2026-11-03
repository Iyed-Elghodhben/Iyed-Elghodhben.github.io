<script setup>
import { skills } from "../data/content";
</script>

<template>
  <section id="skills" class="skills">
    <div class="container">
      <div class="skills-head" v-reveal>
        <p class="eyebrow">03 — Skills</p>
        <h2>Grouped for scanning, not completeness</h2>
      </div>

      <div class="skills-grid">
        <div
          v-for="(s, i) in skills"
          :key="s.category"
          class="skill-card"
          :class="{ flagship: s.flagship }"
          v-reveal
          :style="{ transitionDelay: (i % 4) * 50 + 'ms' }"
        >
          <h3>{{ s.category }}</h3>
          <p v-if="s.note" class="skill-note">{{ s.note }}</p>
          <div class="skill-tags">
            <span v-for="item in s.items" :key="item" class="tag">{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills {
  padding: 88px 0;
  border-bottom: 1px solid var(--rule);
}

.skills-head h2 {
  font-size: 1.5rem;
  margin: 12px 0 44px;
  max-width: 24ch;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--rule);
  border: 1px solid var(--rule);
}

.skill-card {
  background: var(--paper);
  min-width: 0;
  padding: 20px 20px 22px;
}

.skill-card.flagship {
  background: var(--green-tint);
  grid-column: span 2;
}

.skill-card:last-child {
  grid-column: 1 / -1;
}

.skill-card:last-child .skill-tags {
  max-width: 70ch;
}

.skill-card h3 {
  font-size: 0.92rem;
  font-family: var(--font-body);
  font-weight: 600;
  margin-bottom: 8px;
}

.skill-note {
  font-size: 0.78rem;
  color: var(--ink-soft);
  margin-bottom: 10px;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media (min-width: 561px) and (max-width: 920px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .skill-card.flagship {
    grid-column: span 2;
  }
}

@media (max-width: 560px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
  .skill-card.flagship {
    grid-column: span 1;
  }
}
</style>
