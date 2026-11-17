export const AGENT_ENDPOINT = "https://iyed-career-agent.iyed-elghodhben.workers.dev";

export function track(event) {
  fetch(`${AGENT_ENDPOINT}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
  }).catch(() => {});
}

// Fires once per browser tab (sessionStorage survives reloads/navigation within the tab but
// not a fresh tab/incognito window), so a visitor clicking around the site doesn't trigger a
// notification per page interaction — the worker also dedupes by IP as a backstop.
const VISIT_FLAG = "portfolio-visit-notified";

export function notifyVisit() {
  if (sessionStorage.getItem(VISIT_FLAG)) return;
  sessionStorage.setItem(VISIT_FLAG, "1");

  fetch(`${AGENT_ENDPOINT}/visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      referrer: document.referrer,
      path: location.pathname,
    }),
  }).catch(() => {});
}
