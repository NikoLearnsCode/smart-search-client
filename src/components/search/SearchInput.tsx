import {memo, useCallback} from 'react';
import type {ChangeEvent, KeyboardEvent} from 'react';
import SearchIcon from '@/icons/SearchIcon';
import {XIcon} from '@/icons/XIcon';
import {useSearchState} from './SearchContext';
import {SEARCH_HINTS_ID} from './searchA11y';

type SearchInputProps = {
  linkFieldHints: boolean;
  ariaExpanded: boolean;
  ariaControls?: string;
//  Resets the idle timer so live status doesn't interrupt typing.
  onSearchInputActivity?: () => void;
};

export const SearchInput = memo(function SearchInput({
  linkFieldHints,
  ariaExpanded,
  ariaControls,
  onSearchInputActivity,
}: SearchInputProps) {
  const {inputRef, query, setQuery} = useSearchState();
  const showClear = query.length > 0;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      onSearchInputActivity?.();
    },
    [setQuery, onSearchInputActivity],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') return;
      onSearchInputActivity?.();
    },
    [onSearchInputActivity],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, [setQuery, inputRef]);

  return (
    <div className='relative'>
      <SearchIcon height={20} width={20} />
      <input
        ref={inputRef}
        type='text'
        inputMode='search'
        autoComplete='off'
        spellCheck={false}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder='Search movies'
        role='searchbox'
        aria-label='Search movies'
        aria-describedby={linkFieldHints ? SEARCH_HINTS_ID : undefined}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        className={`w-full rounded-xs border border-primary bg-input h-12 pl-10.5 text-[18px] text-foreground placeholder:text-base placeholder:text-muted outline-none shadow-sm shadow-glow  ${
          showClear ? 'pr-11' : 'pr-8'
        }`}
      />
      {showClear && (
        <div className='absolute inset-y-0 right-0 flex items-center'>
          <button
            type='button'
            className='animate-search-clear-in group flex h-6 w-6 mr-2.5 rounded-full shrink-0 items-center cursor-pointer justify-center text-primary transition-colors outline-none focus:outline-none focus-visible:ring focus-visible:ring-offset-1 focus-visible:ring-primary focus-visible:ring-offset-background group-focus:text-primary'
            aria-label='Clear search'
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
          >
            <XIcon height={16} width={16} className='text-muted group-focus:text-primary' />
          </button>
        </div>
      )}
    </div>
  );
});
