import type { Comparability } from "./types";
import { comparabilityLabel, predicateLabel } from "./labels";

export function ComparabilityTag({ value }: { value: Comparability }) {
  const className = value.toLocaleLowerCase().replaceAll(" ", "-");
  return <span className={`pkg-status pkg-status--${className}`} title={value}>{comparabilityLabel(value)}</span>;
}

export function PredicateTag({ value }: { value: string }) {
  return <span className={`pkg-predicate pkg-predicate--${value.replaceAll(" ", "-")}`} title={value}>{predicateLabel(value)}</span>;
}
