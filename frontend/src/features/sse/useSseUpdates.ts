import { useEffect } from "react";
import { store } from "@/redux/store";
import { dispatchInvalidations } from "./dispatchInvalidations";

const MIN_DELAY = 1_000;
const MAX_DELAY = 30_000;

export function useSseUpdates(): void {
  useEffect(() => {
    let source: EventSource | null = null;
    let retryDelay = MIN_DELAY;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    function connect(): void {
      source = new EventSource("/api/events", { withCredentials: true });

      source.onopen = () => {
        retryDelay = MIN_DELAY;
      };

      source.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as { invalidations: string[] };
          if (Array.isArray(data.invalidations) && data.invalidations.length > 0) {
            dispatchInvalidations(store.dispatch, data.invalidations);
          }
        } catch {
          // malformed SSE data — ignore
        }
      };

      source.onerror = () => {
        source?.close();
        source = null;
        retryTimeout = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, MAX_DELAY);
          connect();
        }, retryDelay);
      };
    }

    connect();

    return () => {
      if (retryTimeout !== null) clearTimeout(retryTimeout);
      source?.close();
    };
  }, []);
}
