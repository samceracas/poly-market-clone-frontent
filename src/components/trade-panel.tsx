import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import type { Market, TradeAction } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useExecuteTrade,
  usePositions,
  useTradePrices,
  useTradeQuote,
} from "@/hooks/use-trade-queries";

const QUOTE_DEBOUNCE_MS = 300;

export function TradePanel({ market }: { market: Market }) {
  const { userId } = useAuth();
  const [action, setAction] = useState<TradeAction>("buy");
  const [assetId, setAssetId] = useState(market.assets_options[0]?.id ?? "");
  const [shares, setShares] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: currentPrices = {} } = useTradePrices(market.id);
  const { data: positions = [] } = usePositions(market.id, userId);
  const executeTradeMutation = useExecuteTrade();

  // Only meaningful while selling - you can buy as many shares as you can
  // afford, but you can only sell what you already hold.
  const heldQuantity =
    positions.find((position) => position.asset_id === assetId)?.quantity ?? 0;

  const clampShares = (
    rawShares: string,
    nextAction: TradeAction,
    nextAssetId: string,
  ) => {
    if (nextAction !== "sell") return rawShares;

    const held =
      positions.find((position) => position.asset_id === nextAssetId)
        ?.quantity ?? 0;
    const numeric = Number(rawShares) || 0;

    return numeric > held ? String(held) : rawShares;
  };

  const quantity = Number(shares) || 0;
  const overselling = action === "sell" && quantity > heldQuantity;
  const canQuote = Boolean(assetId) && quantity > 0 && Boolean(userId) && !overselling;

  const debouncedQuantity = useDebouncedValue(quantity, QUOTE_DEBOUNCE_MS);
  const canFetchQuote =
    Boolean(assetId) && debouncedQuantity > 0 && Boolean(userId) && !overselling;

  const quoteQuery = useTradeQuote(
    {
      market_id: market.id,
      asset_id: assetId,
      quantity: debouncedQuantity,
      action,
      user_id: userId,
    },
    canFetchQuote,
  );

  // Rather than resetting quote state manually once inputs are no longer
  // valid, just don't show a stale quote once they aren't.
  const visibleQuote = canQuote ? quoteQuery.data : null;

  const handleTrade = () => {
    if (!assetId || quantity <= 0 || !userId || overselling) return;

    setError(null);

    executeTradeMutation.mutate(
      {
        market_id: market.id,
        asset_id: assetId,
        quantity,
        action,
        user_id: userId,
      },
      {
        onSuccess: () => setShares(""),
        onError: () => setError("Trade failed. Please try again."),
      },
    );
  };

  const selectedAsset = market.assets_options.find((a) => a.id === assetId);

  const renderForm = () => (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-2">
        <ToggleGroup
          variant="outline"
          type="single"
          value={assetId}
          onValueChange={(value) => {
            if (!value) return;
            setAssetId(value);
            setShares((prev) => clampShares(prev, action, value));
          }}
          size="lg"
        >
          {market.assets_options.map((asset) => (
            <ToggleGroupItem
              key={asset.id}
              value={asset.id}
              aria-label={asset.name}
              className="border-2 border-primary/40 font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
            >
              {asset.name}
              {currentPrices[asset.id] !== undefined && (
                <span>{Math.round(currentPrices[asset.id] * 100)}&cent;</span>
              )}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid gap-2">
        <Field orientation="horizontal">
          <FieldLabel htmlFor="trade-shares">Shares</FieldLabel>
          <InputGroup className="border-none hover:border-none">
            <InputGroupInput
              id="trade-shares"
              placeholder="0"
              type="number"
              min="0"
              max={action === "sell" ? heldQuantity : undefined}
              value={shares}
              onChange={(e) =>
                setShares(clampShares(e.target.value, action, assetId))
              }
            />
          </InputGroup>
        </Field>
        {action === "sell" && (
          <div className="text-xs text-muted-foreground">
            You hold {heldQuantity} {heldQuantity === 1 ? "share" : "shares"} of{" "}
            {selectedAsset?.name ?? "this outcome"}.
          </div>
        )}
      </div>

      {visibleQuote && (
        <div className="grid gap-1 text-sm text-muted-foreground">
          <div>
            Estimated cost:{" "}
            <span className="font-medium text-foreground">
              ${(visibleQuote.avg_price * quantity).toFixed(2)}
            </span>
          </div>
          <div>
            Potential winnings if {selectedAsset?.name ?? "this outcome"} wins:{" "}
            <span className="font-medium text-foreground">
              ${visibleQuote.potential_winnings.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-500">{error}</div>}

      {!userId && (
        <div className="text-sm text-muted-foreground">
          Log in to trade.
        </div>
      )}

      <Button
        size="lg"
        onClick={handleTrade}
        disabled={executeTradeMutation.isPending || quantity <= 0 || !userId || overselling}
      >
        {executeTradeMutation.isPending ? "Submitting..." : "Trade"}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{market.name}</CardTitle>
        <CardDescription>{market.header}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={action}
          onValueChange={(value) => {
            const nextAction = value as TradeAction;
            setAction(nextAction);
            setShares((prev) => clampShares(prev, nextAction, assetId));
          }}
        >
          <TabsList>
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy">{renderForm()}</TabsContent>
          <TabsContent value="sell">{renderForm()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
