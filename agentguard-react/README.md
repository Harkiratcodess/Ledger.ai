# Ledger dashboard

Optional local observability UI for the Ledger security runtime.

This app does **not** provide protection by itself. Run `ledger protect .` (or `npm start` in `backend`) so the dashboard can connect to `http://localhost:5000`.

```bash
npm install
npm run dev
npm run build
```

The header shows **RUNTIME CONNECTED** or **RUNTIME DISCONNECTED** from `GET /api/health`.
