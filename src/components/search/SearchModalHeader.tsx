import {memo} from 'react';
import {SEARCH_DIALOG_ID, SEARCH_FIELD_HINTS, SEARCH_HINTS_ID} from './searchA11y';
import {SearchInput} from './SearchInput';

type SearchModalHeaderProps = {
  linkFieldHints: boolean;
  ariaExpanded: boolean;
  ariaControls?: string;
  /** Resets the idle timer so live status doesn't interrupt typing. */
  onSearchInputActivity?: () => void;
};

export const SearchModalHeader = memo(function SearchModalHeader({
  linkFieldHints,
  ariaExpanded,
  ariaControls,
  onSearchInputActivity,
}: SearchModalHeaderProps) {
  return (
    <div className='shrink-0 bg-secondary px-3 pb-2 pt-3 md:px-4 md:pb-4 md:pt-4'>
      <p id={SEARCH_HINTS_ID} className='sr-only'>
        {SEARCH_FIELD_HINTS}
      </p>
      <div className='flex items-center gap-2'>
        <div className='min-w-0 flex-1'>
          <SearchInput
            linkFieldHints={linkFieldHints}
            ariaExpanded={ariaExpanded}
            ariaControls={ariaControls}
            onSearchInputActivity={onSearchInputActivity}
          />
        </div>
        <button
          type='button'
          commandfor={SEARCH_DIALOG_ID}
          command='close'
          aria-label='Close search'
          className='shrink-0 rounded-xs h-12 px-1 text-base font-semibold text-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary md:hidden'
        >
          Cancel
        </button>
      </div>
    </div>
  );
});
