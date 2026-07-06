import { useQuery } from "@tanstack/react-query";
import { getEventDetails, listEvents } from "@/lib/api";

export function useEvents() {
  return useQuery({ queryKey: ["events"], queryFn: () => listEvents() });
}

export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventDetails(eventId),
  });
}
