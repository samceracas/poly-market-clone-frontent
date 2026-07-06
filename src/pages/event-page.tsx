import { useParams } from "react-router";

import { TradeChart } from "@/components/trade-chart";
import { TradePanel } from "@/components/trade-panel";
import { MarketPositions } from "@/components/market-positions";
import { TradeHistoryTable } from "@/components/trade-history-table";
import { useEventDetails } from "@/hooks/use-events";
import { useTradeLiveSync } from "@/hooks/use-trade-live-sync";
import { useAuth } from "@/lib/auth-context";

export function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();

  if (!eventId) return null;

  // Keying by eventId forces a fresh mount (and fresh state) whenever the
  // user navigates between events, instead of reusing this component's
  // state and having to reset it manually from inside an effect.
  return <EventPageContent key={eventId} eventId={eventId} />;
}

function EventPageContent({ eventId }: { eventId: string }) {
  const { userId } = useAuth();
  const { data: event, isError } = useEventDetails(eventId);

  const market = event?.markets[0];
  useTradeLiveSync(market?.id, userId);

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load event data.
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!market) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        This event has no markets yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-2 p-6">
      <div className="col-span-8 col-start-3">
        <div className="grid grid-cols-10 gap-3">
          <div className="col-span-6">
            <TradeChart market={market} />
          </div>
          <div className="col-span-4 flex flex-col gap-3">
            <TradePanel market={market} />
            <MarketPositions market={market} />
            <TradeHistoryTable market={market} />
          </div>
        </div>
      </div>
    </div>
  );
}
