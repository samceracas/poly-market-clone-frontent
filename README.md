# prediction-market-frontend

The frontend for Prediction Market, a prediction-market trading UI. Lists events,
shows a live-updating price chart per market, and lets a (mock-authenticated) user
buy/sell shares, see their current positions, and review their own trade history.

Talks to event-service for event/market data and to trade-service for pricing,
trading, and live updates (REST + Server-Sent Events).

Built with React 19, Vite, Tailwind v4, shadcn/radix, TanStack Query, and recharts.

🔗 Live Demo: prediction-market-frontend

`Note: hosted on Render free tier. Initial load may take ~30 seconds on cold start.`

## Running

```
npm install
npm run dev
```

Runs on `http://localhost:5173`. Requires `VITE_EVENT_SERVICE_URL` and
`VITE_TRADE_SERVICE_URL` in `.env` (default to `http://localhost:3001` and
`http://localhost:3002`).
