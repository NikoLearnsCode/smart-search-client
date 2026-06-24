import {useCallback, useEffect, useRef, useState} from 'react';
import {
  getSearchStatusMessage,
  needsOptionLiveAnnouncement,
  searchNoResultsLabel,
  searchOptionId,
  searchOptionLabel,
  updateOptionLiveRegion,
  SEARCH_DIALOG_ID,
  SEARCH_LISTBOX_ID,
  SEARCH_STATUS_ID,
  SEARCH_TITLE_ID,
} from './searchA11y';
import type {SearchResult} from '@/types/document';
import {useListKeyboardNav} from '@/hooks/useListKeyboardNav';
import {useSearchPointerHover} from '@/hooks/useSearchPointerHover';
import {useSearchStatusAnnouncer} from '@/hooks/useSearchStatusAnnouncer';
import {useDismissKeyboardOnScroll} from '@/hooks/useDismissKeyboardOnScroll';
import {useScrollLock} from '@/hooks/useScrollLock';
import {useSearchActions, useSearchState} from './SearchContext';
import {SearchModalHeader} from './SearchModalHeader';
import {SearchBody} from './SearchBody';
import {SearchFooter} from './SearchFooter';

type SearchModalProps = {
  onResultSelect?: (doc: SearchResult) => void;
};

export function SearchModal({onResultSelect}: SearchModalProps = {}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const optionLiveRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [linkFieldHints, setLinkFieldHints] = useState(true);

  const {inputRef, results, resetKey, loading, query, deferredQuery} =
    useSearchState();
  const trimmedDeferred = deferredQuery.trim();
  const trimmedImmediate = query.trim();

  const {setQuery} = useSearchActions();
  const {hoverAllowed, lockHover} = useSearchPointerHover(resetKey);
  const {statusLiveRef, markActivity} = useSearchStatusAnnouncer({
    open,
    query,
    deferredQuery,
    loading,
    resultCount: results.length,
  });

  useScrollLock(open);
  useDismissKeyboardOnScroll(dialogRef, open);

  const statusMessage = getSearchStatusMessage(
    trimmedDeferred,
    trimmedImmediate,
    loading,
    results.length,
  );

  // Sync React open state from dialog toggle/close events.
  // This means HTML (commandfor/command, showModal) is the source of truth.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleToggle = () => {
      if (dialog.open) setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
      setQuery('');
      setLinkFieldHints(true);
    };

    dialog.addEventListener('toggle', handleToggle);
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('toggle', handleToggle);
      dialog.removeEventListener('close', handleClose);
    };
  }, [setQuery]);

  // Cmd+K / Ctrl+K global shortcut - lives here where dialogRef is available.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (dialog.open) dialog.close();
        else dialog.showModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const markSearchInputActivity = useCallback(() => {
    markActivity();
    setLinkFieldHints(false);
  }, [markActivity]);

  const querySettled = trimmedImmediate === trimmedDeferred;

  const handleSelectIndex = useCallback(
    (index: number) => {
      const doc = results[index];
      if (!doc) return;
      onResultSelect?.(doc);
      dialogRef.current?.close();
    },
    [results, onResultSelect],
  );

  const optionLiveRegion = needsOptionLiveAnnouncement();

  const announceActiveOption = useCallback(
    (index: number) => {
      if (!optionLiveRegion) return;
      const el = optionLiveRef.current;
      if (!el) return;

      if (index < 0) {
        updateOptionLiveRegion(el, null);
        return;
      }

      const doc = results[index];
      if (!doc) return;
      updateOptionLiveRegion(
        el,
        searchOptionLabel(
          doc.name,
          doc.short_description,
          index,
          results.length,
        ),
      );
    },
    [optionLiveRegion, results],
  );

  const {selectedIndex, setSelectedIndex} = useListKeyboardNav(results.length, {
    enabled: open && results.length > 0,
    onSelect: handleSelectIndex,
    resetKey,
    onKeyboardNav: lockHover,
    onActiveOptionChange: announceActiveOption,
  });

  const listboxVisible = results.length > 0;
  const statusVisible = statusMessage.length > 0;
  const ariaExpanded = open && (listboxVisible || statusVisible);
  const ariaControls = listboxVisible
    ? SEARCH_LISTBOX_ID
    : statusVisible
      ? SEARCH_STATUS_ID
      : undefined;
  const activeDescendantId =
    !optionLiveRegion && listboxVisible && selectedIndex >= 0
      ? searchOptionId(selectedIndex)
      : undefined;

  useEffect(() => {
    if (!open) return;
    lockHover();
    inputRef.current?.focus();
  }, [open, inputRef, lockHover]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) dialogRef.current.close();
    },
    [],
  );

  // Derived from deferred query directly - independent of the debounced
  // screen-reader live region, so it updates the instant filtering settles.
  const showNoResultsVisual =
    trimmedDeferred.length > 0 && !loading && results.length === 0;

  return (
    <dialog
      ref={dialogRef}
      id={SEARCH_DIALOG_ID}
      tabIndex={-1}
      aria-labelledby={SEARCH_TITLE_ID}
      onClick={handleBackdropClick}
      className='search-modal'
    >
      <div
        className='search-modal-inner flex h-dvh w-full min-w-0 max-w-full flex-col overflow-hidden bg-secondary md:mx-auto md:max-h-[85vh] md:h-[800px] md:max-w-xl md:rounded-sm md:border md:border-white/10 md:shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <h1 id={SEARCH_TITLE_ID} className='sr-only'>
          Search movies
        </h1>
        <SearchModalHeader
          linkFieldHints={linkFieldHints}
          ariaExpanded={ariaExpanded}
          ariaControls={ariaControls}
          activeDescendantId={activeDescendantId}
          onSearchInputActivity={markSearchInputActivity}
        />
        <div
          ref={statusLiveRef}
          id={SEARCH_STATUS_ID}
          role='status'
          aria-live={querySettled ? 'polite' : 'off'}
          aria-atomic='true'
          className='sr-only'
        />
        <div
          ref={optionLiveRef}
          role='status'
          aria-live='assertive'
          aria-atomic='true'
          className='sr-only'
        />
        <div
          ref={scrollAreaRef}
          tabIndex={-1}
          className='min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-pt-4 scroll-pb-12'
        >
          {showNoResultsVisual ? (
            <p
              aria-hidden='true'
              className='px-3 py-8 text-center text-sm text-muted md:px-4'
            >
              {searchNoResultsLabel(trimmedDeferred)}
            </p>
          ) : (
            <SearchBody
              scrollContainerRef={scrollAreaRef}
              pointerHoverAllowed={hoverAllowed}
              selectedIndex={selectedIndex}
              onHighlight={setSelectedIndex}
              onSelect={handleSelectIndex}
            />
          )}
        </div>
        <div className='hidden shrink-0 md:block'>
          <SearchFooter />
        </div>
      </div>
    </dialog>
  );
}
