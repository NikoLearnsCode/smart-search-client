import {useCallback, useEffect, useRef} from 'react';
import {getSearchStatusMessage} from '@/components/search/searchA11y';

const STATUS_DEBOUNCE_MS = 700;
const RESULT_COUNT_DEBOUNCE_MS = 900;
const INPUT_IDLE_MS = 1200; // wait after last keystroke before status speaks

type UseSearchStatusAnnouncerArgs = {
  open: boolean;
  query: string;
  deferredQuery: string;
  loading: boolean;
  resultCount: number;
};

// Drives the debounced screen-reader status live region: waits for the query to
// settle and the user to go idle before speaking "N results"/"No results", then
// drops the text so arrowing back to the field doesn't re-read it.
export function useSearchStatusAnnouncer({
  open,
  query,
  deferredQuery,
  loading,
  resultCount,
}: UseSearchStatusAnnouncerArgs) {
  const statusLiveRef = useRef<HTMLDivElement>(null);
  const announcedStatusRef = useRef('');
  const lastSearchKeyAtRef = useRef(0);
  const statusClearTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const trimmedImmediate = query.trim();
  const trimmedDeferred = deferredQuery.trim();

  // Reset on close so reopening with the same query re-announces.
  useEffect(() => {
    if (open) return;
    announcedStatusRef.current = '';
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (trimmedImmediate !== trimmedDeferred) return;

    const debounceMs =
      trimmedDeferred.length > 0 && resultCount > 0
        ? RESULT_COUNT_DEBOUNCE_MS
        : STATUS_DEBOUNCE_MS;

    let timer: ReturnType<typeof setTimeout>;

    const publish = () => {
      const idle = Date.now() - lastSearchKeyAtRef.current;
      if (idle < INPUT_IDLE_MS) {
        timer = window.setTimeout(publish, INPUT_IDLE_MS - idle);
        return;
      }

      const el = statusLiveRef.current;
      if (!el) return;

      const imm = query.trim();
      const def = deferredQuery.trim();
      if (imm !== def) return;

      const msg = getSearchStatusMessage(def, imm, loading, resultCount);
      if (!msg) return;
      if (msg === announcedStatusRef.current) return;
      announcedStatusRef.current = msg;
      el.setAttribute('aria-live', 'polite');
      el.textContent = msg;

      // Drop text after speak so arrow-up back to the field doesn't re-read it.
      if (resultCount > 0) {
        if (statusClearTimerRef.current)
          clearTimeout(statusClearTimerRef.current);
        statusClearTimerRef.current = window.setTimeout(() => {
          if (el.textContent !== msg) return;
          el.setAttribute('aria-live', 'off');
          el.textContent = '';
        }, 500);
      }
    };

    timer = window.setTimeout(publish, debounceMs);
    return () => {
      window.clearTimeout(timer);
      if (statusClearTimerRef.current)
        clearTimeout(statusClearTimerRef.current);
    };
  }, [
    open,
    trimmedDeferred,
    trimmedImmediate,
    loading,
    resultCount,
    query,
    deferredQuery, 
  ]);

  // Call on each keystroke so the idle timer can hold the announcement back.
  const markActivity = useCallback(() => {
    lastSearchKeyAtRef.current = Date.now();
  }, []);

  return {statusLiveRef, markActivity};
}
