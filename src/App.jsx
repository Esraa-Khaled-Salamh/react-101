import { use, useEffect,useState } from "react";
import "./App.css"; 


function MyButton({ index,currentPage}) {


  function handleButton(){

    alert(`Button  clicked for row index: ${index} in page : ${currentPage}`);
  }



  return (<button onClick={handleButton}>Details 2</button>);

}



function Table({ data , currentPage, onDeleteRow}) {




  return (
    <div className="table-container">
      <h2 className="table-title">Employee List</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Post ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Body</th>
             <th>Btn 1</th>
             <th>Btn 2</th>
             <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.postId}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.body}</td>
              <td><button onClick={() => alert(`ID: ${row.id}\nPost ID: ${row.postId}\nName: ${row.name}\nEmail: ${row.email}\nBody: ${row.body}`)}>View Details</button></td>
             <td><MyButton currentPage={currentPage} index={row.id}>Button 2</MyButton></td>
             <td><button onClick={()=>onDeleteRow(row.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [data,setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;



 const [filtertxt,setFilterTxt]=useState("");
 const filteredData = filtertxt
  ? data.filter(item => item.postId === Number(filtertxt))
  : data;


   const startIndex = (currentPage - 1) * pageSize;
   const endIndex = startIndex + pageSize;
  const currentItems = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));



 


  function fetchData() {
  fetch('https://jsonplaceholder.typicode.com/comments')
    .then(response => response.json())
    .then(json => {console.log(json); 
      //setData([...json]); law 3yzah y re render w ye7es b ta3'yeer
      setData(json);
        setCurrentPage(1); 
    })
    .catch(error => console.error('Error fetching data:', error));
  }


 function deleteRow(id) {
    const updatedData = data.filter(item => item.id !== id);
    setData(updatedData);
  }

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(data.length / pageSize));
    setCurrentPage((prevPage) => Math.min(prevPage, newTotalPages));

  },[data]);




  function sortByPostIdDesc() { 
    const sortedData = [...data].sort((a, b) => b.postId - a.postId);
    setData(sortedData);
    setCurrentPage(1);
  }


function addRow() {
  const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
  const newRow = {
    postId: Math.floor(Math.random() * 100) + 1,
    id: newId,
    name: `New Name ${newId}`,
    email: "demo@email.com"}

  setData(prevData => [...prevData, newRow]);
  
  //setData(prevData => [newRow,...prevData]);
  //setCurrentPage(1);
}

  return (
    <>
    <div className="app-container">

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
        


         


      <Table data={currentItems} currentPage={currentPage} onDeleteRow={deleteRow} />


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



    </div>
    <button className="center-btn" onClick={()=>fetchData()} >Get Data</button>
    </>
    
  );
}

export default App;
