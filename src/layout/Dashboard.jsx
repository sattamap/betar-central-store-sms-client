import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../provider/AuthProvider";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { FaSignOutAlt, FaUsers } from "react-icons/fa";

const Dashboard = () => {
  const { user, logOut, jwtReady } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

 useEffect(() => {
  let retries = 0;
  const maxRetries = 3;

  const fetchUserData = async () => {
    if (!user?.email || !jwtReady) return;
    try {
      const response = await axiosPublic.get(`/user/${user.email}`, {
        withCredentials: true,
      });
      const data = response.data;
      setUserData(Array.isArray(data) ? data[0] : data);
    } catch (error) {
      if (error.response?.status === 401 && retries < maxRetries) {
        retries++;
        setTimeout(fetchUserData, 500 * retries); // Retry after delay
      } else {
        console.error("Error fetching user data:", error.response?.status, error.message);
        navigate("/"); // Redirect to login on persistent failure
      }
    }
  };
  fetchUserData();
}, [user, jwtReady, axiosPublic, navigate]);
 

const handleLogOut = () => {
    logOut()
      .then(() => navigate("/"))
      .catch(console.log);
  };

  if (!user || !jwtReady || !userData) {
    return <div className="text-center mt-10">DB is Loading ...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar - user profile only */}
      <div className="w-full lg:w-52 lg:min-h-screen bg-[#38a9a1] p-2 text-center">
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