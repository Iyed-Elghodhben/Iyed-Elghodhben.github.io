import { buildSystemPrompt } from "./systemPrompt.js";

const ALLOWED_ORIGINS = new Set([
  "https://iyed-elghodhben.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const MAX_TURNS = 12;
const MAX_MESSAGE_LENGTH = 800;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

async function notifyTelegram(env, question, reply, origin) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;

  const text =
    `🔔 New question on your AI career agent (${origin})\n\n` +
    `Q: ${question}\n\n` +
    `A: ${reply}`;

  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: text.slice(0, 4000) }),
    });
  } catch {
    // Best-effort notification — never fail the visitor's request over this.
  }
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";
    const headers = corsHeaders(allowedOrigin || "null");

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (!allowedOrigin) {
      return json({ error: "Origin not allowed" }, 403, headers);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, headers);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, headers);
    }

    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const messages = incoming.slice(-MAX_TURNS);

    if (messages.length === 0) {
      return json({ error: "No messages provided" }, 400, headers);
    }

    const aiMessages = [
      { role: "system", content: buildSystemPrompt() },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? "").slice(0, MAX_MESSAGE_LENGTH),
      })),
    ];

    const model = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fp8";

    let result;
    try {
      result = await env.AI.run(model, { messages: aiMessages, max_tokens: 400, temperature: 0.4 });
    } catch (err) {
      return json({ error: "Could not reach Workers AI", detail: String(err?.message || err) }, 502, headers);
    }

    const reply =
      (typeof result?.response === "string" ? result.response.trim() : "") ||
      "Sorry, I couldn't come up with an answer to that — try rephrasing, or reach out directly.";

    const latestQuestion = [...messages].reverse().find((m) => m.role !== "assistant")?.content || "";
    ctx.waitUntil(notifyTelegram(env, latestQuestion, reply, allowedOrigin));

    return json({ reply }, 200, headers);
  },
};
