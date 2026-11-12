<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";

// Set after deploying the worker (`npm run deploy` in /worker) — wrangler prints the URL.
const AGENT_ENDPOINT = "https://iyed-career-agent.iyed-elghodhben.workers.dev";

const suggestions = [
  "What's his strongest skill?",
  "Tell me about the Iberis Finances project",
  "Is he open to new roles?",
];

const isOpen = ref(false);
const messages = ref([]);
const draft = ref("");
const isLoading = ref(false);
const error = ref("");
const messagesEl = ref(null);
const inputEl = ref(null);

async function scrollToBottom() {
  await nextTick();
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
}

async function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await nextTick();
    inputEl.value?.focus();
  }
}

function onKeydown(e) {
  if (e.key === "Escape" && isOpen.value) {
    isOpen.value = false;
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

async function ask(question) {
  draft.value = question;
  await send();
}

async function send() {
  const content = draft.value.trim();
  if (!content || isLoading.value) return;

  messages.value.push({ role: "user", content });
  draft.value = "";
  error.value = "";
  isLoading.value = true;
  scrollToBottom();

  try {
    const res = await fetch(AGENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages.value.slice(-12) }),
    });

    if (!res.ok) throw new Error("bad-status");

    const data = await res.json();
    messages.value.push({ role: "assistant", content: data.reply });
  } catch {
    error.value = "Couldn't reach the agent right now — email iyed.elghodhben@gmail.com directly.";
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
}
</script>

<template>
  <div class="agent-widget">
    <button
      class="agent-toggle"
      type="button"
      :aria-expanded="isOpen"
      aria-controls="career-agent-panel"
      @click="toggleOpen"
    >
      <span aria-hidden="true">{{ isOpen ? "✕" : "💬" }}</span>
      <span>{{ isOpen ? "Close" : "Ask my AI agent" }}</span>
    </button>

    <div v-if="isOpen" id="career-agent-panel" class="agent-panel" role="dialog" aria-label="AI career agent chat">
      <header class="agent-header">
        <p class="eyebrow">AI Career Agent</p>
        <h3>Ask about Iyed's work</h3>
      </header>

      <div ref="messagesEl" class="agent-messages">
        <p v-if="messages.length === 0" class="agent-intro">
          I know Iyed's experience, projects, and skills in detail — ask me anything a resume can't answer quickly.
        </p>
        <div v-for="(m, i) in messages" :key="i" class="agent-message" :class="m.role">
          <p>{{ m.content }}</p>
        </div>
        <div v-if="isLoading" class="agent-message assistant agent-typing">
          <p>Thinking…</p>
        </div>
        <p v-if="error" class="agent-error">{{ error }}</p>
      </div>

      <div v-if="messages.length === 0" class="agent-suggestions">
        <button v-for="q in suggestions" :key="q" class="tag" type="button" @click="ask(q)">
          {{ q }}
        </button>
      </div>

      <form class="agent-input" @submit.prevent="send">
        <textarea
          ref="inputEl"
          v-model="draft"
          rows="1"
          maxlength="500"
          placeholder="Ask about his experience, stack, or projects…"
          @keydown.enter.exact.prevent="send"
        ></textarea>
        <button class="btn btn-primary" type="submit" :disabled="isLoading || !draft.trim()">Send</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.agent-widget {
  position: fixed;
  right: clamp(16px, 4vw, 32px);
  bottom: clamp(16px, 4vw, 32px);
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.agent-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.02em;
  padding: 12px 20px;
  background: var(--green-900);
  color: var(--paper-raised);
  border: 1px solid var(--green-900);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;
}

.agent-toggle:hover {
  background: var(--green-600);
  transform: translateY(-1px);
}

.agent-panel {
  width: min(380px, calc(100vw - 32px));
  max-height: min(560px, 70vh);
  display: flex;
  flex-direction: column;
  background: var(--paper-raised);
  border: 1px solid var(--rule-strong);
  border-radius: var(--radius);
  box-shadow: 0 16px 40px rgba(14, 22, 18, 0.18);
  overflow: hidden;
}

.agent-header {
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--rule);
}

.agent-header h3 {
  font-size: 1.05rem;
  margin-top: 4px;
}

.agent-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agent-intro {
  color: var(--ink-soft);
  font-size: 0.92rem;
}

.agent-message p {
  margin: 0;
  padding: 9px 12px;
  border-radius: var(--radius);
  font-size: 0.92rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.agent-message.user {
  align-self: flex-end;
}

.agent-message.user p {
  background: var(--green-900);
  color: var(--paper-raised);
}

.agent-message.assistant p {
  background: var(--paper);
  border: 1px solid var(--rule);
  color: var(--ink);
}

.agent-typing p {
  color: var(--ink-faint);
  font-style: italic;
}

.agent-error {
  color: var(--amber);
  font-size: 0.85rem;
  font-family: var(--font-mono);
}

.agent-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 18px 12px;
}

.agent-suggestions .tag {
  cursor: pointer;
  background: var(--paper-raised);
}

.agent-suggestions .tag:hover {
  border-color: var(--green-600);
  color: var(--green-600);
}

.agent-input {
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid var(--rule);
}

.agent-input textarea {
  flex: 1;
  resize: none;
  font-family: var(--font-body);
  font-size: 0.92rem;
  padding: 9px 10px;
  border: 1px solid var(--rule-strong);
  border-radius: var(--radius);
  background: var(--paper-raised);
  color: var(--ink);
  max-height: 100px;
}

.agent-input textarea:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 1px;
}

.agent-input .btn {
  padding: 9px 16px;
}

@media (max-width: 480px) {
  .agent-widget {
    right: 12px;
    bottom: 12px;
  }
}
</style>
