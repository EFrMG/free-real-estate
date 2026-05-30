/**
 * Creates a handler to close modals that also expects to set initialState of an object with useObjectState
 */
export function createDialogCloseHandler<T>(
  setDialogOpen: (isOpen: boolean) => void,
  updateState: (state: Partial<T>) => void,
  initialState: Partial<T>,
) {
  return (e: React.SyntheticEvent) => {
    e.preventDefault();
    setDialogOpen(false);

    updateState(initialState);
  };
}
