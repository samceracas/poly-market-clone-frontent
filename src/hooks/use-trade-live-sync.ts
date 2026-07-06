import { useQueryClient } from "@tanstack/react-query";

import type { TradeHistoryEntry } from "@/lib/api";
import { useTradeStream, type TradeStreamEvent } from "./use-trade-stream";
import { tradeKeys } from "./use-trade-queries";

// One SSE subscription per market page, writing straight into the react-query
// cache - the chart, trade panel, and positions panel all read from that same
// cache, so this replaces each of them opening their own EventSource.
export function useTradeLiveSync(
  marketId: string | undefined,
  userId: string | null,
) {
  const queryClient = useQueryClient();

  useTradeStream(marketId, (event: TradeStreamEvent) => {
    const id = marketId!;

    queryClient.setQueryData<Record<string, number>>(
      tradeKeys.prices(id),
      () => event.prices_snapshot,
    );

    queryClient.setQueryData<TradeHistoryEntry[]>(
      tradeKeys.history(id),
      (old) => [
        ...(old ?? []),
        {
          created_at: event.created_at,
          asset_id: event.asset_id,
          quantity: event.quantity,
          type: event.type,
          prices_snapshot: event.prices_snapshot,
        },
      ],
    );

    // The trade event doesn't carry a user_id, and any trade (by anyone) can
    // change what's outstanding for the logged-in user - simplest is to just
    // invalidate and let it refetch, rather than trying to patch it from a
    // payload that doesn't have enough information to do so.
    if (userId) {
      queryClient.invalidateQueries({ queryKey: tradeKeys.positions(id, userId) });
      queryClient.invalidateQueries({ queryKey: tradeKeys.userHistory(id, userId) });
    }
  });
}
