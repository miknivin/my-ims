import { useMemo } from "react";
import { useSearchParams } from "react-router";

type FilterDefaults = Record<string, string>;

export function useUrlFilterState<TDefaults extends FilterDefaults>(defaults: TDefaults) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(() => {
    const nextValues = {} as Record<keyof TDefaults, string>;

    (Object.keys(defaults) as Array<keyof TDefaults>).forEach((key) => {
      nextValues[key] = searchParams.get(String(key)) ?? defaults[key];
    });

    return nextValues;
  }, [defaults, searchParams]);

  const update = (updates: Partial<Record<keyof TDefaults, string>>, resetPage = true) => {
    const nextParams = new URLSearchParams(searchParams);

    (Object.keys(updates) as Array<keyof TDefaults>).forEach((key) => {
      const value = updates[key];
      const defaultValue = defaults[key];

      if (!value || value === defaultValue) {
        nextParams.delete(String(key));
      } else {
        nextParams.set(String(key), value);
      }
    });

    if (resetPage && !("page" in updates)) {
      nextParams.delete("page");
    }

    setSearchParams(nextParams, { replace: true });
  };

  const clear = (key: keyof TDefaults, resetPage = true) => {
    update({ [key]: defaults[key] } as unknown as Partial<Record<keyof TDefaults, string>>, resetPage);
  };

  const clearAll = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return {
    values,
    update,
    clear,
    clearAll,
  };
}
