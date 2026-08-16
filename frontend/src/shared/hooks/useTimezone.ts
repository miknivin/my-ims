import { useGetSettingsQuery } from "@/redux/api/settingsApi";

export function useTimezone(): string {
  const { data } = useGetSettingsQuery();
  return data?.general.timeZoneId ?? "Asia/Kolkata";
}
