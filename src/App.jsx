import {
  exportToExcel,
  printCurrentTableElement,
  printAllData,
} from "./Utils/ExportUtils";
import { usePagination } from "./Hooks/usePagination";
import { useSort } from "./Hooks/useSort";
import { useEffect, useState, useRef, use } from "react";
import ErrorBoundary from "./ErrorBoundary";
import "./App.css";
import "tailwindcss";



function CommentsTable({ data = [], addRow, deleteRow }) {
  const [columns, setColumns] = useState([]);
  const [filterTxt, setFilterTxt] = useState("");
  const [searchTxt, setSearchTxt] = useState("");
  const pageSize = 100;
  const rowActions = [
    { label: "View", onClick: (row) => viewDetailAction(row) },
    { label: "Delete", onClick: (row) => deleteRow(row) },
  ];

  useEffect(() => {
    if (columns.length === 0 && data.length > 0) {
      const firstRow = data[0];
      const columnsFromDb = Object.keys(firstRow);
      const columnMetadata = columnsFromDb.map((col) => ({
        name: col,
        isSortable: !["body"].includes(col),
        isShown: !["email"].includes(col),
        isFixed: ["id", "postId"].includes(col),
      }));
      setColumns(columnMetadata);
    }
  }, [data, columns.length]);

  // function sortByPostIdDesc() {
  //   setData((prev) => [...prev].sort((a, b) => b.postId - a.postId));
  // }

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
        <div className="my-[10px]">
          <input
            type="number"
            placeholder="Filter by Post ID"
            value={filterTxt}
            onChange={(e) => setFilterTxt(e.target.value)}
            className="mr-2 p-1 border border-gray-300 rounded"
          />

          <input
            type="text"
            placeholder="Search in table..."
            value={searchTxt}
            onChange={(e) => setSearchTxt(e.target.value)}
            className="p-1 border border-gray-300 rounded"
          />

          <div>
            <button
              className="block mx-auto my-5 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md cursor-pointer transition-colors duration-200 ease-in-out hover:bg-blue-700"
              onClick={addRow}
            >
              Add Row
            </button>

            {/* <button className="center-btn" onClick={sortByPostIdDesc}>
          Sort by Post ID desc
        </button> */}
          </div>
        </div>
      </div>

      <TableControl
        data={filteredData}
        columns={columns}
        RowComponent={InlineActionRow}
        pageSize={pageSize}
        tableTitle="Comments List"
        rowActions={rowActions}
        showExportButton={true}
        showPrintButton={true}
        ShowPagination={true}
      />
    </>
  );
}
















function ColoredRow({ row, columns }) {
 return (
  <tr className={row.id % 2 === 0 ? "bg-gray-50" : "bg-white"}>
    {columns.map((col) => (
      <td key={col.name}>
        {col.name === "email" ? (
          <strong className="text-blue-600 font-semibold">
            {row[col.name]}
          </strong>
        ) : (
          row[col.name]
        )}
      </td>
    ))}
  </tr>
);
}

