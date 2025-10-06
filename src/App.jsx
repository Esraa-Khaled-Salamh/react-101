import * as XLSX from "xlsx";
import { useEffect, useState, useRef } from "react";
import "./App.css";

function Row({ row, columns, rowActions, openMenuId, setOpenMenuId }) {
  const menuRef = useRef(null);

  return (
    <tr>
      {columns.map((col) => (
        <td key={col.name}>{row[col.name]}</td>
      ))}

      <td style={{ position: "relative" }}>
        <button
          onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ⋮
        </button>

        {openMenuId === row.id && (
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              zIndex: 100,
            }}
          >
            {rowActions.map((action, i) => (
              <div
                key={i}
                onClick={() => {
                  action.onClick(row);
                  setOpenMenuId(null);
                }}
                style={{
                  padding: "6px 12px",
                  cursor: "pointer",
                  borderBottom:
                    i !== rowActions.length - 1 ? "1px solid #eee" : "none",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              >
                {action.label}
              </div>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}

function Table({
  data,
  columns,
  tableTitle = "List",
  rowActions = [],
  showExportButton = false,
  showPrintButton = false,
}) {
  const [openMenuId, setOpenMenuId] = useState(null); // "header" or row.id or null
  const menuRef = useRef(null);

  // 🔹 Close all menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedColumns = [...columns]
    .filter((col) => col.isShown)
    .sort((a, b) => (b.isFixed ? 1 : 0) - (a.isFixed ? 1 : 0));

  // 📤 Export to Excel
  function handleExportToExcel() {
    const filteredData = data.map((row) => {
      let filtered = {};
      columns
        .filter((col) => col.isShown)
        .forEach((col) => {
          filtered[col.name] = row[col.name];
        });
      return filtered;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${tableTitle}.xlsx`);
  }

  // 🖨️ Print table
  function handlePrint() {
    const titleElement = document.querySelector(".table-title");
    const titleText = titleElement ? titleElement.textContent.trim() : "";

    const table = document.getElementById("printableTable");
    if (!table) {
      console.error("No table found to print!");
      return;
    }

    const clone = table.cloneNode(true);

    // remove Actions column
    const headers = clone.querySelectorAll("thead th");
    let actionColIndex = -1;
    headers.forEach((th, i) => {
      if (th.textContent.trim().toLowerCase() === "actions") actionColIndex = i;
    });

    if (actionColIndex !== -1) {
      headers[actionColIndex].remove();
      const rows = clone.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells[actionColIndex]) cells[actionColIndex].remove();
      });
    }

    const printWindow = window.open("", "", "height=800,width=1000");
    printWindow.document.write(`
      <html>
        <head>
          <title>${titleText}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
            th, td { border: 1px solid #333; padding: 8px 10px; text-align: left; font-size: 14px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <h2>${titleText}</h2>
          ${clone.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  if (!data.length || !columns.length) return <p>No data available</p>;

  return (
    <div className="table-container" ref={menuRef}>
      {/* Header with ⋯ button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <h2
          className="table-title"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          {tableTitle}
        </h2>

        {(showExportButton || showPrintButton) && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() =>
                setOpenMenuId(openMenuId === "header" ? null : "header")
              }
              style={{
                border: "none",
                background: "transparent",
                fontSize: "22px",
                cursor: "pointer",
                lineHeight: 1,
                padding: "2px 5px",
              }}
            >
              ⋯
            </button>

            {openMenuId === "header" && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "120%",
                  background: "white",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  zIndex: 10,
                  minWidth: "140px",
                }}
              >
                {showExportButton && (
                  <button
                    onClick={() => {
                      handleExportToExcel();
                      setOpenMenuId(null);
                    }}
                    style={{
                      display: "block",
                      padding: "8px 16px",
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    Export to Excel
                  </button>
                )}
                {showPrintButton && (
                  <button
                    onClick={() => {
                      handlePrint();
                      setOpenMenuId(null);
                    }}
                    style={{
                      display: "block",
                      padding: "8px 16px",
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    Print
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <table className="table" id="printableTable">
        <thead>
          <tr>
            {sortedColumns.map((col) => (
              <th key={col.name}>
                {col.name
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <Row
              key={index}
              row={row}
              columns={sortedColumns}
              rowActions={rowActions}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeadOfTable({
  tableTitle = "List",
  data = [],
  columns = [],
  pageSize = 100,
  deleteRow,
  addRow,
  rowActions = [],
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * pageSize;
  const currentItems = data.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(data.length / pageSize));
    setCurrentPage((prev) => Math.min(prev, newTotalPages));
  }, [data]);

  return (
    <>
      <div>
        <button className="center-btn" onClick={addRow}>
          Add Row
        </button>

        {/* <button className="center-btn" onClick={sortByPostIdDesc}>
          Sort by Post ID desc
        </button> */}
      </div>

      <Table
        data={currentItems}
        columns={columns}
        pageSize={pageSize}
        tableTitle={tableTitle}
        rowActions={rowActions}
        showExportButton={true}
        showPrintButton={true}
      />

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          style={{ margin: "0 5px" }}
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            style={{
              margin: "0 5px",
              fontWeight: currentPage === index + 1 ? "bold" : "normal",
            }}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{ margin: "0 5px" }}
        >
          Next
        </button>
      </div>
    </>
  );
}

function CommentsTable({
  data,
  columns = [],
  deleteRow,
  addRow,
  showExportButton = true,
  showPrintButton = true,
}) {
  const [filterTxt, setFilterTxt] = useState("");
  const [searchTxt, setSearchTxt] = useState("");
  const pageSize = 100;
  const rowActions = [
    { label: "View", onClick: (row) => viewDetailAction(row) },
    { label: "Delete", onClick: (row) => deleteRow(row) },
  ];

  // alert(
  //   Object.entries(row)
  //     .map(([key, value]) => `${key}: ${value}`)
  //     .join("\n")
  // ),

  const filteredData = data.filter((row) => {
    const matchesPostId = !filterTxt || row.postId === Number(filterTxt);
    const matchesSearch =
      !searchTxt ||
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(searchTxt.toLowerCase());
    return matchesPostId && matchesSearch;
  });

  function viewDetailAction(row) {
    alert(
      Object.entries(row)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
    );
  }

  return (
    <>
      <div>
        <div style={{ margin: "10px 0" }}>
          <input
            type="number"
            placeholder="Filter by Post ID"
            value={filterTxt}
            onChange={(e) => setFilterTxt(e.target.value)}
            style={{ marginRight: "10px", padding: "5px" }}
          />

          <input
            type="text"
            placeholder="Search in table..."
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            style={{ padding: "5px" }}
          />
        </div>
      </div>

      <HeadOfTable
        data={filteredData}
        columns={columns}
        onDeleteRow={deleteRow}
        addRow={addRow}
        pageSize={pageSize}
        tableTitle="Comments List"
        rowActions={rowActions}
        showExportButton={showExportButton}
        showPrintButton={showPrintButton}
      />
    </>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  function fetchData() {
    fetch("https://jsonplaceholder.typicode.com/comments")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        const firstRow = json[0];
        const columnsFromDb = Object.keys(firstRow);
        const columnMetadata = columnsFromDb.map((col) => ({
          name: col,
          isSortable: !["body"].includes(col),
          isShown: !["email"].includes(col),
          isFixed: ["id", "postId"].includes(col),
        }));
        setColumns(columnMetadata);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }

  function deleteRow(row) {
    setData((prev) => prev.filter((item) => item.id !== row.id));
  }

  function addRow() {
    const newId = data.length > 0 ? Math.max(...data.map((i) => i.id)) + 1 : 1;
    const newRow = {
      postId: Math.floor(Math.random() * 100) + 1,
      id: newId,
      name: `New Name ${newId}`,
      email: "demo@email.com",
    };
    setData((prev) => [...prev, newRow]);
  }

  function sortByPostIdDesc() {
    setData((prev) => [...prev].sort((a, b) => b.postId - a.postId));
  }

  return (
    <div className="app-container">
      <CommentsTable
        data={data}
        columns={columns}
        deleteRow={deleteRow}
        addRow={addRow}
      />
      <button className="center-btn" onClick={fetchData}>
        Get Data
      </button>
    </div>
  );
}

export default App;
