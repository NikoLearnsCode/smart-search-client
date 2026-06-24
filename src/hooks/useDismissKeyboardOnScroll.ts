import {useEffect, type RefObject} from 'react';

// On touch devices, blur the focused input on any drag gesture inside the modal
// to hide the virtual keyboard and prevent layout shifts. Listening on the
// whole container means dragging from the input itself is also caught.
// No-op on desktop, where touchmove never fires.
export function useDismissKeyboardOnScroll(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  useEffect(() => {
    if (!active) return;
    const el = containerRef.current;
    if (!el) return;

    const dismissKeyboard = () => {
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && focused !== el) {
        focused.blur();
      }
    };

    el.addEventListener('touchmove', dismissKeyboard, {passive: true});
    return () => {
      el.removeEventListener('touchmove', dismissKeyboard);
    };
  }, [containerRef, active]);
}
