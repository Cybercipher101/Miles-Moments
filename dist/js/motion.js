// Small, one-time reveals. Scrolling and anchor navigation remain native.
export function initMotion() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const targets = [...document.querySelectorAll("[data-reveal]")];
  let observer;
  function sync() {
    observer?.disconnect();
    if (reduced.matches || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.remove("reveal-pending"));
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          target.classList.remove("reveal-pending");
          target.classList.add("reveal-complete");
          observer.unobserve(target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    targets.forEach((el) => {
      // Never hide a section which is already on screen or contains focus.
      if (
        el.getBoundingClientRect().top < innerHeight ||
        el.classList.contains("reveal-complete")
      )
        return;
      el.classList.add("reveal-pending");
      observer.observe(el);
    });
  }
  sync();
  reduced.addEventListener("change", sync);
  document.addEventListener("focusin", (event) => {
    const section = event.target.closest(".reveal-pending");
    if (section) {
      section.classList.remove("reveal-pending");
      section.classList.add("reveal-complete");
      observer?.unobserve(section);
    }
  });
  const links = [...document.querySelectorAll(".chapter-stop")];
  if (links.length && "IntersectionObserver" in window) {
    const chapters = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const link of links) {
            if (link.hash === `#${entry.target.id}`)
              link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          }
        }
      },
      { rootMargin: "-15% 0px -45% 0px" },
    );
    links.forEach((link) => {
      const section = document.querySelector(link.hash);
      if (section) chapters.observe(section);
    });
  }
}
