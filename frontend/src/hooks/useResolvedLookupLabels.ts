import { useMemo } from "react";
import { useResolveLookupsQuery } from "../app/api/lookupApi";
import { LookupResolveRequestItem, LookupSource } from "../types/filtering";

interface ReferenceFilterDescriptor {
  key: string;
  source: LookupSource;
  value?: string;
}

export function useResolvedLookupLabels(descriptors: ReferenceFilterDescriptor[]) {
  const requestItems = useMemo<LookupResolveRequestItem[]>(() => {
    const grouped = new Map<LookupSource, Set<string>>();

    descriptors.forEach((descriptor) => {
      if (!descriptor.value) {
        return;
      }

      const current = grouped.get(descriptor.source) ?? new Set<string>();
      current.add(descriptor.value);
      grouped.set(descriptor.source, current);
    });

    return Array.from(grouped.entries()).map(([source, ids]) => ({
      source,
      ids: Array.from(ids),
    }));
  }, [descriptors]);

  const { data } = useResolveLookupsQuery(
    { items: requestItems },
    { skip: requestItems.length === 0 }
  );

  return useMemo(() => {
    const labels: Record<string, string> = {};

    descriptors.forEach((descriptor) => {
      if (!descriptor.value) {
        return;
      }

      const resolved = data?.find((item) => item.source === descriptor.source)?.options.find((option) => option.id === descriptor.value);
      if (resolved) {
        labels[descriptor.key] = resolved.label;
      }
    });

    return labels;
  }, [data, descriptors]);
}
