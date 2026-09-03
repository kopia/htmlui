import React, { use, useState, useCallback } from "react";
import PropTypes from "prop-types";

// Table sort state, persisted across component (re)mounts, keyed by table
// identity. In-memory only: it does not survive a browser refresh.
const TableSortContext = React.createContext(null);

export function TableSortProvider({ children }) {
  const [sorts, setSorts] = useState({});

  const getSort = useCallback((key) => sorts[key] ?? [], [sorts]);
  // TanStack v8 onSortingChange may pass either the new SortingState or an
  // updater function (state) => SortingState; resolve both to a plain array.
  const setSort = useCallback((key, update) => {
    setSorts((prev) => {
      const current = prev[key] ?? [];
      const next = typeof update === "function" ? update(current) : update;
      return { ...prev, [key]: next };
    });
  }, []);

  return (
    <TableSortContext value={{ getSort, setSort }}>
      {children}
    </TableSortContext>
  );
}

TableSortProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Returns [sorting, setSorting] compatible with TanStack's onSortingChange.
// When tableKey is provided, the state is shared across (re)mounts via the
// provider; otherwise it falls back to component-local state (behavior
// unchanged for call sites without a key).
export function useTableSort(tableKey) {
  const ctx = use(TableSortContext);
  const [localSorting, setLocalSorting] = useState([]);

  if (!ctx || !tableKey) {
    return [localSorting, setLocalSorting];
  }

  const sorting = ctx.getSort(tableKey);
  const setSorting = (s) => ctx.setSort(tableKey, s);
  return [sorting, setSorting];
}
