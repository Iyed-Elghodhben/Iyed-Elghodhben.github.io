export const AGENT_ENDPOINT = "https://iyed-career-agent.iyed-elghodhben.workers.dev";

export function track(event) {
  fetch(`${AGENT_ENDPOINT}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
  }).catch(() => {});
}
