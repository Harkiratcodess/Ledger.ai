# AgentGuard UI

React conversion of the AgentGuard brutalist dashboard design (Terminal Brutalism design system).

## Structure

```
src/
  components/
    Layout.jsx        # shared header + sidebar nav, used by every page
  pages/
    Overview.jsx       # "/"
    Filesystem.jsx      # "/filesystem"
    SandboxSetup.jsx    # "/sandbox-setup"
    SessionDetails.jsx  # "/sessions"
    EmptyState.jsx       # "/empty-state"
    EventDetails.jsx     # "/event-details"
    Settings.jsx          # "/settings"
  App.jsx              # routes (react-router, HashRouter)
  main.jsx             # entry point
  index.css            # Tailwind directives + design-system base rules
tailwind.config.js      # full color/typography/spacing tokens from the design system
```

## Run it

```bash
npm install
npm run dev
```

Then open the printed localhost URL. Navigate between screens using the left sidebar.

## Build for production

```bash
npm run build
npm run preview
```

## Notes

- All 7 screens are wired into real client-side routing (react-router) instead of the static `data-path` anchors from the original HTML mockups — clicking a sidebar item actually navigates now.
- The visual design (colors, spacing, typography, the "Terminal Brutalism" look) is preserved exactly via the Tailwind config, ported directly from the original design tokens.
- The dashboard is currently static/presentational — hook up your backend's WebSocket/API calls where you see hardcoded values (event feeds, risk scores, session stats) to make it live.
- Some inline `<script>` blocks from the original HTML mockups (small DOM-manipulation demos like a session timer or filter-tab toggling) were intentionally dropped during conversion since that logic belongs in React state/hooks instead — re-implement as needed with `useState`/`useEffect` per page.
