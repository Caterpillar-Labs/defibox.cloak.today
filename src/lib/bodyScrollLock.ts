// src/lib/bodyScrollLock.ts
const SCROLL_LOCK_CLASS = "is-scroll-locked";

type BodyScrollLockSnapshot = {
  scrollY: number;
  htmlOverflow: string;
  bodyOverflow: string;
};

let lockCount = 0;
let snapshot: BodyScrollLockSnapshot | null = null;

export function lockBodyScroll(): void {
  if (typeof document === "undefined") return;

  if (lockCount === 0) {
    const html = document.documentElement;
    const body = document.body;

    snapshot = {
      scrollY: window.scrollY,
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
    };

    html.classList.add(SCROLL_LOCK_CLASS);
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
  }

  lockCount += 1;
}

export function unlockBodyScroll(): void {
  if (lockCount === 0) return;

  lockCount -= 1;
  if (lockCount > 0 || !snapshot) return;

  const html = document.documentElement;
  const body = document.body;
  const { scrollY } = snapshot;

  html.classList.remove(SCROLL_LOCK_CLASS);
  html.style.overflow = snapshot.htmlOverflow;
  body.style.overflow = snapshot.bodyOverflow;

  window.scrollTo(0, scrollY);
  snapshot = null;
}
