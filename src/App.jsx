import { use, useEffect, useState } from "react";
import "./App.css";

function Table({ data, columns, onDeleteRow, tableTitle = "List" }) {
  if (!data.length || !columns.length) {
    return <p>No data available</p>;
  }

  return (
    <div className="table-container">
      <h2 className="table-title">{tableTitle}</h2>
      <table className="table">
        <thead>
          <tr>
            {columns
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
              columns={columns}
              onDeleteRow={onDeleteRow}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ row, columns, onDeleteRow }) {
  return (
    <tr>
      {columns.map((col) => (
        <td key={col.name}>{row[col.name]}</td>
      ))}

      <td>
        <button
          onClick={() =>
            alert(
              Object.entries(row)
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n")
            )
          }
        >
          View Details
        </button>

        <button onClick={() => onDeleteRow(row)}>Delete</button>
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
  const [filtertxt, setFilterTxt] = useState("");
  const filteredData = filtertxt
    ? data.filter((item) => item.postId === Number(filtertxt))
    : data;

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

        <input
          type="number"
          placeholder="Filter by Post ID"
          value={filtertxt}
          onChange={(e) => setFilterTxt(e.target.value)}
          style={{ margin: "10px", padding: "5px" }}
        />
      </div>

      <Table
        data={currentItems}
        columns={columns}
        onDeleteRow={deleteRow}
        pageSize={pageSize}
        tableTitle="Comments List"
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
