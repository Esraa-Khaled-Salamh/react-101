
import { useState, useEffect } from "react";

export function usePagination(data = [], pageSize = 100) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentItems = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // If data changes and the current page becomes invalid (e.g., after filtering)
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [data, totalPages]);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    currentItems,
  };
}
