import {memo} from 'react';
import type {MatchReason, SearchResult} from '@/types/document';
import {MATCH_REASON_LABEL, SEARCH_DEBUG_UI} from '@/lib/searchEngine';
import {searchOptionLabel} from './searchA11y';
import {EnterIcon} from '@/icons/EnterIcon';

type SearchResultItemProps = {
  id: string;
  doc: SearchResult;
  index: number;
  resultCount: number;
  isSelected: boolean;
  pointerHoverAllowed: boolean;
  onSelect: (index: number) => void;
  onHighlight: (index: number) => void;
};

type ResultClasses = {
  row: string;
  title: string;
  icon: string;
  desc: string;
  score: string;
  reasonChip: string;
};

function getResultClasses(
  isSelected: boolean,
  pointerHoverAllowed: boolean,
): ResultClasses {
  if (isSelected) {
    return {
      row: 'bg-primary/60',
      title: 'text-foreground-solid',
      icon: 'opacity-100',
      desc: 'text-foreground-solid',
      score: 'text-foreground-solid/90 bg-white/15',
      reasonChip: 'text-foreground-solid/90 bg-white/15',
    };
  }

  if (pointerHoverAllowed) {
    return {
      row: 'hover:bg-primary/60',
      title: 'text-foreground group-hover:text-foreground-solid',
      icon: 'opacity-0 group-hover:opacity-100',
      desc: 'text-muted group-hover:text-foreground-solid',
      score:
        'text-primary/80 bg-primary/10 group-hover:text-foreground-solid group-hover:bg-white/15',
      reasonChip:
        'text-muted bg-white/5 group-hover:text-foreground-solid/90 group-hover:bg-white/10',
    };
  }

  return {
    row: '',
    title: 'text-foreground',
    icon: 'opacity-0',
    desc: 'text-muted',
    score: 'text-primary/80 bg-primary/10',
    reasonChip: 'text-muted bg-white/5',
  };
}

function DebugBadges({
  reasons,
  score,
  classes,
}: {
  reasons: MatchReason[];
  score: number;
  classes: ResultClasses;
}) {
  return (
    <div className='flex shrink-0 flex-wrap items-start gap-1'>
      {reasons.map((reason) => (
        <span
          key={reason}
          className={`text-[10px] font-mono font-bold px-1.5 py-0.25 rounded-sm ${classes.reasonChip}`}
        >
          {MATCH_REASON_LABEL[reason]}
        </span>
      ))}
      <span
        className={`font-mono text-[10px] px-1.5 py-0.25 rounded-sm font-bold ${classes.score}`}
      >
        {score}
      </span>
    </div>
  );
}

export const SearchResultItem = memo(function SearchResultItem({
  id,
  doc,
  index,
  resultCount,
  isSelected,
  pointerHoverAllowed,
  onSelect,
  onHighlight,
}: SearchResultItemProps) {
  const c = getResultClasses(isSelected, pointerHoverAllowed);
  const pointerGated = !pointerHoverAllowed && !isSelected;

  return (
    <li
      id={id}
      role='option'
      aria-selected={isSelected}
      aria-setsize={resultCount}
      aria-posinset={index + 1}
      aria-label={searchOptionLabel(
        doc.name,
        doc.short_description,
        index,
        resultCount,
      )}
      data-index={index}
      className={`search-result-row ${pointerGated ? 'search-result-row--pointer-gated' : ''} group cursor-pointer rounded-[2.5px] px-2 md:px-3 py-2 md:py-2.5 scroll-mt-1 scroll-mb-2 ${c.row}`}
      onPointerMove={
        pointerHoverAllowed && !isSelected
          ? () => onHighlight(index)
          : undefined
      }
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect(index)}
    >
      <div className='flex items-center justify-between gap-3' aria-hidden='true'>
        <div className='min-w-0 flex-1'>
          <div className='flex min-w-0 items-center gap-2.5'>
            <span
              className={`relative min-w-0 shrink truncate text-base font-semibold ${c.title}`}
              dangerouslySetInnerHTML={{__html: doc.highlightedName}}
            />
            {SEARCH_DEBUG_UI ? (
              <DebugBadges
                reasons={doc.matchReasons}
                score={doc.score}
                classes={c}
              />
            ) : null}
          </div>
          <p
            className={`mt-0 text-sm leading-relaxed line-clamp-1 ${c.desc}`}
            dangerouslySetInnerHTML={{__html: doc.highlightedDesc}}
          />
        </div>
        <span
          className={`hidden fine-pointer:flex shrink-0 items-center text-foreground-solid ${c.icon}`}
        >
          <EnterIcon className='size-7.5' />
        </span>
      </div>
    </li>
  );
});
