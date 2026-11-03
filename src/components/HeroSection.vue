<script setup>
import { profile } from "../data/content";
</script>

<template>
  <section id="top" class="hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Full-stack developer · Ariana, Tunisia</p>
        <h1 class="hero-title">
          I make <em>financial&nbsp;software</em><br />
          you can actually trust.
        </h1>
        <p class="hero-lede">{{ profile.positioning }}</p>
        <p class="hero-sub">
          Multi-tenant Laravel &amp; Vue.js systems for B2B SaaS — from backend
          architecture and APIs to the interfaces and mobile apps that bring them together.
        </p>
        <div class="hero-actions">
          <a href="#work" class="btn btn-primary">View featured work</a>
          <a href="#contact" class="btn btn-ghost">Get in touch</a>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="doc-card">
          <div class="doc-head">
            <span>DOC · 2026-0417</span>
            <span class="doc-status">Verified</span>
          </div>
          <div class="doc-row doc-row-label">
            <span>Client</span><span>Line item</span><span>Amount</span>
          </div>
          <div class="doc-row">
            <span>Client A</span><span>Platform · Monthly</span><span>1 240,000</span>
          </div>
          <div class="doc-row">
            <span>Client A</span><span>Tax (19%)</span><span>235,600</span>
          </div>
          <div class="doc-divider"></div>
          <div class="doc-row doc-total">
            <span></span><span>Total</span><span>1 475,600</span>
          </div>
          <div class="doc-seal">Balanced to the cent ✓</div>
        </div>
        <div class="doc-card doc-card-back" aria-hidden="true"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 72px 0 96px;
  border-bottom: 1px solid var(--rule);
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
}

.hero-title {
  font-size: clamp(2.2rem, 4.4vw, 3.4rem);
  line-height: 1.12;
  margin: 14px 0 22px;
}

.hero-title em {
  font-style: italic;
  color: var(--green-600);
}

.hero-lede {
  font-size: 1.1rem;
  color: var(--ink);
  max-width: 46ch;
  margin-bottom: 14px;
}

.hero-sub {
  font-size: 0.98rem;
  color: var(--ink-soft);
  max-width: 48ch;
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

/* document mock */
.hero-visual {
  position: relative;
  justify-self: center;
}

.doc-card {
  position: relative;
  width: min(390px, 100%);
  background: var(--paper-raised);
  border: 1px solid var(--rule-strong);
  padding: 24px 22px;
  box-shadow: 0 24px 50px -24px rgba(15, 51, 34, 0.35);
  font-family: var(--font-mono);
  font-size: 0.78rem;
}

.doc-card-back {
  position: absolute;
  inset: 14px -14px -14px 14px;
  z-index: -1;
  background: var(--green-tint);
  border: 1px solid var(--rule);
  box-shadow: none;
}

.doc-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--rule);
  color: var(--ink-900);
  font-weight: 500;
}

.doc-status {
  color: var(--green);
  border: 1px solid var(--green);
  padding: 2px 8px;
  font-size: 0.76rem;
  letter-spacing: 0.04em;
}

.doc-row {
  display: grid;
  grid-template-columns: 1fr 1.3fr 0.9fr;
  gap: 8px;
  padding: 7px 0;
  color: var(--ink-soft);
}

.doc-row span:last-child {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.doc-row-label {
  color: var(--ink-faint);
  font-size: 0.76rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding-bottom: 4px;
}

.doc-divider {
  height: 1px;
  background: var(--rule);
  margin: 6px 0;
}

.doc-total {
  color: var(--ink-900);
  font-weight: 500;
}

.doc-total span:nth-child(2) {
  font-family: var(--font-body);
}

.doc-seal {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--rule-strong);
  color: var(--amber);
  font-size: 0.76rem;
  letter-spacing: 0.05em;
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
  .hero-visual {
    order: -1;
    margin-bottom: 8px;
  }
  .doc-card-back {
    display: none;
  }
}
</style>
