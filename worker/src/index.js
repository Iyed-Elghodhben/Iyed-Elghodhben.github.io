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

// Telegram returns 200 with a JSON body even on failure ({ok:false, description:"..."}), so a
// plain try/catch around the fetch was silently discarding real errors (blocked bot, bad chat
// id, malformed payload, etc). Record the last failure in KV so it's inspectable via /debug
// instead of vanishing — this is diagnostic-only, not used anywhere in the actual reply flow.
async function callTelegramApi(env, method, payload) {
  if (!env.TELEGRAM_BOT_TOKEN) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (data && data.ok === false) {
      await env.AGENT_CACHE.put(
        "last-telegram-error",
        JSON.stringify({ method, status: res.status, description: data.description, ts: Date.now() }),
      );
    }
    return data;
  } catch (err) {
    await env.AGENT_CACHE.put(
      "last-telegram-error",
      JSON.stringify({ method, exception: String(err?.message || err), ts: Date.now() }),
    );
    return null;
  }
}

// Returns the sent message (so its id can be tracked, e.g. for a force-reply prompt), or null
// if sending failed/isn't configured. Best-effort — never fails the visitor's request over it.
async function sendTelegram(env, text, extra) {
  if (!env.TELEGRAM_CHAT_ID) return null;
  const data = await callTelegramApi(env, "sendMessage", {
    chat_id: env.TELEGRAM_CHAT_ID,
    text: text.slice(0, 4000),
    ...extra,
  });
  return data?.result ?? null;
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

// How long a "someone just asked a question" marker lives, so the webhook can tell a typo'd
// session code from a real-but-expired one when Iyed replies.
const SESSION_SEEN_TTL = 60 * 30; // 30 min — generous for how long a visitor might stay on the page

async function notifyTelegramOfQuestion(env, question, reply, origin, fromCache, ip, sessionId) {
  const network = formatNetwork(await lookupNetwork(ip));
  const text =
    `🔔 New question on your AI career agent (${origin})${fromCache ? " [cached]" : ""}` +
    (network ? `\n🌐 ${network}` : "") +
    `\n\n` +
    `Q: ${question}\n\n` +
    `A: ${reply}`;

  const replyMarkup = sessionId
    ? { reply_markup: { inline_keyboard: [[{ text: "↩️ Reply to this visitor", callback_data: `reply:${sessionId}` }]] } }
    : undefined;

  await sendTelegram(env, text, replyMarkup);
  if (sessionId) {
    await env.AGENT_CACHE.put(`session-seen:${sessionId}`, "1", { expirationTtl: SESSION_SEEN_TTL });
  }
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

// Fallback for typing the command directly: "/reply <sessionId> <message text>".
const REPLY_COMMAND_PATTERN = /^\/reply\s+(\S+)\s+([\s\S]+)$/;
const CALLBACK_DATA_PATTERN = /^reply:(\S+)$/;
const HUMAN_REPLY_TTL = 60 * 10;
const FORCE_REPLY_TTL = 60 * 10; // plenty of time to type a reply after tapping the button

async function deliverHumanReply(env, sessionId, replyText) {
  const seen = await env.AGENT_CACHE.get(`session-seen:${sessionId}`);
  if (seen) {
    await env.AGENT_CACHE.put(`humanreply:${sessionId}`, replyText, { expirationTtl: HUMAN_REPLY_TTL });
    await sendTelegram(env, "✅ Sent — if they're still on the page, it'll show up in their chat.");
  } else {
    await sendTelegram(env, `⌛ Don't recognize session "${sessionId}" — too long since that question, or it's a typo.`);
  }
}

// Tapping "↩️ Reply to this visitor" sends this callback, which prompts Iyed with a
// force-reply message — Telegram then shows a text box and, once he types normally and
// sends, automatically links that message back to this prompt via reply_to_message. No
// command syntax needed on his end.
async function handleTelegramCallback(env, callbackQuery) {
  const match = CALLBACK_DATA_PATTERN.exec(String(callbackQuery?.data ?? ""));
  if (match) {
    const sessionId = match[1];
    const seen = await env.AGENT_CACHE.get(`session-seen:${sessionId}`);
    if (seen) {
      const sent = await sendTelegram(env, `Type your reply for session ${sessionId}:`, {
        reply_markup: { force_reply: true, selective: true },
      });
      if (sent?.message_id) {
        await env.AGENT_CACHE.put(`tgforce:${sent.message_id}`, sessionId, { expirationTtl: FORCE_REPLY_TTL });
      }
    } else {
      await sendTelegram(env, `⌛ Session ${sessionId} has expired — the visitor's probably gone.`);
    }
  }
  await callTelegramApi(env, "answerCallbackQuery", { callback_query_id: callbackQuery.id });
}

// Telegram calls this directly (no Origin header, no CORS relevance) once a webhook is
// registered via setWebhook with a secret_token — verified below instead of the origin
// allowlist used by everything else.
async function handleTelegramWebhook(request, env) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (!env.TELEGRAM_WEBHOOK_SECRET || secret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response("ok", { status: 200 }); // ack anyway — malformed updates aren't Telegram's problem to retry
  }

  if (update?.callback_query) {
    await handleTelegramCallback(env, update.callback_query);
    return new Response("ok", { status: 200 });
  }

  const message = update?.message;
  const text = typeof message?.text === "string" ? message.text.trim() : "";

  const promptId = message?.reply_to_message?.message_id;
  if (promptId && text) {
    const sessionId = await env.AGENT_CACHE.get(`tgforce:${promptId}`);
    if (sessionId) {
      await deliverHumanReply(env, sessionId, text);
      return new Response("ok", { status: 200 });
    }
  }

  const match = REPLY_COMMAND_PATTERN.exec(text);
  if (match) {
    await deliverHumanReply(env, match[1], match[2].trim());
  }

  return new Response("ok", { status: 200 });
}

// Polled by the widget after it gets an AI answer, to pick up a direct reply Iyed sent via
// Telegram. Still origin-restricted like everything else below, but deliberately skips the
// shared per-IP rate limiter — it's a cheap KV read with no model cost behind it, and polling
// every few seconds would otherwise burn through the budget meant for the expensive chat
// endpoint. The session code is short enough for Iyed to type by hand, which also means it's
// guessable in principle — the worst case is seeing a reply meant for a different visitor,
// not a real security exposure, so that tradeoff is fine here.
async function handleReplyCheck(request, env, headers) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, headers);
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : "";
  if (!sessionId) return json({ reply: null }, 200, headers);

  const key = `humanreply:${sessionId}`;
  const reply = await env.AGENT_CACHE.get(key);
  if (reply) {
    await env.AGENT_CACHE.delete(key); // deliver once
  }

  return json({ reply: reply || null }, 200, headers);
}

