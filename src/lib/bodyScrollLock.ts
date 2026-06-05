// src/lib/bodyScrollLock.ts
type BodyScrollLockSnapshot = {
  scrollY: number;
  htmlOverflow: string;
  bodyOverflow: string;
  bodyPaddingRight: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
};

let lockCount = 0;
let snapshot: BodyScrollLockSnapshot | null = null;

function measureScrollbarWidthFromElement(): number {
  const outer = document.createElement("div");
  outer.style.cssText =
    "visibility:hidden;overflow:scroll;width:100px;height:100px;position:absolute;top:-9999px;pointer-events:none";
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  inner.style.width = "100%";
  outer.appendChild(inner);

  const width = outer.offsetWidth - inner.offsetWidth;
  outer.remove();
  return Math.max(0, width);
}

function getScrollbarWidth(): number {
  const fromViewport = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  if (fromViewport > 0) return fromViewport;

  const canScroll = document.documentElement.scrollHeight > document.documentElement.clientHeight;
  return canScroll ? measureScrollbarWidthFromElement() : 0;
}

export function lockBodyScroll(): void {
  if (typeof document === "undefined") return;

  if (lockCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarWidth = getScrollbarWidth();

    snapshot = {
      scrollY,
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "auto";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
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

  html.style.overflow = snapshot.htmlOverflow;
  body.style.overflow = snapshot.bodyOverflow;
  body.style.paddingRight = snapshot.bodyPaddingRight;
  body.style.position = snapshot.bodyPosition;
  body.style.top = snapshot.bodyTop;
  body.style.left = snapshot.bodyLeft;
  body.style.right = snapshot.bodyRight;
  body.style.width = snapshot.bodyWidth;

  window.scrollTo(0, scrollY);
  snapshot = null;
}
