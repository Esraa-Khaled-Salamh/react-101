import { useState } from "react";
import "./App.css"; 

function Table({ data }) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [data,setData] = useState([]);

function fetchData() {
  //setData([]); // Clear existing data before fetching new data]);
  fetch('https://jsonplaceholder.typicode.com/comments')
    .then(response => response.json())
    .then(json => {console.log(json); 
      //setData([...json]);
      setData(json);
    })
    .catch(error => console.error('Error fetching data:', error));
}

  return (
    <>
    <div className="app-container">
      <Table data={data} />
    </div>
    <button className="center-btn" onClick={()=>fetchData()} >Get Data</button>
    </>
    
  );
}

export default App;
