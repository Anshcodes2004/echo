# Echo — Warm Clay redesign

The current pastel palette (lavender/sage/dusty/peach) reads generic and busy, and the home page is a symmetric two-card grid that looks like every dashboard template. This replaces the color system and rebuilds home around a single central recording instrument.

## New color direction: Warm Clay

Replace the four-pastel system with a grounded, near-neutral palette so calm comes from restraint, not from many soft hues.

- Background: warm ivory `#F7F3EC`
- Surface / raised cards: soft clay `#E4D5C7` (and a lighter card tone above the base)
- Primary accent: muted terracotta `#C08A6E` — used sparingly (record button, active nav, key emphasis)
- Secondary accent: soft moss `#8A9A7B` — for personal/journal context and success states
- Text: deep warm charcoal, not black

Everything gets converted to OKLCH tokens in the design system. The pastel names stay as tokens but are remapped: lavender → clay, sage → moss, dusty → stone, peach → sand — so all existing screens (History, Insights, Meeting/Personal results, Recording) pick up the new mood automatically without rewriting each file. One accent maximum per screen; borders get quieter, shadows warmer and softer.

## New typography

Outfit for headings, Figtree for body, loaded via the root head. Replaces Inter across the app. Slightly larger heading sizes with tighter tracking, roomier body line-height for a calmer read.

## New homepage layout

Vertical, centered, instrument-first — not a card grid.

```text
        Good morning, Ansh
     a quiet line of context

          (  ◉  )          <- large circular record button
       breathing ring, terracotta
        tap to start recording

    ┌──────────────┐  ┌──────────────┐
    │   Personal   │  │   Meeting    │   <- mode selector under the button
    └──────────────┘  └──────────────┘

    ─────────────────────────────────
    Recent
    · title              12 min · today
    · title              6 min  · yesterday
    · title              21 min · Tue
```

- The record button is the visual anchor: a large circle with a slow breathing ring, warm clay surface, terracotta core, subtle press/hover physics.
- Personal and Meeting sit directly below as two compact selectable chips/cards; the selected mode tints the record button (terracotta for meeting, moss for personal) and the button navigates into that mode.
- Recent recordings become a quiet text list — no heavy card chrome, just rows with hairline separators.
- Sidebar is simplified to match: lighter weight, single accent on the active item, the usage meter reduced to a thin clay bar.

## Technical notes

- Rewrite the token block in `src/styles.css` (`:root` + `@theme inline`) with the new OKLCH values; rename semantics via token remapping so components keep their class names.
- Add Outfit + Figtree `<link>` tags in `src/routes/__root.tsx`, update `--font-sans` and add `--font-display`.
- Rebuild `src/routes/index.tsx` around a new `RecordDial` component in `src/components/echo/`.
- Adjust `AppShell.tsx` sidebar weights and the usage indicator.
- No data or logic changes; `src/lib/echo-data.ts` and all result/record routes stay as they are.
