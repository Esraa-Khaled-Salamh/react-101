// src/exportUtils.js
import * as XLSX from "xlsx";

/**
 * Small helper to escape HTML when building table cells for printing.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Shared CSS for printed pages (keeps header on every page).
 */
const PRINT_CSS = `
  body { font-family: Arial, sans-serif; margin: 30px; }
  h2 { text-align: center; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
  th, td { border: 1px solid #333; padding: 8px 10px; text-align: left; font-size: 14px; }
  th { background-color: #f2f2f2; font-weight: bold; }
  tr:nth-child(even) { background-color: #fafafa; }
  thead { display: table-header-group; } /* keep header on each printed page */
  tr { page-break-inside: avoid; }
  @media print { body { -webkit-print-color-adjust: exact; } }
`;

/**
 * Utility: open print window with given HTML body content and title.
 */
function openPrintWindow({ title = "", bodyHTML = "" }) {
  const w = window.open("", "", "height=800,width=1000");
  if (!w) {
    console.error("Unable to open print window (popup blocked?).");
    return;
  }

  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>${PRINT_CSS}</style>
      </head>
      <body>
        <h2>${title}</h2>
        ${bodyHTML}
      </body>
    </html>
  `);
  w.document.close();
  w.focus();
  w.print();
  // optionally: w.close();
}

/**
 * Remove the Actions column (if present) from a cloned table DOM node.
 * - modifies the clone in place.
 */
function removeActionsColumnFromClone(clone) {
  const headers = clone.querySelectorAll("thead th");
  let actionColIndex = -1;

  headers.forEach((th, i) => {
    if (th.textContent.trim().toLowerCase() === "actions") actionColIndex = i;
  });

  if (actionColIndex !== -1) {
    // remove the header cell
    if (headers[actionColIndex]) headers[actionColIndex].remove();

    // remove each row's corresponding td
    const rows = clone.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells[actionColIndex]) cells[actionColIndex].remove();
    });
  }
}

/**
 * Export visible columns of `data` to an Excel (.xlsx) file.
 *
 * @param {{data: Array, columns: Array, fileName?: string}}
 */
export function exportToExcel({ data = [], columns = [], fileName = "data" }) {
  if (!data || !data.length) {
    console.warn("exportToExcel: no data to export");
    return;
  }

  const visibleColumns = (columns || []).filter((c) => c.isShown !== false);

  const worksheetData = data.map((row) => {
    const out = {};
    visibleColumns.forEach((col) => {
      // use nullish coalescing so we don't export `undefined`
      out[col.name] = row[col.name] ?? "";
    });
    return out;
  });

  const ws = XLSX.utils.json_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * Print the currently rendered table DOM element (cloned).
 * Accepts either a DOM element or an element id string.
 *
 * @param {HTMLElement|string} tableElementOrId
 * @param {string} title
 */
export function printCurrentTableElement(tableElementOrId, title = "") {
  const tableEl =
    typeof tableElementOrId === "string"
      ? document.getElementById(tableElementOrId)
      : tableElementOrId;

  if (!tableEl) {
    console.error("printCurrentTableElement: table element not found");
    return;
  }

  const clone = tableEl.cloneNode(true);
  // remove actions column if exists
  removeActionsColumnFromClone(clone);

  openPrintWindow({ title, bodyHTML: clone.outerHTML });
}

/**
 * Build and print a full table for all `data` rows (ignores DOM table, uses props).
 * This will use `columns` metadata to decide which columns to show.
 *
 * @param {{data: Array, columns: Array, title?: string}}
 */
export function printAllData({ data = [], columns = [], title = "" }) {
  if (!data || data.length === 0) {
    alert("No data to print");
    return;
  }

  const visibleColumns = (columns || []).filter((c) => c.isShown !== false);

  const headerHTML = `
    <thead>
      <tr>
        ${visibleColumns
          .map(
            (col) =>
              `<th>${col.name
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase())}</th>`
          )
          .join("")}
      </tr>
    </thead>
  `;

  const bodyHTML = `
    <tbody>
      ${data
        .map(
          (row) => `
        <tr>
          ${visibleColumns
            .map((col) => `<td>${escapeHtml(String(row[col.name] ?? ""))}</td>`)
            .join("")}
        </tr>`
        )
        .join("")}
    </tbody>
  `;

  const fullTableHTML = `<table style="width:100%; border-collapse:collapse;">${headerHTML}${bodyHTML}</table>`;

  openPrintWindow({ title, bodyHTML: fullTableHTML });
}
