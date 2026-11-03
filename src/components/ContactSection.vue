<script setup>
import { profile } from "../data/content";
</script>

<template>
  <section id="contact" class="contact">
    <div class="container contact-grid">
      <div v-reveal>
        <p class="eyebrow contact-eyebrow">05 — Contact</p>
        <h2>Let's talk about what you're building.</h2>
        <p class="contact-sub">
          Open to full-stack and backend-leaning roles on B2B SaaS, fintech, or
          compliance-heavy products — remote or Tunis-based. Fluent in French, so
          French-market teams are a natural fit too.
        </p>
      </div>

      <div class="contact-card" v-reveal>
        <a :href="`mailto:${profile.email}`" class="contact-row">
          <span class="contact-label">Email</span>
          <span class="contact-value">{{ profile.email }}</span>
        </a>
        <a :href="profile.linkedin" target="_blank" rel="noopener" class="contact-row">
          <span class="contact-label">LinkedIn</span>
          <span class="contact-value">linkedin.com/in/elghodhben-iyed</span>
        </a>
        <div class="contact-row no-link">
          <span class="contact-label">Based in</span>
          <span class="contact-value">{{ profile.location }}</span>
        </div>
        <div class="contact-cta-row">
          <a :href="`mailto:${profile.email}`" class="btn btn-primary contact-cta">Send an email</a>
          <a :href="profile.resume" download class="btn btn-ghost-light contact-cta">Download CV</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: 96px 0 72px;
  background: var(--ink-900);
  color: var(--paper);
}

.contact-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: start;
}

.contact-eyebrow {
  color: #8fd6ad;
}

.contact h2 {
  color: var(--paper);
  font-size: 1.8rem;
  margin: 14px 0 18px;
  max-width: 16ch;
}

.contact-sub {
  color: #b9c3bd;
  max-width: 44ch;
  font-size: 0.98rem;
}

.contact-card {
  border: 1px solid #2a3a32;
  padding: 10px 24px 24px;
}

.contact-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #2a3a32;
  text-decoration: none;
  color: var(--paper);
}

.contact-row.no-link {
  cursor: default;
}

.contact-label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #7f9488;
  flex: none;
}

.contact-value {
  font-size: 0.92rem;
  text-align: right;
  min-width: 0;
  overflow-wrap: anywhere;
}

.contact-cta-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 22px;
}

.contact-cta {
  width: 100%;
  justify-content: center;
  margin-top: 0;
}

.contact-cta.btn-primary {
  border-color: var(--paper);
  color: var(--ink-900);
  background: var(--paper);
}

.contact-cta.btn-primary:hover {
  background: var(--green-tint);
}

.contact-cta.btn-ghost-light {
  border-color: #3a4c42;
  color: var(--paper);
  background: none;
}

.contact-cta.btn-ghost-light:hover {
  border-color: var(--paper);
  background: #16221c;
}

@media (max-width: 820px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
  .contact h2 {
    max-width: none;
  }
}
</style>
