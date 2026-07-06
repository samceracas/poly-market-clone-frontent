import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Market } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { usePositions } from "@/hooks/use-trade-queries";

export function MarketPositions({ market }: { market: Market }) {
  const { userId } = useAuth();
  const { data: positions = [] } = usePositions(market.id, userId);

  const assetName = (assetId: string) =>
    market.assets_options.find((asset) => asset.id === assetId)?.name ?? assetId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your positions</CardTitle>
        <CardDescription>{market.name}</CardDescription>
      </CardHeader>
      <CardContent>
        {!userId ? (
          <div className="text-sm text-muted-foreground">
            Log in to see your positions.
          </div>
        ) : positions.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            You don't hold any shares in this market yet.
          </div>
        ) : (
          <div className="grid gap-2">
            {positions.map((position) => (
              <div
                key={position.asset_id}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {assetName(position.asset_id)} &middot; {position.quantity}{" "}
                  {position.quantity === 1 ? "share" : "shares"}
                </span>
                <span className="font-medium text-foreground">
                  ${position.potential_winnings.toFixed(2)} if resolved
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
