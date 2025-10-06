import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import "./App.css";

function Table({
  data,
  columns,
  onDeleteRow,
  tableTitle = "List",
  actions = [],
  showExportButton = false,
  showPrintButton = false,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const sortedColumns = [...columns]
    .filter((col) => col.isShown)
    .sort((a, b) => (a.isFixed === b.isFixed ? -1 : a.isFixed ? 0 : 1));

  //  Function: Export to Excel
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

  function handlePrint() {
    // 1️⃣ Get the title (without buttons)
    const titleElement = document.querySelector(".table-title"); // adjust if your title class is different
    const titleText = titleElement ? titleElement.textContent.trim() : "";

    // 2️⃣ Get the table only
    const table = document.getElementById("printableTable");
    if (!table) {
      console.error("No table found to print!");
      return;
    }

    // 3️⃣ Clone the table so we can modify it safely
    const clone = table.cloneNode(true);

    // 4️⃣ Remove the last column if it’s “Actions”
    const headers = clone.querySelectorAll("thead th");
    let actionColIndex = -1;

    headers.forEach((th, i) => {
      if (th.textContent.trim().toLowerCase() === "actions") {
        actionColIndex = i;
      }
    });

    if (actionColIndex !== -1) {
      headers[actionColIndex].remove();
      const rows = clone.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells[actionColIndex]) cells[actionColIndex].remove();
      });
    }

    // 5️⃣ Open a new window for printing
    const printWindow = window.open("", "", "height=800,width=1000");

    // 6️⃣ Write styled HTML with title and table
    printWindow.document.write(`
    <html>
      <head>
        <title>${titleText}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 30px;
          }

          h2 {
            text-align: center;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
          }

          th, td {
            border: 1px solid #333;
            padding: 8px 10px;
            text-align: left;
            font-size: 14px;
          }

          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }

          tr:nth-child(even) {
            background-color: #fafafa;
          }

          /* ✅ Keep table header on every page */
          thead { display: table-header-group; }

          tr { page-break-inside: avoid; }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <h2>${titleText}</h2>
        ${clone.outerHTML}
      </body>
    </html>
  `);

    // 7️⃣ Print and close
    printWindow.document.close();
    printWindow.print();
  }

  if (!data.length || !columns.length) {
    return <p>No data available</p>;
  }

  return (
    <div className="table-container">
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
        {/* ⋯ button beside the title */}
        {(showExportButton || showPrintButton) && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
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

            {showMenu && (
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
                      setShowMenu(false);
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
                      setShowMenu(false);
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

      <table className="table" id="printableTable">
        <thead>
          <tr>
            {sortedColumns
              .filter((col) => col.isShown)
              .map((col) => (
                <th key={col.name}>
                  {
                    col.name
                      .replace(/([A-Z])/g, " $1") // add space before capital letters
                      .replace(/^./, (str) => str.toUpperCase()) // capitalize first letter
                  }
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
              onDeleteRow={onDeleteRow}
              actions={actions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ row, columns, actions = [] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <tr>
      {columns
        .filter((col) => col.isShown)
        .map((col) => (
          <td key={col.name}>{row[col.name]}</td>
        ))}

      <td style={{ position: "relative" }}>
        <button
          onClick={toggleMenu}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ⋮
        </button>

        {isMenuOpen && (
          <div
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
            {actions.map((action, i) => (
              <div
                key={i}
                onClick={() => {
                  action.onClick(row);
                  setIsMenuOpen(false); // close after click
                }}
                style={{
                  padding: "6px 12px",
                  cursor: "pointer",
                  borderBottom:
                    i !== actions.length - 1 ? "1px solid #eee" : "none",
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

function CommentsTable({
  pageSize = 100,
  data = [],
  columns = [],
  deleteRow,
  addRow,
  sortByPostIdDesc,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterTxt, setFilterTxt] = useState("");
  const [searchTxt, setSearchTxt] = useState("");

  // const filteredData = filterTxt
  //   ? data.filter((item) => item.postId === Number(filterTxt))
  //   : data;

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

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(data.length / pageSize));
    setCurrentPage((prevPage) => Math.min(prevPage, newTotalPages));
  }, [data]);

  return (
    <>
      <div>
        <button className="center-btn" onClick={addRow}>
          Add Row
        </button>

        <button className="center-btn" onClick={sortByPostIdDesc}>
          Sort by Post ID desc
        </button>

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

      <Table
        data={currentItems}
        columns={columns}
        onDeleteRow={deleteRow}
        pageSize={pageSize}
        tableTitle="Comments List"
        actions={[
          {
            label: "View",
            onClick: (row) =>
              alert(
                Object.entries(row)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n")
              ),
          },
          {
            label: "Delete",
            onClick: (row) => deleteRow(row),
          },
        ]}
        showExportButton={true}
        showPrintButton={true}
      />

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          style={{ margin: "0 5px" }}
        >
          Next
        </button>
      </div>
    </>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]); // stores column metadata (like isSortable, isShown, etc.)

  function fetchData() {
    fetch("https://jsonplaceholder.typicode.com/comments")
      .then((response) => response.json())
      .then((json) => {
        setData(json);

        const firstRow = json[0];
        const columnsFromDb = Object.keys(firstRow);

        const columnMetadata = columnsFromDb.map((col) => ({
          name: col,
          isSortable: !["body"].includes(col), // disable sorting for 'body'
          isShown: !["email"].includes(col), // hide 'email' column for example
          isFixed: ["id", "postId"].includes(col), // fix 'id,' and 'postId' columns
        }));

        console.log("Columns with metadata:", columnMetadata);
        setColumns(columnMetadata);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  function deleteRow(row) {
    const updatedData = data.filter((item) => item.id !== row.id);
    setData(updatedData);
  }

  function addRow() {
    const newId =
      data.length > 0 ? Math.max(...data.map((item) => item.id)) + 1 : 1;
    const newRow = {
      postId: Math.floor(Math.random() * 100) + 1,
      id: newId,
      name: `New Name ${newId}`,
      email: "demo@email.com",
    };

    setData((prevData) => [...prevData, newRow]);

    //setData(prevData => [newRow,...prevData]);
    //setCurrentPage(1);
  }

  function sortByPostIdDesc() {
    const sortedData = [...data].sort((a, b) => b.postId - a.postId);
    setData(sortedData);
    //setCurrentPage(1);
  }

  return (
    <>
      <div className="app-container">
        <CommentsTable
          data={data}
          columns={columns}
          pageSize={100}
          deleteRow={deleteRow}
          addRow={addRow}
          sortByPostIdDesc={sortByPostIdDesc}
        />
        <button className="center-btn" onClick={() => fetchData()}>
          Get Data
        </button>
      </div>
    </>
  );
}

export default App;
