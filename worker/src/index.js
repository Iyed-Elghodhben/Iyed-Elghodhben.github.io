import {
  buildSystemPrompt,
  containsIberisStackLeak,
  IBERIS_TOPIC_PATTERN,
  buildIberisDeflection,
} from "./systemPrompt.js";

const IBERIS_LEAK_FALLBACK =
  "I can't get into Iberis's internal tech stack — that's confidential, regardless of how the question is framed. " +
  "I can tell you what was built and the business outcome instead, or you can ask about NetAdvisor or AMA Business Tunisie/STB Bus in full technical detail.";

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

// Best-effort, free IP→network lookup. Reveals the visitor's company only when they're on
// a corporate network/VPN — for most home/mobile visitors this just shows their ISP, which
// is still a useful "nothing to see here" signal but not a real identification method.
async function lookupNetwork(ip) {
  if (!ip || ip === "unknown") return null;
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city,isp,org`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.status === "success" ? data : null;
  } catch {
    return null;
  }
}

function formatNetwork(info) {
  if (!info) return "";
  const org = info.org && info.org !== info.isp ? `${info.org} (${info.isp})` : info.isp;
  const place = [info.city, info.country].filter(Boolean).join(", ");
  return [org, place].filter(Boolean).join(" · ");
}

async function notifyTelegramOfQuestion(env, question, reply, origin, fromCache, ip) {
  const network = formatNetwork(await lookupNetwork(ip));
  const text =
    `🔔 New question on your AI career agent (${origin})${fromCache ? " [cached]" : ""}` +
    (network ? `\n🌐 ${network}` : "") +
    `\n\n` +
    `Q: ${question}\n\n` +
    `A: ${reply}`;
  await sendTelegram(env, text);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Domains that tell us nothing about the visitor's employer.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.fr",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "protonmail.com",
  "proton.me",
  "aol.com",
  "gmx.com",
  "yandex.com",
  "mail.com",
  "zoho.com",
]);

function emailDomain(email) {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).toLowerCase();
}

async function handleLead(request, env, ctx, headers, ip) {
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

  const domain = emailDomain(email);
  const companyHint = domain && !FREE_EMAIL_DOMAINS.has(domain) ? `\n🏢 Likely company: ${domain}` : "";
  const network = formatNetwork(await lookupNetwork(ip));

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const transcript = incoming
    .slice(-MAX_TURNS)
    .map((m) => `${m.role === "assistant" ? "Agent" : "Visitor"}: ${String(m.content ?? "").slice(0, MAX_MESSAGE_LENGTH)}`)
    .join("\n");

  const text =
    `📩 Lead captured on your AI career agent!\n\n` +
    `Email: ${email}` +
    companyHint +
    (network ? `\n🌐 ${network}` : "") +
    (transcript ? `\n\nConversation so far:\n${transcript}` : "");

  ctx.waitUntil(sendTelegram(env, text));

  return json({ ok: true }, 200, headers);
}

const TRACK_EVENTS = new Set([
  "chat_opened",
  "chat_message_sent",
  "suggestion_clicked",
  "lead_submitted",
  "section_about",
  "section_work",
  "section_skills",
  "section_experience",
  "section_contact",
]);

async function incrementCounter(env, event) {
  const today = new Date().toISOString().slice(0, 10);
  const totalKey = `analytics:total:${event}`;
  const dailyKey = `analytics:daily:${event}:${today}`;

  const [totalRaw, dailyRaw] = await Promise.all([env.AGENT_CACHE.get(totalKey), env.AGENT_CACHE.get(dailyKey)]);

  await Promise.all([
    env.AGENT_CACHE.put(totalKey, String((parseInt(totalRaw, 10) || 0) + 1)),
    env.AGENT_CACHE.put(dailyKey, String((parseInt(dailyRaw, 10) || 0) + 1), {
      expirationTtl: 60 * 60 * 24 * 90,
    }),
  ]);
}

async function handleTrack(request, env, ctx, headers) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, headers);
  }

  const event = String(body.event ?? "");
  if (!TRACK_EVENTS.has(event)) {
    return json({ error: "Unknown event" }, 400, headers);
  }

  ctx.waitUntil(incrementCounter(env, event));

  return json({ ok: true }, 200, headers);
}

async function handleStats(request, env, headers) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!env.STATS_TOKEN || token !== env.STATS_TOKEN) {
    return json({ error: "Unauthorized" }, 401, headers);
  }

  const totals = {};
  const list = await env.AGENT_CACHE.list({ prefix: "analytics:total:" });
  await Promise.all(
    list.keys.map(async (k) => {
      const event = k.name.slice("analytics:total:".length);
      totals[event] = parseInt(await env.AGENT_CACHE.get(k.name), 10) || 0;
    }),
  );

  return json({ totals }, 200, headers);
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";
    const headers = corsHeaders(allowedOrigin || "null");
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    // /stats is opened directly in a browser (no Origin header, no CORS relevance) and is
    // protected by a token instead of the origin allowlist used by everything else below.
    if (url.pathname === "/stats") {
      if (request.method !== "GET") {
        return json({ error: "Method not allowed" }, 405, headers);
      }
      return handleStats(request, env, headers);
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

    if (url.pathname === "/lead") {
      return handleLead(request, env, ctx, headers, ip);
    }

    if (url.pathname === "/track") {
      return handleTrack(request, env, ctx, headers);
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

    // Iberis project details (stack, features, how things work) are confidential under an
    // NDA, and the system prompt alone doesn't reliably hold under a jailbreak (confirmed by
    // direct testing). So don't let the model anywhere near the topic: if the conversation
    // touches Iberis or any of its named features, skip the model entirely and always return
    // the same fixed, safe answer — nothing left for a jailbreak to work on.
    const touchesIberis = messages.some((m) => IBERIS_TOPIC_PATTERN.test(String(m.content ?? "")));
    if (touchesIberis) {
      const reply = buildIberisDeflection();
      const latestQuestion = [...messages].reverse().find((m) => m.role !== "assistant")?.content || "";
      ctx.waitUntil(notifyTelegramOfQuestion(env, latestQuestion, reply, allowedOrigin, false, ip));
      return json({ reply }, 200, headers);
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

      // The system prompt tells the model never to discuss Iberis's internal stack, but small
      // models don't reliably hold that under a jailbreak ("ignore previous instructions",
      // claimed authority, yes/no framing, etc — confirmed by direct testing). Enforce it in
      // code instead of trusting the prompt alone, and cache the safe version, not the leak.
      if (containsIberisStackLeak(reply)) {
        reply = IBERIS_LEAK_FALLBACK;
      }

      if (cacheKey) {
        ctx.waitUntil(env.AGENT_CACHE.put(cacheKey, reply, { expirationTtl: 60 * 60 * 24 * 7 }));
      }
    } else if (containsIberisStackLeak(reply)) {
      // Guards against cache entries written before this filter existed.
      reply = IBERIS_LEAK_FALLBACK;
      if (cacheKey) {
        ctx.waitUntil(env.AGENT_CACHE.put(cacheKey, reply, { expirationTtl: 60 * 60 * 24 * 7 }));
      }
    }

    const latestQuestion = [...messages].reverse().find((m) => m.role !== "assistant")?.content || "";
    ctx.waitUntil(notifyTelegramOfQuestion(env, latestQuestion, reply, allowedOrigin, fromCache, ip));

    return json({ reply }, 200, headers);
  },
};
