import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { FaHome, FaSignOutAlt, FaSitemap, FaList } from "react-icons/fa";
import { MdFormatListBulletedAdd, MdEditNote } from "react-icons/md";
import { AuthContext } from "../provider/AuthProvider";
import useAxiosPublic from "../hooks/useAxiosPublic";
import HeadWelcomeMsg from "../pages/Dashboard/HeadOffice/None/HeadWelcomeMsg";
import LocalWelcomeMsg from "../pages/Dashboard/Local/None/LocalWelcomeMsg";

const GenericDashboard = () => {
  const { user, logOut } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const location = useLocation();

  const block = location.pathname.split("/")[1]; // "head" or "local"
  const themeColor = block === "head" ? "#1e3a5f" : "#0f766e";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosPublic.get(`/user/${user.email}`);
        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user, axiosPublic]);

  const handleLogOut = () => {
    logOut()
      .then(() => navigate("/"))
      .catch(console.log);
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  // 🔐 Show WelcomeMsg if no role
  if (userData?.status === "none") {
    return block === "head" ? <HeadWelcomeMsg /> : <LocalWelcomeMsg />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div
        className="w-full lg:w-64 text-white p-4"
        style={{ backgroundColor: themeColor }}
      >
        <div className="text-center mb-4">
          <img
            src={user?.photoURL}
            alt="profile"
            className="w-20 h-20 rounded-full mx-auto"
          />
          <p className="mt-2 font-semibold">{user?.displayName}</p>
          <p className="text-sm">{userData?.designation}</p>
          <p className="bg-blue-100 text-black text-xs mt-1 px-2 py-1 rounded font-semibold shadow-sm">
            Role: <span className="text-sm uppercase font-semibold">{userData?.status}</span>
          </p>
          <p className="bg-emerald-100 text-emerald-800 text-xs mt-1 px-2 py-1 rounded font-semibold shadow-sm">
            Current Block: <span className="text-base uppercase font-bold">{block}</span>
          </p>
        </div>

        <ul className="menu space-y-2">
          {userData?.status === "admin" && (
            <>
              <li>
                <NavLink to="home">
                  <FaHome /> Home
                </NavLink>
              </li>
              <li>
                <NavLink to="addItems">
                  <MdFormatListBulletedAdd /> Add Items
                </NavLink>
              </li>
              <li>
                <NavLink to="adminManageItems">
                  <MdEditNote /> Manage Items
                </NavLink>
              </li>
              <li>
                <NavLink to="adminRecords">
                  <FaList /> Admin Records
                </NavLink>
              </li>
            </>
          )}
          {userData?.status === "coordinator" && (
            <>
              <li>
                <NavLink to="home">
                  <FaHome /> Home
                </NavLink>
              </li>
              <li>
                <NavLink to="addItems">
                  <MdFormatListBulletedAdd /> Add Items
                </NavLink>
              </li>
              <li>
                <NavLink to="manageItems">
                  <MdEditNote /> Manage Items
                </NavLink>
              </li>
              <li>
                <NavLink to="records">
                  <FaList /> Records
                </NavLink>
              </li>
            </>
          )}
          {userData?.status === "monitor" && (
            <>
              <li>
                <NavLink to="home">
                  <FaHome /> Home
                </NavLink>
              </li>
              <li>
                <NavLink to="items">
                  <FaSitemap /> Items
                </NavLink>
              </li>
              <li>
                <NavLink to="records">
                  <FaList /> Records
                </NavLink>
              </li>
            </>
          )}
          <div className="divider" />
          <li>
            <NavLink to="/dashboard/select-block">🔙 Back to Dashboard</NavLink>
          </li>
          <li>
            <button onClick={handleLogOut}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="flex-1 p-6 bg-gray-100">
        <Outlet context={{ block }} />
      </div>
    </div>
  );
};

export default GenericDashboard;
