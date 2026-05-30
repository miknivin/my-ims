import { ReactNode } from "react";

export type TransactionLineColumnNature =
  | "input"
  | "readonly"
  | "lookup"
  | "select";

export interface TransactionLineColumnDefinition<
  TLine,
  TContext,
  TKey extends string = string,
> {
  key: TKey;
  label: string;
  nature: TransactionLineColumnNature;
  defaultSelected: boolean;
  defaultWidth: number;
  minWidth: number;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  getSortValue: (line: TLine) => string | number;
  renderCell: (context: TContext) => ReactNode;
}
