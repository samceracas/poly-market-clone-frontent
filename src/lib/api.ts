const EVENT_SERVICE_URL =
  import.meta.env.VITE_EVENT_SERVICE_URL ?? "http://localhost:3001";
const TRADE_SERVICE_URL =
  import.meta.env.VITE_TRADE_SERVICE_URL ?? "http://localhost:3002";

export type Asset = {
  id: string;
  name: string;
  display_order: number | null;
};

export type Market = {
  id: string;
  name: string;
  header: string;
  status: "OPEN" | "SUSPENDED" | "RESOLVED";
  asset_type: "CHOICE";
  liquidity_b: number;
  assets_options: Asset[];
};

export type EventSummary = {
  id: string;
  name: string;
  status: "OPEN" | "CLOSED";
  created_at: string;
  _count: { markets: number };
};

export type EventDetails = {
  id: string;
  name: string;
  status: "OPEN" | "CLOSED";
  markets: Market[];
};

export type TradeAction = "buy" | "sell";

export type TradeQuote = {
  estimated_price: number;
  avg_price: number;
  potential_winnings: number;
  prices: Record<string, number>;
};

export type TradeResult = {
  user_id: string;
  asset_id: string;
  market_id: string;
  quantity: number;
  payment: number;
  prices: Record<string, number>;
  potential_winnings: number;
};

export type TradeHistoryEntry = {
  created_at: string;
  asset_id: string;
  quantity: number;
  type: "BUY" | "SELL";
  prices_snapshot: Record<string, number> | null;
};

export type PositionEntry = {
  asset_id: string;
  quantity: number;
  potential_winnings: number;
};

export type UserTradeHistoryEntry = {
  created_at: string;
  asset_id: string;
  quantity: number;
  type: "BUY" | "SELL";
  amount: number;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);

  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`);
  }

  return res.json();
}

export function listEvents(limit = 20, offset = 0) {
  return fetchJson<EventSummary[]>(
    `${EVENT_SERVICE_URL}/event/list?limit=${limit}&offset=${offset}`,
  );
}

export function getEventDetails(id: string) {
  return fetchJson<EventDetails>(
    `${EVENT_SERVICE_URL}/event/details?id=${encodeURIComponent(id)}`,
  );
}

export function getTradeQuote(params: {
  market_id: string;
  asset_id: string;
  quantity: number;
  action: TradeAction;
  user_id: string;
}) {
  const query = new URLSearchParams({
    market_id: params.market_id,
    asset_id: params.asset_id,
    quantity: String(params.quantity),
    action: params.action,
    user_id: params.user_id,
  });

  return fetchJson<TradeQuote>(`${TRADE_SERVICE_URL}/trade/quote?${query}`);
}

export function executeTrade(params: {
  market_id: string;
  asset_id: string;
  quantity: number;
  action: TradeAction;
  user_id: string;
}) {
  const body = new URLSearchParams({
    market_id: params.market_id,
    asset_id: params.asset_id,
    quantity: String(params.quantity),
    action: params.action,
    user_id: params.user_id,
  });

  return fetchJson<TradeResult>(`${TRADE_SERVICE_URL}/trade/execute`, {
    method: "POST",
    body,
  });
}

export function getTradeHistory(market_id: string) {
  return fetchJson<TradeHistoryEntry[]>(
    `${TRADE_SERVICE_URL}/trade/history?market_id=${encodeURIComponent(market_id)}`,
  );
}

export function getTradePrices(market_id: string) {
  return fetchJson<Record<string, number>>(
    `${TRADE_SERVICE_URL}/trade/prices?market_id=${encodeURIComponent(market_id)}`,
  );
}

export function getUserPositions(market_id: string, user_id: string) {
  const query = new URLSearchParams({ market_id, user_id });
  return fetchJson<PositionEntry[]>(`${TRADE_SERVICE_URL}/trade/positions?${query}`);
}

export function getUserTradeHistory(market_id: string, user_id: string) {
  const query = new URLSearchParams({ market_id, user_id });
  return fetchJson<UserTradeHistoryEntry[]>(
    `${TRADE_SERVICE_URL}/trade/user-history?${query}`,
  );
}

export function tradeStreamUrl(market_id: string) {
  return `${TRADE_SERVICE_URL}/trade/stream?market_id=${encodeURIComponent(market_id)}`;
}
