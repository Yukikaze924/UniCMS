type RequiredSubset<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type PartialSubset<T, K extends keyof T> = Partial<Pick<T, K>> & Required<Omit<T, K>>;

export type { RequiredSubset, PartialSubset };