function DefaultRow({ row, columns, rowActions, openMenuId, setOpenMenuId }) {
  const menuRef = useRef(null);

 return (
  <tr>
    {columns.map((col) => (
      <td key={col.name}>{row[col.name]}</td>
    ))}

    <td className="relative">
      <button
        onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
        className="bg-transparent border-none text-[18px] cursor-pointer"
      >
        ⋮
      </button>

      {openMenuId === row.id && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full bg-white border border-gray-300 rounded-md shadow-md z-[100]"
        >
          {rowActions.map((action, i) => (
            <div
              key={i}
              onClick={() => {
                action.onClick(row);
                setOpenMenuId(null);
              }}
              className={`px-3 py-1.5 cursor-pointer ${
                i !== rowActions.length - 1 ? "border-b border-gray-200" : ""
              } hover:bg-gray-50`}
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

function Row({ row, columns, rowActions, openMenuId, setOpenMenuId }) {
  const menuRef = useRef(null);

 return (
  <tr>
    {columns.map((col) => (
      <td key={col.name}>{row[col.name]}</td>
    ))}

    <td className="relative">
      <button
        onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
        className="bg-transparent border-none text-[18px] cursor-pointer"
      >
        ⋮
      </button>

      {openMenuId === row.id && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full bg-white border border-gray-300 rounded-md shadow-md z-[100]"
        >
          {rowActions.map((action, i) => (
            <div
              key={i}
              onClick={() => {
                action.onClick(row);
                setOpenMenuId(null);
              }}
              className={`px-3 py-1.5 cursor-pointer whitespace-nowrap hover:bg-gray-100 ${
                i !== rowActions.length - 1 ? 'border-b border-gray-200' : ''
              }`}
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


function InlineActionRow({ row, columns, rowActions }) {

  return (
  <tr>
    {columns.map((col) => (
      <td key={col.name}>{row[col.name]}</td>
    ))}

    <td>
      {rowActions.map((action, i) => (
        <button
          key={i}
          onClick={() => action.onClick(row)}
          className="mx-[5px]"
        >
          {action.label}
        </button>
      ))}
    </td>
  </tr>
);

}







function PaginationControls({ currentPage, setCurrentPage, totalPages }) {
  return (
  <div className="mt-5 text-center">
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className="mx-1 px-3 py-1 border rounded disabled:opacity-50"
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentPage(index + 1)}
        className={`mx-1 px-3 py-1 border rounded ${
          currentPage === index + 1 ? "font-bold bg-gray-200" : "font-normal"
        }`}
      >
        {index + 1}
      </button>
    ))}

    <button
      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="mx-1 px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
);
}


function Table({
  data,
  columns,
  RowComponent,
  rowActions = [],
  handlePrintCurrentPage,
  handlePrintAllData,
  handleExportToExcel,
  showExportButton = false,
  showPrintButton = false,
  handleSort,
  sortConfig,
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

  if (!data.length || ! columns.length) { 
    
    return ( 
    <div className="flex flex-col items-center justify-center w-full min-h-screen">
      <p className="text-gray-500 text-lg text-center">No data available</p>
    </div>
  );
  }

return (
  <div ref={menuRef}>
    {/* Header with ⋯ button */}
    <div className="flex items-center justify-between mb-2.5">
    
      {(showExportButton || showPrintButton) && (
        <div className="relative">
          <button
            onClick={() =>
              setOpenMenuId(openMenuId === "header" ? null : "header")
            }
            className="border-none bg-transparent text-[22px] cursor-pointer leading-none px-1.5 py-0.5"
          >
            ⋯
          </button>

          {openMenuId === "header" && (
            <div className="absolute right-0 top-[120%] bg-white border border-gray-300 rounded-lg shadow-md z-10 min-w-[140px]">
              {showExportButton && (
                <button
                  onClick={() => {
                    handleExportToExcel();
                    setOpenMenuId(null);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Export to Excel
                </button>
              )}

              {showPrintButton && (
                <div>
                  <button
                    onClick={() => {
                      handlePrintCurrentPage();
                      setOpenMenuId(null);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Print Current Page
                  </button>

                  <button
                    onClick={() => {
                      handlePrintAllData();
                      setOpenMenuId(null);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Print All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>

    {/* Table */}
    <div  className=" overflow-x-auto max-h-[700px] overflow-y-auto"  > 
      <table
        className="w-full border-separate border border-gray-200 bg-white shadow-sm rounded-xl"
        id="printableTable"
      >
        <thead className="bg-gray-100 text-gray-700 text-sm uppercase sticky top-0 z-20">
          <tr className="divide-x divide-gray-200">
            {sortedColumns.map((col) => (
              <th
                key={col.name}
                onClick={() => col.isSortable && handleSort(col.name)}
                className={`py-3 px-4 text-center sticky left-0 bg-gray-100 z-30 select-none ${
                  col.isSortable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {col.name
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
                {sortConfig.key === col.name &&
                  (sortConfig.direction === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-gray-600">
          {data.map((row, index) => (
            <RowComponent
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
  </div>
);

}

function TableControl({
  tableTitle = "List",
  data = [], 
  columns = [],
  RowComponent = DefaultRow,
  pageSize = 100,
  rowActions = [],
  showExportButton = true,
  showPrintButton = true,
  showPagination = true,
}) {

  const [searchTerm, setSearchTerm] = useState(""); 
  const { sortedData, sortConfig, handleSort } = useSort(data);

   // If ShowPagination is false, override pageSize to display all rows
  const effectivePageSize = showPagination ? pageSize : data.length;

  const { currentPage, setCurrentPage, totalPages, currentItems } =
    usePagination(sortedData, effectivePageSize);


  //  Export to Excel
  function handleExportToExcel() {
    exportToExcel({ data, columns, fileName: tableTitle });
  }
  //  Print table
  function handlePrintCurrentPage() {
    // prints the currently rendered table with id "printableTable"
    printCurrentTableElement("printableTable", tableTitle);
  }
  //  Print All
  function handlePrintAllData() {
    printAllData({ data, columns, title: tableTitle });
  }


  return (
    <>

   <div className="w-full" >

    <div className="flex items-center justify-between mb-2.5">
    <h2 className="table-title flex items-center gap-2">{tableTitle}</h2>

    {/* Filter / Search input */}
      <input
      type="text"
      placeholder="Search..."
      value={searchTerm} // you'll need a state for this
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
     </div>

      <Table
        data={currentItems} //currentItems
        columns={columns}
        RowComponent={RowComponent}
        rowActions={rowActions}
        handlePrintCurrentPage={handlePrintCurrentPage}
        handleExportToExcel={handleExportToExcel}
        handlePrintAllData={handlePrintAllData}
        showExportButton={showExportButton}
        showPrintButton={showPrintButton}
        handleSort={handleSort}
        sortConfig={sortConfig}
      />

   { showPagination && data.length>0 && <PaginationControls
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      ></PaginationControls>}


   </div>


    </>
  );
}

function App() {
  const [data, setData] = useState([]);





//   const columns = useMemo(() => {
//   if (!data || data.length === 0) return [];
//   return Object.keys(data[0]).map((col) => ({
//     name: col,
//     isSortable: !["body"].includes(col),
//     isShown: !["email"].includes(col),
//     isFixed: ["id", "postId"].includes(col),
//   }));
// }, [data]);

  const columns = data[0]
    ? Object.keys(data[0]).map((col) => ({
        name: col,
        isSortable: !["body"].includes(col),
        isShown: !["email"].includes(col),
        isFixed: ["id", "postId"].includes(col),
      }))
    : [];

  const rowActions = [
    { label: "View", onClick: (row) => alert(JSON.stringify(row, null, 2)) },
    { label: "Delete", onClick: (row) => deleteRow(row) },
  ];

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

  function fetchData() {
    fetch("https://jsonplaceholder.typicode.com/comments")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        console.log("Data fetched:", data);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }



  return (
    <div className="w-screen flex flex-col items-center justify-center min-h-screen font-sans">
   
 <ErrorBoundary>
   <TableControl
        tableTitle="Comments Table"
        data={data}
        columns={columns}
        RowComponent={InlineActionRow} // Or DefaultRow 
        rowActions={rowActions}
        showExportButton={true}
        showPrintButton={true}
        showPagination={true}
        pageSize={100}
      />
 </ErrorBoundary>

      <button className="center-btn" onClick={fetchData}>
        Get Data
      </button>

    </div>
  );
}

export default App;
