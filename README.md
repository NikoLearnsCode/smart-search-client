# Client-side Fuzzy Search

A command-palette–style smart search that runs **entirely in the browser** - no search API, no backend. Documents are loaded as static JSON, indexed and scored in JavaScript, and results follow the input live via React `useDeferredValue` (no debounce timer). Highlighted matches, full keyboard navigation, and screen-reader support.

Built with Vite, React 19, TypeScript and Tailwind CSS. The bundled dataset is `src/data/movies_1000.json` (1000 popular movies).

## How it works

The query flows through four small modules in `src/lib/`:

| File | Responsibility |
| --- | --- |
| `searchData.ts` | Loads the dataset once, runs the query over every document, sorts by score, caps the results. |
| `searchDocument.ts` | Builds the per-document search index (`preparePage`) and the `<mark>` highlighting. |
| `searchEngine.ts` | Scores a document against the query tokens (ranking + match reasons). |
| `searchFuzzy.ts` | Fallback matchers: acronym and typo (Damerau–Levenshtein). |

The UI lives in `src/components/search/` - a native `<dialog>` (`SearchModal`) opened via `Cmd/Ctrl+K`, with state held in `SearchProvider`. Accessibility details (live-region announcements, hover/keyboard arbitration, scroll lock) are split into focused hooks in `src/hooks/`.

## Search logic

Each document is searched on three fields: its `name`, its `tag` (a comma-separated list), and its `short_description`.

A query is lowercased and split on spaces into tokens. **A document only matches if _every_ token matches it** - typing `dark knight` requires both words to be found.

Each token earns points, and documents are ranked by their total. Points are awarded in this order, strongest first:

1. **Title** - exact word > word prefix > substring (e.g. `dark` > `dar` > `ark`).
2. **Tag** - same exact > prefix > substring, scored a bit lower than the title.
3. **Description** - substring only, and only for tokens of 3+ characters.

If a token earns nothing from the above, two fallbacks are tried against the title:

- **Acronym** - `tdk` matches *The Dark Knight*.
- **Typo** - `knigt` still matches *knight* (one edit away).

Finally, a **bonus** is added when the whole query exactly equals the full title or the full tag string, so an exact title always ranks at the top.

## Using your own data

Replace `src/data/movies_1000.json`, update the types in `src/types/document.ts`, and adapt the field mapping in `preparePage` (`src/lib/searchDocument.ts`).

## Debug UI

Set `SEARCH_DEBUG_UI` to `true` in `src/lib/searchEngine.ts` to show each result's score and match reason (name / tag / description / acronym / typo).
