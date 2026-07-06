import { Link } from "react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEvents } from "@/hooks/use-events";

export function LandingPage() {
  const { data: events, isError } = useEvents();

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load events.
      </div>
    );
  }

  if (!events) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No events yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 font-heading text-2xl font-medium">Events</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link key={event.id} to={`/events/${event.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
                <CardDescription>
                  {event._count.markets}{" "}
                  {event._count.markets === 1 ? "market" : "markets"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span
                  className={
                    event.status === "OPEN"
                      ? "text-sm font-medium text-green-600"
                      : "text-sm font-medium text-muted-foreground"
                  }
                >
                  {event.status}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
