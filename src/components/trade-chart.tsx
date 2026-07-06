import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTradeHistory } from "@/hooks/use-trade-queries";
import type { Market } from "@/lib/api";

type ChartPoint = { time: string; [assetId: string]: number | string };

const MAX_ASSETS_SHOWN = 4;

export function TradeChart({ market }: { market: Market }) {
  const { data: history = [] } = useTradeHistory(market.id);

  const topAssetIds = useMemo(() => {
    const volumeByAsset = new Map<string, number>();
    for (const trade of history) {
      volumeByAsset.set(
        trade.asset_id,
        (volumeByAsset.get(trade.asset_id) ?? 0) + trade.quantity,
      );
    }

    const ranked = [...volumeByAsset.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_ASSETS_SHOWN)
      .map(([assetId]) => assetId);

    return ranked.length
      ? ranked
      : market.assets_options.slice(0, MAX_ASSETS_SHOWN).map((asset) => asset.id);
  }, [history, market.assets_options]);

  const points = useMemo<ChartPoint[]>(
    () =>
      history
        .filter((trade) => trade.prices_snapshot)
        .map((trade) => ({
          time: trade.created_at,
          ...trade.prices_snapshot!,
        })),
    [history],
  );

  const config = useMemo<ChartConfig>(
    () =>
      market.assets_options
        .filter((asset) => topAssetIds.includes(asset.id))
        .reduce<ChartConfig>((acc, asset, index) => {
          acc[asset.id] = {
            label: asset.name,
            color: `var(--chart-${index + 1})`,
          };
          return acc;
        }, {}),
    [market.assets_options, topAssetIds],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{market.header}</CardTitle>
        <CardDescription>Live implied share price</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <LineChart data={points} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {topAssetIds.map((assetId) => (
              <Line
                key={assetId}
                dataKey={assetId}
                type="monotone"
                stroke={`var(--color-${assetId})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
