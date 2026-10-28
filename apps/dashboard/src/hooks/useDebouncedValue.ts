import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

/**
 * Custom hook debounce giá trị sử dụng lodash.debounce
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const debouncedSetter = useMemo(
    () =>
      debounce((nextValue: T) => {
        setDebouncedValue(nextValue);
      }, delayMs),
    [delayMs],
  );

  useEffect(() => {
    debouncedSetter(value);
    return () => {
      debouncedSetter.cancel();
    };
  }, [value, debouncedSetter]);

  return debouncedValue;
}

