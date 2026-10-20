const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const touch = matchMedia("(hover: none)");
const instances = new Set();
let savedPause = {};
try {
  savedPause = JSON.parse(sessionStorage.getItem("mm-gallery-pauses") || "{}");
} catch {}
const manualPause = new Map(Object.entries(savedPause || {}));
const rememberPause = (id, paused) => {
  manualPause.set(id, paused);
  try {
    sessionStorage.setItem(
      "mm-gallery-pauses",
      JSON.stringify(Object.fromEntries(manualPause)),
    );
  } catch {}
};
let active = null;
export function initGalleries(root = document) {
  for (const node of root.querySelectorAll("[data-gallery]")) {
    if (node.dataset.initialized) continue;
    node.dataset.initialized = "true";
    const imgs = [...node.querySelectorAll(".gallery-images img")],
      dots = [...node.querySelectorAll("[data-slide]")],
      play = node.querySelector(".gallery-play");
    const id = node.dataset.gallery;
    const state = {
      node,
      index: 0,
      timer: null,
      hover: false,
      visible: false,
      ratio: 0,
      explicit: false,
      paused: manualPause.get(id) || false,
    };
    const show = (n) => {
      state.index = (n + imgs.length) % imgs.length;
      imgs.forEach((img, i) => {
        img.classList.toggle("active", i === state.index);
        img.setAttribute("aria-hidden", String(i !== state.index));
      });
      dots.forEach((dot, i) =>
        dot.setAttribute("aria-pressed", String(i === state.index)),
      );
      node.querySelector(".slide-count").textContent =
        `${state.index + 1} / ${imgs.length}`;
      node.dataset.slide = state.index;
    };
    const stop = () => {
      clearInterval(state.timer);
      state.timer = null;
      play.innerHTML = "▶ <span>Play</span>";
      play.setAttribute("aria-label", "Play slideshow");
      node.dataset.playing = "false";
    };
    const start = () => {
      if (
        !node.isConnected ||
        document.hidden ||
        !state.visible ||
        state.paused ||
        reduced.matches ||
        node.closest("dialog:not([open])")
      ) {
        stop();
        return;
      }
      if (active && active !== state) active.stop();
      active = state;
      if (state.timer) return;
      state.timer = setInterval(() => {
        if (!node.isConnected) {
          stop();
          instances.delete(state);
        } else show(state.index + 1);
      }, 2000);
      play.innerHTML = "Ⅱ <span>Pause</span>";
      play.setAttribute("aria-label", "Pause slideshow");
      node.dataset.playing = "true";
    };
    const manual = (n) => {
      state.paused = true;
      rememberPause(id, true);
      stop();
      show(n);
    };
    Object.assign(state, { start, stop, show });
    instances.add(state);
    show(0);
    stop();
    node.addEventListener("pointerenter", (ev) => {
      if (ev.pointerType !== "touch") {
        state.hover = true;
        if (!state.paused) start();
      }
    });
    node.addEventListener("pointerleave", () => {
      state.hover = false;
      if (!touch.matches) stop();
    });
    play.addEventListener("click", () => {
      state.paused = Boolean(state.timer);
      rememberPause(id, state.paused);
      state.explicit = !state.paused;
      if (state.paused) stop();
      else if (reduced.matches) show(state.index + 1);
      else start();
    });
    node
      .querySelector(".gallery-prev")
      .addEventListener("click", () => manual(state.index - 1));
    node
      .querySelector(".gallery-next")
      .addEventListener("click", () => manual(state.index + 1));
    dots.forEach((dot) =>
      dot.addEventListener("click", () => manual(Number(dot.dataset.slide))),
    );
    node.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
        ev.preventDefault();
        ev.stopPropagation();
        manual(state.index + (ev.key === "ArrowRight" ? 1 : -1));
      }
    });
    let startX = 0,
      startY = 0;
    node.addEventListener(
      "touchstart",
      (ev) => {
        startX = ev.touches[0].clientX;
        startY = ev.touches[0].clientY;
      },
      { passive: true },
    );
    node.addEventListener(
      "touchend",
      (ev) => {
        const dx = ev.changedTouches[0].clientX - startX,
          dy = ev.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          ev.stopPropagation();
          manual(state.index + (dx < 0 ? 1 : -1));
        }
      },
      { passive: true },
    );
    const observer = new IntersectionObserver(
      (entries) => {
        state.ratio = entries[0].intersectionRatio;
        state.visible = state.ratio >= 0.6;
        if (!state.visible) stop();
        else if (touch.matches) {
          const best = [...instances]
            .filter(
              (s) =>
                s.visible &&
                s.node.isConnected &&
                !s.node.closest("dialog:not([open])"),
            )
            .sort((a, b) => b.ratio - a.ratio)[0];
          if (best === state && !state.paused) start();
        } else if (state.hover || state.explicit) start();
        if (!node.isConnected) {
          observer.disconnect();
          stop();
          instances.delete(state);
        }
      },
      { threshold: [0, 0.3, 0.6, 0.8, 1] },
    );
    observer.observe(node);
  }
}
document.addEventListener("visibilitychange", () => {
  for (const s of instances) {
    if (document.hidden) s.stop();
    else if (s.visible && (s.hover || touch.matches || s.explicit)) s.start();
  }
});
reduced.addEventListener("change", () => {
  if (reduced.matches) for (const s of instances) s.stop();
});
export function stopGalleries() {
  for (const s of instances) s.stop();
}
export function initRails(root = document) {
  for (const rail of root.querySelectorAll("[data-rail]")) {
    if (rail.dataset.initialized) continue;
    rail.dataset.initialized = "true";
    const scope = rail.closest("[data-rail-scope]") || rail.parentElement;
    const prev = scope.querySelector("[data-rail-prev]"),
      next = scope.querySelector("[data-rail-next]");
    const move = (direction) =>
      rail.scrollBy({
        left:
          direction *
          (rail.firstElementChild?.getBoundingClientRect().width + 24 ||
            rail.clientWidth),
        behavior: reduced.matches ? "instant" : "smooth",
      });
    prev?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));
    const update = () => {
      if (prev) prev.disabled = rail.scrollLeft < 5;
      if (next)
        next.disabled =
          rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 5;
    };
    rail.addEventListener("scroll", update, { passive: true });
    new ResizeObserver(update).observe(rail);
    update();
    rail.addEventListener("keydown", (ev) => {
      if (ev.target === rail && ["ArrowLeft", "ArrowRight"].includes(ev.key)) {
        ev.preventDefault();
        move(ev.key === "ArrowRight" ? 1 : -1);
      }
    });
  }
}
