import { useState } from "react";

export default function useObjectState<T extends object>(initialState: T) {
  const [state, setState] = useState<T>(initialState);

  const updateState = (updates: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  return {
    state,
    updateState,
  };
}
