type QueryParamValue = string | number | undefined | null;

export function buildQueryParams<T extends object>(
  params?: T
) {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    (Object.entries(params) as Array<[string, QueryParamValue]>).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
}
