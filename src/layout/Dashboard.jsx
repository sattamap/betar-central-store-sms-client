// import { NavLink, Outlet, useNavigate } from "react-router-dom";
// import { useContext, useEffect, useState } from "react";
// import { AuthContext } from "../provider/AuthProvider";
// import useAxiosPublic from "../hooks/useAxiosPublic";
// import { FaHome, FaSignOutAlt, FaSitemap, FaUsers } from "react-icons/fa";
// import { FaList } from "react-icons/fa6";
// import { MdFormatListBulletedAdd } from "react-icons/md";
// import { MdEditNote } from "react-icons/md";

// const Dashboard = () => {
//   const { user, logOut } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState(null);
//   const axiosPublic = useAxiosPublic();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await axiosPublic.get(`/user/${user.email}`);
//         const data = response.data;

//         const userObject = Array.isArray(data) ? data[0] : data;
//         setUserData(userObject);

//         // Determine the default route based on user status and navigate
//         switch (userObject.status) {
//           case "admin":
//             navigate("/dashboard/allUsers");
//             break;
//           case "coordinator":
//             navigate("/dashboard/home");
//             break;
//           case "monitor":
//             navigate("/dashboard/home");
//             break;
//           case "none":
//           default:
//             navigate("/dashboard/none");
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };

//     fetchUserData();
//   }, [user, axiosPublic, navigate]);

//   const handleLogOut = () => {
//     logOut()
//       .then(() => {
//         navigate("/");
//       })
//       .catch((error) => console.log(error));
//   };

//   console.log(userData);
//   return (
//     <div className="flex flex-col lg:flex-row min-h-screen">
//       <div className="w-full lg:w-64 lg:min-h-screen bg-[#38a9a1]">
//         <div className="flex flex-col items-center justify-center p-4">
//           <img
//             src={user?.photoURL}
//             alt="Profile"
//             className="w-20 h-20 rounded-full mr-2"
//           />
//           <span className="text-white text-md font-bold">{user?.displayName}</span>
//           <span className="text-purple-950 text-sm font-medium">{userData?.designation}</span>
//           <span className="text-white text-sm font-medium bg-gradient-to-r from-fuchsia-600 hover:from-pink-500 hover:to-violet-400 p-1 shadow-lg rounded-lg">
//             Current Role: <span className="text-slate-950">{userData?.status}</span>
//           </span>

//         </div>
//         <ul className="menu p-4">
//           {userData?.status === "admin" && (
//             <>
//               <li>
//                 <NavLink to="/dashboard/home">
//                   <FaHome /> Home
//                 </NavLink>
//                 <NavLink to="/dashboard/allUsers">
//                   <FaUsers /> All Users
//                 </NavLink>
//                 <NavLink to="/dashboard/addItems">
//                   <MdFormatListBulletedAdd /> Add Items
//                 </NavLink>
//                 <NavLink to="/dashboard/manageItems">
//                   <MdEditNote /> Manage Items
//                 </NavLink>
//                 <NavLink to="/dashboard/records">
//                   < FaList /> Records
//                 </NavLink>
//               </li>
//             </>
//           )}

//           {userData?.status === "coordinator" && (
//             // Add links specific to the coordinator
//             <li>
//               <NavLink to="/dashboard/home">
//                 <FaHome /> Home
//               </NavLink>
//               <NavLink to="/dashboard/addItems">
//                 <MdFormatListBulletedAdd /> Add Items
//               </NavLink>
//               <NavLink to="/dashboard/manageItems">
//                 <MdEditNote /> Manage Items
//               </NavLink>
//             </li>
//           )}

//           {userData?.status === "monitor" && (
//             <li>
//               <NavLink to="/dashboard/home">
//                 <FaHome /> Home
//               </NavLink>
//               <NavLink to="/dashboard/items">
//                 <FaSitemap /> Items
//               </NavLink>
//             </li>
//           )}

//           {userData?.status === "none" && (
//             // Add links specific to the coordinator
//             <li>
//               <NavLink to="/dashboard/none">
//                 <FaHome /> Home
//               </NavLink>
//             </li>
//           )}
//         </ul>
//         <div className="divider"></div>

//         <li className="menu">
//           <NavLink onClick={handleLogOut}>
//             <FaSignOutAlt /> Logout
//           </NavLink>
//         </li>
//       </div>
//       <div className="flex-1 p-10">
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// src/layout/Dashboard.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../provider/AuthProvider";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { FaSignOutAlt, FaUsers } from "react-icons/fa";

const Dashboard = () => {
  const { user, logOut } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosPublic.get(`/user/${user.email}`);
        const data = response.data;
        setUserData(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [user, axiosPublic]);

  const handleLogOut = () => {
    logOut()
      .then(() => navigate("/"))
      .catch(console.log);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar - user profile only */}
      <div className="w-full lg:w-64 lg:min-h-screen bg-[#38a9a1] p-4 text-center">
        <div className="text-center mb-4">
          <img
            src={user?.photoURL}
            alt="profile"
            className="w-20 h-20 rounded-full mx-auto"
          />
          <p className="mt-2 font-semibold">{user?.displayName}</p>
          <p className="text-sm">{userData?.designation}</p>
          <p className="bg-white text-black text-xs mt-1 px-2 py-1 rounded">
            Role: {userData?.status}
          </p>
        </div>
        <ul className="menu space-y-2">
          {userData?.status === "admin" && (
            <>
              <li>
                <NavLink to="/dashboard/all-users">
                  <FaUsers /> All Users
                </NavLink>
              </li>
            </>
          )}
          <li>
            <NavLink to="/dashboard/select-block">🧭 Choose Block</NavLink>
          </li>
          <li>
            <button onClick={handleLogOut}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </div>
      {/* Main content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