// Disabled — was used to track down the TELEGRAM_BOT_TOKEN mismatch that silently broke
// notifications. Reads back whatever callTelegramApi last recorded as a failure. Uncomment
// this and its route below (search "/debug") if Telegram delivery breaks again.
// async function handleDebug(request, env, headers) {
//   const url = new URL(request.url);
//   const token = url.searchParams.get("token");
//
//   if (!env.DEBUG_TOKEN || token !== env.DEBUG_TOKEN) {
//     return json({ error: "Unauthorized" }, 401, headers);
//   }
//
//   const lastError = await env.AGENT_CACHE.get("last-telegram-error");
//   return json({ lastTelegramError: lastError ? JSON.parse(lastError) : null }, 200, headers);
// }

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

    if (url.pathname === "/telegram-webhook") {
      return handleTelegramWebhook(request, env);
    }

    // /stats is opened directly in a browser (no Origin header, no CORS relevance) and is
    // protected by a token instead of the origin allowlist used by everything else below.
    if (url.pathname === "/stats") {
      if (request.method !== "GET") {
        return json({ error: "Method not allowed" }, 405, headers);
      }
      return handleStats(request, env, headers);
    }

    // if (url.pathname === "/debug") {
    //   if (request.method !== "GET") {
    //     return json({ error: "Method not allowed" }, 405, headers);
    //   }
    //   return handleDebug(request, env, headers);
    // }

    if (!allowedOrigin) {
      return json({ error: "Origin not allowed" }, 403, headers);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, headers);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    if (url.pathname === "/reply-check") {
      return handleReplyCheck(request, env, headers);
    }

    const { success: withinLimit } = await env.RATE_LIMITER.limit({ key: ip });
    if (!withinLimit) {
      // /lead and /track aren't conversational, so a plain rejection is fine there. The main
      // chat endpoint is different: rather than leave the visitor stuck on an error, skip the
      // (costly) model call but still notify Iyed with the same tap-to-reply button, and hand
      // the visitor a reply that keeps the widget listening for him instead of a dead end.
      if (url.pathname === "/lead" || url.pathname === "/track") {
        return json(
          { error: "Too many requests — please wait a moment before asking again." },
          429,
          headers,
        );
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400, headers);
      }

      const incoming = Array.isArray(body.messages) ? body.messages : [];
      const messages = incoming.slice(-MAX_TURNS);
      const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : null;
      const latestQuestion = [...messages].reverse().find((m) => m.role !== "assistant")?.content || "";
      const reply =
        "You're asking a lot of questions at once — I'm pausing for a moment, but Iyed might jump in personally if he's around.";

      ctx.waitUntil(
        notifyTelegramOfQuestion(env, latestQuestion, "[rate limited — visitor is waiting for a human reply]", allowedOrigin, false, ip, sessionId),
      );

      return json({ reply }, 200, headers);
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
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : null;

    if (messages.length === 0) {
      return json({ error: "No messages provided" }, 400, headers);
    }

    // Iberis project details (stack, features, how things work) are confidential under an
    // NDA, and the system prompt alone doesn't reliably hold under a jailbreak (confirmed by
    // direct testing). So don't let the model anywhere near the topic when it's actually being
    // asked about — but check only the question just asked, not the whole history: scanning
    // every past message meant one Iberis mention permanently locked the rest of the
    // conversation onto this canned reply, even after the visitor explicitly moved on to
    // another topic. The system prompt's own Iberis rule plus the output-side leak filter
    // below remain as backstops for indirect follow-ups that dodge the keyword check.
    const latestQuestion = [...messages].reverse().find((m) => m.role !== "assistant")?.content || "";
    const touchesIberis = IBERIS_TOPIC_PATTERN.test(latestQuestion);
    if (touchesIberis) {
      const reply = buildIberisDeflection();
      ctx.waitUntil(notifyTelegramOfQuestion(env, latestQuestion, reply, allowedOrigin, false, ip, sessionId));
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

    ctx.waitUntil(notifyTelegramOfQuestion(env, latestQuestion, reply, allowedOrigin, fromCache, ip, sessionId));

    return json({ reply }, 200, headers);
  },
};
