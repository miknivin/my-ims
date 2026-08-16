import { useTimezone } from "./useTimezone";
import { formatDate } from "@/shared/utils/dateUtils";

export function useFmtDate() {
  const timeZone = useTimezone();
  return (iso: string, includeTime = false) => formatDate(iso, timeZone, includeTime);
}
