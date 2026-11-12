import { track } from "../lib/analytics";

const observer =
  typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              track(entry.target.dataset.trackEvent);
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.3 }
      )
    : null;

export const trackView = {
  mounted(el, binding) {
    el.dataset.trackEvent = binding.value;
    if (observer) observer.observe(el);
  },
  unmounted(el) {
    if (observer) observer.unobserve(el);
  },
};
