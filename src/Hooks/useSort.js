import { useState } from "react";

export function useSort(initialData = [], initialKey = null) {
  const [sortConfig, setSortConfig] = useState({
    key: initialKey,
    direction: "asc",
  });

  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  }

  const sortedData = [...initialData].sort((a, b) => {
    if (!sortConfig.key) return [...initialData];

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;

    const result = aValue > bValue ? 1 : -1;
    return sortConfig.direction === "asc" ? result : -result;
  });




// use memo hena 3shan kol ma el data tet3'yr y3ml re-sort

  //   const sortedData = useMemo(() => {
  //   if (!initialData) return [];
  //   if (!sortConfig.key) return [...initialData]; // return unsorted data if no key

  //   return [...initialData].sort((a, b) => {
  //     const aValue = a[sortConfig.key];
  //     const bValue = b[sortConfig.key];

  //     if (aValue === bValue) return 0;
  //     const result = aValue > bValue ? 1 : -1;
  //     return sortConfig.direction === "asc" ? result : -result;
  //   });
  // }, [initialData, sortConfig]); // recalc whenever data or sortConfig changes

  return {
    sortedData,
    sortConfig,
    handleSort,
  };
}
