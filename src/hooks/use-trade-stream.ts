import { useEffect } from "react";
import { tradeStreamUrl } from "@/lib/api";

export type TradeStreamEvent = {
  market_id: string;
  asset_id: string;
  quantity: number;
  type: "BUY" | "SELL";
  created_at: string;
  prices_snapshot: Record<string, number>;
};

// Subscribes to the trade-service's SSE endpoint for a market and calls
// onTrade for every trade pushed by the server. EventSource handles
// reconnection automatically if the connection drops.
export function useTradeStream(
  marketId: string | undefined,
  onTrade: (event: TradeStreamEvent) => void,
) {
  useEffect(() => {
    if (!marketId) return;

    const source = new EventSource(tradeStreamUrl(marketId));

    source.addEventListener("trade", (e) => {
      onTrade(JSON.parse(e.data));
    });

    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketId]);
}
