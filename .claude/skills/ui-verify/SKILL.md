---
name: ui-verify
description: Check a UI change in the real browser in this portfolio repo — both locales, both themes, mobile and desktop width, console and hydration warnings, accessibility tree, keyboard focus, soft language switch, no-JS and reduced-motion states. Use this whenever a block changes anything visible or interactive (component, style, header, switcher, section, animation), when the author says "check it in the browser", "verify", "does it work in uk/dark/mobile", or before ticking a UI acceptance criterion in a feature spec.
---

# UI verify

Ticking a criterion means it was seen, not that the code looks right. This skill is the checklist and the way to report
it honestly. `work-block` points here for any block with a visible change.

## Setup

1. Dev server: `cd app && pnpm dev` (background), default `http://localhost:3000`. In Next 16 dev writes to
   `.next/dev`, so `next dev` and `next build` can run at the same time; a second `next dev` in the same project will
   not start, so reuse the running one. The first navigation after a change can take several seconds.
2. Browser: Claude in Chrome (`mcp__claude-in-chrome__*`, load the tools in one ToolSearch call; follow the
   `claude-in-chrome` skill: start with `tabs_context_mcp`, open a new tab, never trigger `alert`/`confirm` dialogs).
   If the tools are missing or fail after two or three attempts, stop and tell the author (they return after `/mcp`
   reconnect or a session restart); do not claim a browser check you did not do.
3. Width: the window cannot be made wider than about 844 px. That covers below `lg` (1024 px). For desktop
   measurements load the page in a 1400 px `iframe` and measure inside it.

## What to check

Pick what the change can affect; do not run everything for a one-line style fix.

| Area                | How                                                                                                                                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Locales             | `/` (en) and `/uk`.                                                                                                                                                                                                                                                                                                      |
| Themes              | Set `localStorage.theme` to `light`, `dark`, or remove it (system); reload. Check `html[data-theme]`: with the key removed (system) there is no `data-theme` attribute, and the theme follows the browser's own preference.                                                                                              |
| Widths              | About 844 px (burger menu, below `lg`) and 1400 px via iframe (desktop).                                                                                                                                                                                                                                                 |
| Console             | `read_console_messages` with a pattern for `hydrat`, `Warning`, `Error`.                                                                                                                                                                                                                                                 |
| Accessibility tree  | `read_page`: order, names, only one copy of a duplicated control exposed (desktop row and burger panel both exist; CSS hides the other). Visible text must be part of an `aria-label`.                                                                                                                                   |
| Keyboard            | Tab order, visible focus, Escape closes the burger menu and returns focus to the toggle, Enter/Space on controls.                                                                                                                                                                                                        |
| Soft locale switch  | Click the language link, not a reload. A marker set on `window` must survive; the whole `[locale]` layout remounts (D14), so check `<html lang>`, `data-theme`, `color-scheme`, the `theme-ready` class, scroll lock, that keyboard focus returns to the visible language switcher, and that animation state is rebuilt. |
| No JavaScript       | `curl -s http://localhost:3000/` : the content is in the server HTML. That alone does not prove it is visible: also check the CSS for elements hidden until JS runs (`opacity: 0`, `visibility: hidden`, initial animation states).                                                                                      |
| Reduced motion      | In Chrome DevTools, Rendering panel, "Emulate CSS media feature prefers-reduced-motion: reduce". The extension tools may not reach it; if you cannot set it, say so and check from the code (`gsap.matchMedia`, the CSS media query). Content must be fully visible, with no non-essential motion.                       |
| Assets and requests | `read_network_requests` for failed images or fonts when the change touches media.                                                                                                                                                                                                                                        |

## Report

Per `work-block`, in the author's language:

- Say which of the checks above ran, with the concrete result (what was seen), and which did not and why (tool
  disconnected, width limit, no real screen reader).
- Tick a spec criterion only for what was observed. Mark a check done from code reading as "from code, not checked in
  the browser".
- A real screen reader is never available here; state announcements as "checked in the DOM / accessibility tree", not
  as heard.
- Record a defect you found as a finding with the repro (locale, theme, width, steps), do not fix it unprompted.
