declare module 'lodash' {
  export function isEmpty(value?: unknown): boolean;
  export function isNil(value?: unknown): value is null | undefined;
  export function trim(string?: string, chars?: string): string;
  export function omitBy<T extends object>(
    object: T | null | undefined,
    predicate?: (value: unknown, key: string) => boolean,
  ): Partial<T>;
  export function get<TDefault = unknown>(
    object: unknown,
    path: string | string[],
    defaultValue?: TDefault,
  ): TDefault;

  const _: {
    isEmpty: typeof isEmpty;
    isNil: typeof isNil;
    trim: typeof trim;
    omitBy: typeof omitBy;
    get: typeof get;
  };
  export default _;
}

