# Stale layout on cross-locale client navigation

Minimal reproduction: with `cacheComponents: true` and `next/root-params`, a client-side
navigation that changes the `[locale]` root param re-renders the **page** segment but reuses the
**layout** segment from the previous locale.

**Live demo: https://next-intl-cachecomponents-locale-re.vercel.app**

Open `/`, then click `en` in the header — the green PAGE box switches to `en` while the red
LAYOUT box stays on `zh-TW`.

- next `16.3.4`
- next-intl `4.14.2`
- react `19.2.8`

## Setup

Deliberately follows the documented setup:

- locale resolved via `next/root-params` in `src/i18n/request.ts` ([blog post](https://next-intl.dev/blog/nextjs-root-params))
- locale switcher is `<Link href={pathname} locale={locale} />` ([docs](https://next-intl.dev/docs/routing/navigation#link))
- no `app/layout.tsx` (uses `global-not-found.tsx`), no route groups
- `defineRouting` and `createNavigation` in separate files
- `localePrefix: 'as-needed'`, locales `['zh-TW', 'en']`, default `zh-TW`
- `generateStaticParams` declared once, on `app/[locale]/layout.tsx`

The layout prints `LAYOUT locale:` (red box) and each page prints `PAGE locale:` (green box).
**They must always agree.**

## Reproduce

Requires a production build — `<Link>` prefetching is production-only, so this does not
reproduce with `next dev`.

```bash
npm install
npm run build
npm start
```

Then in a browser at http://localhost:3000:

1. Open `/` — both boxes show `zh-TW` ✅
2. Click `en` in the header
3. URL becomes `/en`, the green PAGE box switches to `en`, but the red LAYOUT box still
   shows `zh-TW` ❌

Same thing on `/about`, and in the other direction (`en` → `zh-TW`).

A full page reload always renders correctly, so only client-side navigation is affected.

## The server is not at fault

Every server-rendered surface is correct for every URL:

```bash
for p in / /en /about /en/about; do
  printf "%-11s " "$p"
  curl -s "http://localhost:3000$p" | grep -oE 'locale: <b>[a-zA-Z-]*' | sed 's/locale: <b>//' | tr '\n' ' '
  echo
done
```

```
/           zh-TW zh-TW
/en         en en
/about      zh-TW zh-TW
/en/about   en en
```

The full RSC response also carries the resolved locale:

```bash
for p in / /en; do
  printf "%-5s " "$p"
  curl -sL -H "RSC: 1" "http://localhost:3000$p" | grep -o '\["locale","[a-zA-Z-]*"' | head -1
done
```

```
/     ["locale","zh-TW"
/en   ["locale","en"
```

## What differs: the prefetch tree omits the resolved param

The segment-level prefetch tree describes `[locale]` with `"key": null`, so the tree for `/` and
`/en` is **byte-identical**:

```bash
curl -sL -H "RSC: 1" -H "Next-Router-Prefetch: 1" \
  -H "Next-Router-Segment-Prefetch: /_tree" \
  "http://localhost:3000/"   -o /tmp/tree-zh.txt
curl -sL -H "RSC: 1" -H "Next-Router-Prefetch: 1" \
  -H "Next-Router-Segment-Prefetch: /_tree" \
  "http://localhost:3000/en" -o /tmp/tree-en.txt

diff /tmp/tree-zh.txt /tmp/tree-en.txt && echo IDENTICAL
md5 -q /tmp/tree-zh.txt /tmp/tree-en.txt
```

```
IDENTICAL
3989433d5e237deef5746b41cf4d7019
3989433d5e237deef5746b41cf4d7019
```

Same result against the deployed demo (`x-nextjs-prerender: 1`, `x-nextjs-stale-time: 300`):

```
sizes: 304 vs 304
md5 zh: e6701dea7cea11937f3afcc7d3011d2e
md5 en: e6701dea7cea11937f3afcc7d3011d2e
```

Both return:

```json
{
  "tree": {
    "name": "",
    "param": null,
    "prefetchHints": 20560,
    "slots": {
      "children": {
        "name": "locale",
        "param": { "type": "d", "key": null, "siblings": [] },
        "prefetchHints": 20592,
        "slots": {
          "children": { "name": "__PAGE__", "param": null, "slots": null }
        }
      }
    }
  },
  "staleTime": 300,
  "buildId": "..."
}
```

This is the only asymmetry I could find between what the server sends and what the client
renders, and it lines up with the symptom: the layout segment is shared across locales while the
page segment is not.

## Expected

A client-side navigation that changes a root param should not reuse the layout segment rendered
for a different value of that param. `LAYOUT locale` and `PAGE locale` should always match.

## Notes

- Removing `cacheComponents: true` makes the problem go away.
- `export const instant = false` on the layout leaves the route table byte-identical (so it does
  not make anything dynamic) but does not fix the mismatch.
- `experimental.instantInsights.validationLevel: 'manual-warning'` has no effect.
- `export const dynamicParams = false` fails the build:
  `Route segment config "dynamicParams" is not compatible with nextConfig.cacheComponents`.
  This is the flag pointed to as the missing piece in
  [vercel/next.js#71927](https://github.com/vercel/next.js/discussions/71927) and tracked in
  [vercel/next.js#84991](https://github.com/vercel/next.js/discussions/84991).

## Workaround

Force a full document load when switching locale, so the client router is bypassed:

```tsx
<a href={getPathname({ href: pathname, locale, forcePrefix: true })} hrefLang={locale}>
  {locale}
</a>
```

`forcePrefix: true` is needed so the request goes through the prefixed URL first and the
middleware can write the locale cookie before normalising back.
