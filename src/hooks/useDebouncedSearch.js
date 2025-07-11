
import { useState, useEffect } from 'react';

export const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useDebouncedSearch = (initialValue = '', delay = 300) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const debouncedSearchValue = useDebouncedValue(searchValue, delay);

  return {
    searchValue,
    setSearchValue,
    debouncedSearchValue
  };
};

export default useDebouncedSearch;
