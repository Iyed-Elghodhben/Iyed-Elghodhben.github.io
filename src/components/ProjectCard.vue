<script setup>
import { ref } from "vue";
import ProjectVisual from "./ProjectVisual.vue";

const props = defineProps({
  project: { type: Object, required: true },
});

const expanded = ref(true);
const highlightsId = `${props.project.slug}-highlights`;
</script>

<template>
  <article :id="project.slug" class="card" v-reveal>
    <ProjectVisual :type="project.visual" />

    <div class="card-body">
      <div class="card-head">
        <div class="card-head-main">
          <h3>{{ project.name }}</h3>
          <p class="card-tagline">{{ project.tagline }}</p>
        </div>
        <span class="card-role">{{ project.role }}<br />{{ project.dates }}</span>
      </div>

      <p class="card-problem">{{ project.problem }}</p>

      <div v-if="project.stack?.length" class="card-stack">
        <span v-for="t in project.stack" :key="t" class="tag">{{ t }}</span>
      </div>

      <div v-if="project.links?.length" class="card-links">
        <a v-for="l in project.links" :key="l.url" :href="l.url" target="_blank" rel="noopener">
          {{ l.label }} <span aria-hidden="true">↗</span>
        </a>
      </div>

      <button
        class="card-toggle"
        :aria-expanded="expanded"
        :aria-controls="highlightsId"
        @click="expanded = !expanded"
      >
        {{ expanded ? "Hide highlights" : "Show highlights" }}
        <span class="card-toggle-icon">{{ expanded ? "−" : "+" }}</span>
      </button>

      <ul v-show="expanded" :id="highlightsId" class="card-highlights">
        <li v-for="h in project.highlights" :key="h">{{ h }}</li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--paper-raised);
  border: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  min-width: 0;
  scroll-margin-top: 90px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.card:hover {
  border-color: var(--green);
  transform: translateY(-3px);
}

.card-body {
  padding: 22px 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.card-head-main {
  min-width: 0;
}

.card-head h3 {
  font-size: 1.1rem;
}

.card-tagline {
  font-style: italic;
  color: var(--green-600);
  font-size: 0.88rem;
  margin-top: 5px;
  max-width: 34ch;
}

.card-role {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-faint);
  text-align: right;
  white-space: nowrap;
  line-height: 1.5;
}

.card-problem {
  font-size: 0.9rem;
  color: var(--ink-soft);
}

.card-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 18px;
}

.card-links a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--green-600);
  text-decoration: none;
  border-bottom: 1px solid var(--green-600);
  padding: 6px 0;
}

.card-links a:hover {
  color: var(--green-900);
  border-bottom-color: var(--green-900);
}

.card-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 0 11px;
  border: none;
  border-top: 1px solid var(--rule);
  background: none;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.03em;
  color: var(--ink-900);
  cursor: pointer;
  text-align: left;
}

.card-toggle-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--rule-strong);
  font-size: 0.8rem;
  line-height: 1;
}

.card-highlights {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 7px;
  font-size: 0.86rem;
  color: var(--ink);
}
</style>
