import {Kbd} from './Kbd';
import {EnterIcon} from '@/icons/EnterIcon';
import {ArrowUpIcon} from '@/icons/ArrowUpIcon';
import {ArrowDownIcon} from '@/icons/ArrowDownIcon';
import {EscIcon} from '@/icons/EscIcon';
import {memo} from 'react';

export const SearchFooter = memo(function SearchFooter() {
  return (
    <footer
      aria-hidden='true'
      className='shrink-0 border-t bg-background border-white/10 px-4 py-2'
    >
      <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-foreground/50'>
        <span className='inline-flex items-center gap-2'>
          <Kbd className='size-6 min-w-7 p-0'>
            <EnterIcon strokeWidth={1.3} />
          </Kbd>
          <span>to select</span>
        </span>
        <span className='inline-flex items-center gap-2'>
          <span className='inline-flex gap-1'>
            <Kbd className='size-6 p-0'>
              <ArrowUpIcon />
            </Kbd>
            <Kbd className='size-6 p-0'>
              <ArrowDownIcon />
            </Kbd>
          </span>
          <span>to navigate</span>
        </span>
        <span className='inline-flex items-center gap-2'>
          <Kbd className='h-6 min-w-8 px-0'>
            <EscIcon />
          </Kbd>
          <span>to close</span>
        </span>
      </div>
    </footer>
  );
});
