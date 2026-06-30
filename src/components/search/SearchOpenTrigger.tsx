import type {Ref} from 'react';
import SearchIcon from '@/icons/SearchIcon';
import {SEARCH_SHORTCUT_LABEL} from '@/lib/modKey';
import {SEARCH_DIALOG_ID} from './searchA11y';

type SearchOpenTriggerProps = {
  ref?: Ref<HTMLButtonElement>;
  className?: string;
};

export function SearchOpenTrigger({
  ref,
  className = '',
}: SearchOpenTriggerProps) {
  return (
    <button
      ref={ref}
      type='button'
      commandfor={SEARCH_DIALOG_ID}
      command='show-modal'
      aria-label='Open search'
      className={`group fixed top-[15.5px] left-[13px] rounded-xs flex h-10 w-10 shrink-0 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 p-5 ml-[3px] mt-px focus-visible:ring-offset-background md:h-auto md:w-fit md:justify-start md:py-2.5 md:pl-4 cursor-pointer md:pr-3 ${className}`}
    >
      <SearchIcon className='size-5  md:size-4 shrink-0 text-muted transition-colors group-hover:text-foreground md:absolute md:left-5 md:top-1/2  md:-translate-y-1/2' />
      <div className='hidden min-w-0 items-center gap-3 pl-7 md:flex'>
        <span className='text-xs font-medium text-muted transition-colors group-hover:text-foreground'>
          Search
        </span>
        {SEARCH_SHORTCUT_LABEL ? (
          <kbd className='rounded-sm border border-primary/50 bg-background/80 px-2 h-6 flex items-center justify-center font-sans text-xs font-medium text-primary/75 transition-colors group-hover:border-primary group-hover:text-primary hover:shadow-xs hover:shadow-glow '>
            {SEARCH_SHORTCUT_LABEL}
          </kbd>
        ) : null}
      </div>
    </button>
  );
}
