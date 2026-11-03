<script setup>
import { bio } from "../data/content";
</script>

<template>
  <section id="about" class="about">
    <div class="container about-grid">
      <div class="about-head" v-reveal>
        <p class="eyebrow">01 — About</p>
        <h2>Who's building this</h2>
      </div>

      <div class="about-body">
        <p class="about-quote" v-reveal>{{ bio.quote }}</p>

        <ul class="strengths">
          <li v-for="(s, i) in bio.strengths" :key="s.title" v-reveal :style="{ transitionDelay: i * 60 + 'ms' }">
            <span class="strengths-mark">{{ String(i + 1).padStart(2, "0") }}</span>
            <div>
              <b>{{ s.title }}</b>
              <p>{{ s.detail }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  padding: 88px 0;
  border-bottom: 1px solid var(--rule);
}

.about-grid {
  display: grid;
  grid-template-columns: 0.8fr 2fr;
  gap: 48px;
}

.about-head h2 {
  font-size: 1.5rem;
  margin-top: 10px;
  max-width: 14ch;
}

.about-quote {
  font-family: var(--font-display);
  font-size: 1.3rem;
  line-height: 1.6;
  color: var(--ink-900);
  max-width: 62ch;
  margin-bottom: 44px;
  text-wrap: balance;
}

.strengths {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
  border-top: 1px solid var(--rule);
}

.strengths li {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 18px;
  padding: 20px 0;
  border-bottom: 1px solid var(--rule);
}

.strengths-mark {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--green);
  padding-top: 2px;
}

.strengths b {
  display: block;
  font-size: 1rem;
  color: var(--ink-900);
  margin-bottom: 6px;
}

.strengths p {
  color: var(--ink-soft);
  font-size: 0.93rem;
  max-width: 58ch;
}

@media (max-width: 820px) {
  .about-grid {
    grid-template-columns: 1fr;
  }
  .about-head h2 {
    max-width: none;
  }
}
</style>
