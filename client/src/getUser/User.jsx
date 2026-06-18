
/*MERN-STACK>client>src>getUser>User.jsx*/
import React, {useEffect, useState} from "react"
import "./user.css"
import axios from "axios"
const User = () => {
  const [users, setUsers] = useState([]);
  
  const fetchData = async()=>{
    try {
      const response = await axios.get("https://event-app-ed9f.onrender.com/api/user");
      setUsers(response.data);
    } catch (error) {
      console.log("error while fetching data from database", error);
    }
  };
  
  useEffect(()=>{
    fetchData();
  }, []);


  return (
    <div className="userTable">
      <button type="button" className="btn btn-primary">Add User 
      <i className="fa fa-user-plus" aria-hidden="true"></i>
      </button>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th scope="col">S.No.</th>
            <th scope = "col">Name</th>
            <th scope = "col">Email</th>
            <th scope = "col">Adress</th>
            <th scope = "col">Actions</th>
          </tr>
        </thead>
          <tbody>
            {users.map((user, index)=>{
              return(
                <tr>
                  <td>{index+1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td  className="actionButtons">
                    <button type="button" class="btn btn-info">
                      <i className="fa fa-pencil" aria-hidden="true"></i> 
                    </button>
                    <button type="button" class="btn btn-danger"> 
                      <i className="fa fa-eraser" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
      </table>
    </div>
  )
}
export default User
