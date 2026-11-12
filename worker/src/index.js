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

async function sha256(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sendTelegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;

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

async function notifyTelegramOfQuestion(env, question, reply, origin, fromCache) {
  const text =
    `🔔 New question on your AI career agent (${origin})${fromCache ? " [cached]" : ""}\n\n` +
    `Q: ${question}\n\n` +
    `A: ${reply}`;
  await sendTelegram(env, text);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleLead(request, env, ctx, headers) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, headers);
  }

  const email = String(body.email ?? "").trim();
  if (!EMAIL_PATTERN.test(email)) {
    return json({ error: "Invalid email" }, 400, headers);
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const transcript = incoming
    .slice(-MAX_TURNS)
    .map((m) => `${m.role === "assistant" ? "Agent" : "Visitor"}: ${String(m.content ?? "").slice(0, MAX_MESSAGE_LENGTH)}`)
    .join("\n");

  const text =
    `📩 Lead captured on your AI career agent!\n\n` +
    `Email: ${email}` +
    (transcript ? `\n\nConversation so far:\n${transcript}` : "");

  ctx.waitUntil(sendTelegram(env, text));

  return json({ ok: true }, 200, headers);
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

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const { success: withinLimit } = await env.RATE_LIMITER.limit({ key: ip });
    if (!withinLimit) {
      return json(
        { error: "Too many requests — please wait a moment before asking again." },
        429,
        headers,
      );
    }

    const url = new URL(request.url);
    if (url.pathname === "/lead") {
      return handleLead(request, env, ctx, headers);
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

    const systemPrompt = buildSystemPrompt();

    // Only cache single-turn conversations — once there's back-and-forth, the question
    // alone no longer determines the answer. The system prompt is folded into the key so
    // edits to content.js naturally invalidate stale cache entries.
    const isFirstTurn = messages.length === 1 && messages[0].role !== "assistant";
    const normalizedQuestion = isFirstTurn ? String(messages[0].content ?? "").trim().toLowerCase() : "";
    const cacheKey = isFirstTurn ? await sha256(`${systemPrompt}|${normalizedQuestion}`) : null;

    let reply = cacheKey ? await env.AGENT_CACHE.get(cacheKey) : null;
    const fromCache = Boolean(reply);

    if (!reply) {
      const aiMessages = [
        { role: "system", content: systemPrompt },
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

      reply =
        (typeof result?.response === "string" ? result.response.trim() : "") ||
        "Sorry, I couldn't come up with an answer to that — try rephrasing, or reach out directly.";

      if (cacheKey) {
        ctx.waitUntil(env.AGENT_CACHE.put(cacheKey, reply, { expirationTtl: 60 * 60 * 24 * 7 }));
      }
    }

    const latestQuestion = [...messages].reverse().find((m) => m.role !== "assistant")?.content || "";
    ctx.waitUntil(notifyTelegramOfQuestion(env, latestQuestion, reply, allowedOrigin, fromCache));

    return json({ reply }, 200, headers);
  },
};
