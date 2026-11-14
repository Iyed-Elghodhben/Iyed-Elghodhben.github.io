<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { AGENT_ENDPOINT, track } from "../lib/analytics";

const suggestions = [
  "What's his strongest skill?",
  "Tell me about the Iberis Finances project",
  "Is he open to new roles?",
];

// Persisted per-tab so a page refresh doesn't wipe the conversation the visitor was having —
// without this, Iyed's reply could arrive after a reload and have nothing to show up in.
const MESSAGES_KEY = "career-agent-messages";

function loadSavedMessages() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(MESSAGES_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const isOpen = ref(false);
const messages = ref(loadSavedMessages());
const draft = ref("");
const isLoading = ref(false);
const error = ref("");
const messagesEl = ref(null);
const inputEl = ref(null);

// Identifies this chat to the worker so Iyed can reply directly via Telegram with
// `/reply <sessionId> <message>` — short on purpose, since he has to type it on his phone.
// Persisted per-tab, carries no personal data on its own.
function getSessionId() {
  const key = "career-agent-session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem(key, id);
  }
  return id;
}
const sessionId = getSessionId();

watch(
  messages,
  (value) => {
    sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(value));
  },
  { deep: true },
);

let humanReplyTimer = null;
let humanReplyDeadline = 0;

function armHumanReplyPolling() {
  humanReplyDeadline = Date.now() + 5 * 60 * 1000; // keep listening for 5 min after the latest question
  if (humanReplyTimer) return;
  humanReplyTimer = setInterval(checkHumanReply, 1500);
}

function stopHumanReplyPolling() {
  if (humanReplyTimer) {
    clearInterval(humanReplyTimer);
    humanReplyTimer = null;
  }
}

async function checkHumanReply() {
  if (Date.now() > humanReplyDeadline) {
    stopHumanReplyPolling();
    return;
  }
  try {
    const res = await fetch(`${AGENT_ENDPOINT}/reply-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.reply) {
      messages.value.push({ role: "human", content: data.reply });
      scrollToBottom();
    }
  } catch {
    // best-effort — just try again next tick
  }
}

const leadEmail = ref("");
const leadDismissed = ref(false);
const leadStatus = ref("idle"); // idle | sending | sent | error

const showLeadPrompt = computed(
  () => !leadDismissed.value && leadStatus.value !== "sent" && messages.value.some((m) => m.role === "assistant"),
);

async function scrollToBottom() {
  await nextTick();
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
}

async function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    track("chat_opened");
    await nextTick();
    inputEl.value?.focus();
  }
}

onMounted(() => {
  // A restored conversation (from a refresh) means a question already went out — resume
  // listening for Iyed's reply instead of waiting for the visitor to send a new message.
  if (messages.value.length > 0) {
    armHumanReplyPolling();
  }
});
onUnmounted(stopHumanReplyPolling);

async function ask(question) {
  track("suggestion_clicked");
  draft.value = question;
  await send();
}

async function send() {
  const content = draft.value.trim();
  if (!content || isLoading.value) return;

  track("chat_message_sent");
  messages.value.push({ role: "user", content });
  draft.value = "";
  error.value = "";
  isLoading.value = true;
  scrollToBottom();

  try {
    const res = await fetch(AGENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages.value.slice(-12), sessionId }),
    });

    if (!res.ok) throw new Error("bad-status");

    const data = await res.json();
    messages.value.push({ role: "assistant", content: data.reply });
    armHumanReplyPolling();
  } catch {
    error.value = "Couldn't reach the agent right now — email iyed.elghodhben@gmail.com directly.";
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
}

async function submitLead() {
  const email = leadEmail.value.trim();
  if (!email || leadStatus.value === "sending") return;

  leadStatus.value = "sending";

  try {
    const res = await fetch(`${AGENT_ENDPOINT}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, messages: messages.value.slice(-12) }),
    });

    if (!res.ok) throw new Error("bad-status");
    leadStatus.value = "sent";
    track("lead_submitted");
  } catch {
    leadStatus.value = "error";
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

    <div
      v-if="isOpen"
      id="career-agent-panel"
      class="agent-panel"
      role="dialog"
      aria-label="AI career agent chat"
      @keydown.esc="isOpen = false"
    >
      <header class="agent-header">
        <p class="eyebrow">AI Career Agent</p>
        <h3>Ask about Iyed's work</h3>
      </header>

      <div ref="messagesEl" class="agent-messages">
        <p v-if="messages.length === 0" class="agent-intro">
          I know Iyed's experience, projects, and skills in detail — ask me anything a resume can't answer quickly.
        </p>
        <div v-for="(m, i) in messages" :key="i" class="agent-message" :class="m.role">
          <span v-if="m.role === 'human'" class="agent-human-badge">Iyed, personally</span>
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

      <div v-if="showLeadPrompt" class="agent-lead">
        <p>Want me to notify Iyed you're interested? Drop your email and I'll pass it along.</p>
        <form class="agent-lead-form" @submit.prevent="submitLead">
          <input
            v-model="leadEmail"
            type="email"
            required
            placeholder="you@company.com"
            :disabled="leadStatus === 'sending'"
          />
          <button class="btn btn-primary" type="submit" :disabled="leadStatus === 'sending' || !leadEmail.trim()">
            Notify Iyed
          </button>
        </form>
        <div class="agent-lead-footer">
          <p v-if="leadStatus === 'error'" class="agent-error">Couldn't send that — try again, or email him directly.</p>
          <button type="button" class="agent-lead-dismiss" @click="leadDismissed = true">No thanks</button>
        </div>
      </div>
      <p v-else-if="leadStatus === 'sent'" class="agent-lead-success">✓ Done — Iyed will reach out to you directly.</p>

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

.agent-message.human p {
  background: var(--green-tint);
  border: 1px solid var(--green-600);
  color: var(--ink);
}

.agent-human-badge {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  color: var(--green-600);
  margin-bottom: 3px;
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

.agent-lead {
  padding: 12px 18px;
  border-top: 1px solid var(--rule);
  background: var(--green-tint);
}

.agent-lead p {
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.agent-lead-form {
  display: flex;
  gap: 8px;
}

.agent-lead-form input {
  flex: 1;
  min-width: 0;
  font-family: var(--font-body);
  font-size: 0.88rem;
  padding: 8px 10px;
  border: 1px solid var(--rule-strong);
  border-radius: var(--radius);
  background: var(--paper-raised);
  color: var(--ink);
}

.agent-lead-form input:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 1px;
}

.agent-lead-form .btn {
  padding: 8px 14px;
  font-size: 0.78rem;
}

.agent-lead-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.agent-lead-dismiss {
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--ink-faint);
  cursor: pointer;
  text-decoration: underline;
  margin-left: auto;
}

.agent-lead-success {
  margin: 0;
  padding: 10px 18px;
  font-size: 0.85rem;
  color: var(--green-600);
  font-family: var(--font-mono);
  border-top: 1px solid var(--rule);
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
