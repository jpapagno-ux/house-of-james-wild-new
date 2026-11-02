// One page-scroll lock for every overlay (menu, search, dialogs). Scroll audit, 2 Nov 2026:
// the menu and the search panel each wrote document.body.style.overflow on their own, so
// closing one could unlock the page under the other, and the search panel never cleaned up
// when its page unmounted (a search result opened the next page still locked). A counter
// means the page unlocks only when the last overlay lets go, and every lock is released on
// unmount. The lock sits on <html>, the element that actually scrolls the page here
// (html carries overflow-x: clip, so body overflow does not reach the viewport).
let holders = 0;

export function lockScroll(): () => void {
  if (typeof document === "undefined") return () => {};
  if (holders++ === 0) {
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    if (gap > 0) document.documentElement.style.paddingRight = `${gap}px`;
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--holders <= 0) {
      holders = 0;
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    }
  };
}
