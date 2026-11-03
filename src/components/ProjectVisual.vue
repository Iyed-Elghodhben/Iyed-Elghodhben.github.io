<script setup>
defineProps({
  type: { type: String, required: true },
});
</script>

<template>
  <div class="pv" :class="`pv-${type}`" aria-hidden="true">
    <!-- ledger: stacked invoice lines + compliance badge -->
    <div v-if="type === 'ledger'" class="pv-inner pv-ledger">
      <div class="pv-ledger-sheet" v-for="n in 2" :key="n" :style="{ '--n': n }"></div>
      <div class="pv-ledger-top">
        <span v-for="n in 4" :key="n" class="pv-ledger-line" :style="{ width: 40 + n * 12 + '%' }"></span>
      </div>
      <span class="pv-badge">El Fatoora ✓</span>
    </div>

    <!-- geofence: concentric radius rings + pin -->
    <div v-else-if="type === 'geofence'" class="pv-inner pv-geofence">
      <span class="pv-ring pv-ring-1"></span>
      <span class="pv-ring pv-ring-2"></span>
      <span class="pv-ring pv-ring-3"></span>
      <span class="pv-pin"></span>
      <span class="pv-badge pv-badge-bottom">Geo-fenced zone</span>
    </div>

    <!-- network: gateway + service nodes -->
    <div v-else-if="type === 'network'" class="pv-inner pv-network">
      <svg viewBox="0 0 220 140" class="pv-network-svg">
        <line x1="110" y1="70" x2="36" y2="24" />
        <line x1="110" y1="70" x2="36" y2="116" />
        <line x1="110" y1="70" x2="184" y2="24" />
        <line x1="110" y1="70" x2="184" y2="116" />
      </svg>
      <span class="pv-node pv-node-gateway">Gateway</span>
      <span class="pv-node" style="left:16.4%; top:17.1%">Auth</span>
      <span class="pv-node" style="left:16.4%; top:82.9%">Chat</span>
      <span class="pv-node" style="left:83.6%; top:17.1%">Orders</span>
      <span class="pv-node" style="left:83.6%; top:82.9%">Users</span>
    </div>

    <!-- ticket: perforated subscription card -->
    <div v-else-if="type === 'ticket'" class="pv-inner pv-ticket">
      <div class="pv-ticket-card">
        <div class="pv-ticket-main">
          <span class="pv-ticket-label">STB · Monthly pass</span>
          <span class="pv-ticket-route">Tunis → Ariana</span>
        </div>
        <div class="pv-ticket-stub">
          <span v-for="n in 5" :key="n" class="pv-ticket-dot"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pv {
  position: relative;
  height: 180px;
  background: var(--paper);
  border-bottom: 1px solid var(--rule);
  overflow: hidden;
}

.pv-inner {
  position: absolute;
  inset: 0;
}

/* ledger */
.pv-ledger-sheet {
  position: absolute;
  inset: 22px 28px 22px calc(28px + var(--n) * 8px);
  background: var(--paper-raised);
  border: 1px solid var(--rule);
  opacity: calc(1 - var(--n) * 0.25);
}

.pv-ledger-top {
  position: absolute;
  inset: 28px 40px auto 36px;
  display: grid;
  gap: 9px;
}

.pv-ledger-line {
  height: 6px;
  background: var(--rule-strong);
}

.pv-ledger-line:first-child {
  background: var(--green);
  opacity: 0.6;
}

.pv-badge {
  position: absolute;
  right: 36px;
  bottom: 24px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--amber);
  border: 1px dashed var(--rule-strong);
  padding: 4px 9px;
  background: var(--paper-raised);
}

/* geofence */
.pv-geofence {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pv-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--green);
  left: 50%;
  top: 48%;
  transform: translate(-50%, -50%);
}

.pv-ring-1 { width: 60px; height: 60px; opacity: 0.9; }
.pv-ring-2 { width: 110px; height: 110px; opacity: 0.5; }
.pv-ring-3 { width: 160px; height: 160px; opacity: 0.25; }

.pv-pin {
  position: absolute;
  left: 50%;
  top: 48%;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--green-900);
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 4px var(--green-tint);
}

.pv-badge-bottom {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  right: auto;
}

/* network */
.pv-network-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.pv-network-svg line {
  stroke: var(--rule-strong);
  stroke-width: 1;
}

.pv-node {
  position: absolute;
  transform: translate(-50%, -50%);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-soft);
  background: var(--paper-raised);
  border: 1px solid var(--rule);
  padding: 5px 9px;
}

.pv-node-gateway {
  left: 50%;
  top: 50%;
  color: var(--paper-raised);
  background: var(--green-900);
  border-color: var(--green-900);
  font-weight: 500;
}

/* ticket */
.pv-ticket {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pv-ticket-card {
  display: flex;
  width: 78%;
  background: var(--paper-raised);
  border: 1px solid var(--rule-strong);
}

.pv-ticket-main {
  flex: 1;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pv-ticket-label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--amber);
}

.pv-ticket-route {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--ink-900);
}

.pv-ticket-stub {
  width: 56px;
  border-left: 1px dashed var(--rule-strong);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.pv-ticket-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--rule-strong);
}
</style>
