<script setup>
import { experience, education } from "../data/content";
</script>

<template>
  <section id="experience" class="experience">
    <div class="container exp-grid">
      <div class="exp-head" v-reveal>
        <p class="eyebrow">04 — Experience</p>
        <h2>Three years, rising stakes</h2>
      </div>

      <div class="exp-main">
        <ol class="timeline">
          <li v-for="(e, i) in experience" :key="e.company" v-reveal :style="{ transitionDelay: i * 60 + 'ms' }">
            <div class="timeline-dot" :class="{ first: i === 0 }"></div>
            <div class="timeline-row">
              <div class="timeline-main">
                <h3>{{ e.company }}</h3>
                <p class="timeline-role">{{ e.role }}</p>
                <p class="timeline-summary">{{ e.summary }}</p>
                <a v-if="e.projectSlug" :href="`#${e.projectSlug}`" class="timeline-link">View project ↑</a>
              </div>
              <span class="timeline-dates">{{ e.dates }}</span>
            </div>
          </li>
        </ol>

        <div class="education" v-reveal>
          <p class="eyebrow">Education</p>
          <ul>
            <li v-for="ed in education" :key="ed.degree">
              <span class="edu-degree">{{ ed.degree }}</span>
              <span class="edu-school">{{ ed.school }}</span>
              <span class="edu-dates">{{ ed.dates }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.experience {
  padding: 88px 0;
  border-bottom: 1px solid var(--rule);
}

.exp-grid {
  display: grid;
  grid-template-columns: 0.8fr 2fr;
  gap: 48px;
}

.exp-head h2 {
  font-size: 1.5rem;
  margin-top: 10px;
  max-width: 14ch;
}

.timeline {
  list-style: none;
  margin: 0 0 56px;
  padding: 0;
  border-left: 1px solid var(--rule-strong);
}

.timeline li {
  position: relative;
  padding: 0 0 36px 28px;
}

.timeline-dot {
  position: absolute;
  left: -5px;
  top: 4px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--paper-raised);
  border: 1px solid var(--ink-faint);
}

.timeline-dot.first {
  background: var(--green);
  border-color: var(--green);
}

.timeline-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.timeline-main h3 {
  font-size: 1.05rem;
}

.timeline-role {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-soft);
  margin: 4px 0 8px;
}

.timeline-summary {
  font-size: 0.9rem;
  color: var(--ink);
  max-width: 54ch;
  margin-bottom: 8px;
}

.timeline-link {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--green-600);
  text-decoration: none;
  border-bottom: 1px solid var(--green-600);
}

.timeline-dates {
  flex: none;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-faint);
  white-space: nowrap;
  padding-top: 3px;
}

.education {
  border-top: 2px solid var(--ink-900);
  padding-top: 16px;
}

.education ul {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.education li {
  display: grid;
  grid-template-columns: 2fr 2fr auto;
  gap: 12px;
  font-size: 0.88rem;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--rule);
}

.edu-degree {
  color: var(--ink-900);
}

.edu-school {
  color: var(--ink-soft);
}

.edu-dates {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-faint);
  white-space: nowrap;
}

@media (max-width: 820px) {
  .exp-grid {
    grid-template-columns: 1fr;
  }
  .exp-head h2 {
    max-width: none;
  }
  .timeline-row {
    flex-direction: column;
    gap: 6px;
  }
  .education li {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
