import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Market } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useUserTradeHistory } from "@/hooks/use-trade-queries";

export function TradeHistoryTable({ market }: { market: Market }) {
  const { userId } = useAuth();
  const { data: history = [] } = useUserTradeHistory(market.id, userId);

  const assetName = (assetId: string) =>
    market.assets_options.find((asset) => asset.id === assetId)?.name ?? assetId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your trade history</CardTitle>
        <CardDescription>{market.name}</CardDescription>
      </CardHeader>
      <CardContent>
        {!userId ? (
          <div className="text-sm text-muted-foreground">
            Log in to see your trade history.
          </div>
        ) : history.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            You haven't made any trades in this market yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, index) => (
                <TableRow key={`${entry.created_at}-${index}`}>
                  <TableCell>
                    <Badge variant={entry.type === "BUY" ? "default" : "destructive"}>
                      {entry.type === "BUY" ? "Buy" : "Sell"}
                    </Badge>
                  </TableCell>
                  <TableCell>{assetName(entry.asset_id)}</TableCell>
                  <TableCell>{entry.quantity}</TableCell>
                  <TableCell
                    className={
                      entry.type === "BUY"
                        ? "text-red-600 dark:text-red-500"
                        : "text-green-600 dark:text-green-500"
                    }
                  >
                    {entry.type === "BUY" ? "-" : "+"}$
                    {Math.abs(entry.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
