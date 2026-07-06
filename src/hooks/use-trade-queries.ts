import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  executeTrade,
  getTradeHistory,
  getTradePrices,
  getTradeQuote,
  getUserPositions,
  getUserTradeHistory,
  type TradeAction,
} from "@/lib/api";

// Central key factory so every reader/writer of this data agrees on the same
// cache entries - e.g. TradePanel and MarketPositions both read positions
// through `tradeKeys.positions(...)`, so they share one cached fetch instead
// of each firing their own request.
export const tradeKeys = {
  prices: (marketId: string) => ["trade-prices", marketId] as const,
  history: (marketId: string) => ["trade-history", marketId] as const,
  positions: (marketId: string, userId: string) =>
    ["positions", marketId, userId] as const,
  userHistory: (marketId: string, userId: string) =>
    ["user-trade-history", marketId, userId] as const,
};

export function useTradePrices(marketId: string) {
  return useQuery({
    queryKey: tradeKeys.prices(marketId),
    queryFn: () => getTradePrices(marketId),
  });
}

export function useTradeHistory(marketId: string) {
  return useQuery({
    queryKey: tradeKeys.history(marketId),
    queryFn: () => getTradeHistory(marketId),
  });
}

export function usePositions(marketId: string, userId: string | null) {
  return useQuery({
    queryKey: tradeKeys.positions(marketId, userId ?? ""),
    queryFn: () => getUserPositions(marketId, userId!),
    enabled: Boolean(userId),
  });
}

export function useUserTradeHistory(marketId: string, userId: string | null) {
  return useQuery({
    queryKey: tradeKeys.userHistory(marketId, userId ?? ""),
    queryFn: () => getUserTradeHistory(marketId, userId!),
    enabled: Boolean(userId),
  });
}

export function useTradeQuote(
  params: {
    market_id: string;
    asset_id: string;
    quantity: number;
    action: TradeAction;
    user_id: string | null;
  },
  enabled: boolean,
) {
  return useQuery({
    queryKey: [
      "trade-quote",
      params.market_id,
      params.asset_id,
      params.quantity,
      params.action,
      params.user_id,
    ],
    queryFn: () =>
      getTradeQuote({
        market_id: params.market_id,
        asset_id: params.asset_id,
        quantity: params.quantity,
        action: params.action,
        user_id: params.user_id!,
      }),
    enabled,
  });
}

export function useExecuteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: executeTrade,
    // Prices/history update from the trade's own SSE broadcast (see
    // use-trade-live-sync.ts) - positions can't be derived from that payload
    // (it doesn't carry user_id), so this is the one thing worth nudging here.
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: tradeKeys.positions(variables.market_id, variables.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: tradeKeys.userHistory(variables.market_id, variables.user_id),
      });
    },
  });
}
