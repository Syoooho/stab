import { useState, useEffect } from 'react';

function isPlainObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

export function usePersistence<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
            const parsed = JSON.parse(item);
            // If both are plain objects, merge them to ensure new fields in initialValue are preserved
            if (isPlainObject(initialValue) && isPlainObject(parsed)) {
                return { ...initialValue, ...parsed };
            }
            return parsed;
        }
        return initialValue;
      }
    } catch (error) {
      console.log(error);
    }
    return initialValue;
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
      
      // Sync with Chrome Storage if available
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ [key]: valueToStore });
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  // Hydrate from Chrome storage on mount if available
  useEffect(() => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get([key], (result: Record<string, any>) => {
              if (result[key]) {
                  const fetched = result[key];
                  // Same merge logic for chrome storage
                  if (isPlainObject(initialValue) && isPlainObject(fetched)) {
                      setStoredValue({ ...initialValue, ...fetched });
                  } else {
                      setStoredValue(fetched);
                  }
              }
          });
      }
  }, [key]);

  return [storedValue, setValue] as const;
}
