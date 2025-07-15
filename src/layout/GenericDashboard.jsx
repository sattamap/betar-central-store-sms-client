import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import {
  FaHome,
  FaSignOutAlt,
  FaSitemap,
  FaList,
  FaBell,
} from "react-icons/fa";
import {
  MdFormatListBulletedAdd,
  MdEditNote,
  MdNotificationsActive,
} from "react-icons/md";
import { AuthContext } from "../provider/AuthProvider";
import useAxiosPublic from "../hooks/useAxiosPublic";
import HeadWelcomeMsg from "../pages/Dashboard/HeadOffice/Items/None/HeadWelcomeMsg";
import LocalWelcomeMsg from "../pages/Dashboard/Local/Items/None/LocalWelcomeMsg";

const GenericDashboard = () => {
  const { user, logOut } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const location = useLocation();
  const block = location.pathname.split("/")[1];
  const subBlock = location.pathname.split("/")[2]; // 'items' or 'services'
  console.log("Subblock",subBlock)

  const themeColor = block === "head" ? "#1e3a5f" : "#0f766e";

  // ✅ Fetch user data
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

  // ✅ Fetch notification count (filtered by block and module)
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await axiosPublic.get(
          `/notifications/count?block=${block}&module=${subBlock}`
        );
        setNotificationCount(res.data.count);
      } catch (err) {
        console.error("Failed to fetch notification count:", err);
      }
    };

    if (userData?.status === "admin") {
      fetchNotificationCount();
    }
  }, [axiosPublic, userData, block, subBlock]);

  // ✅ Fetch notifications (paginated)
  const fetchNotifications = async (initial = false) => {
    try {
      const res = await axiosPublic.get(
        `/notifications?block=${block}&module=${subBlock}&skip=${initial ? 0 : skip}&limit=5`
      );
      if (initial) {
        setNotifications(res.data);
        setSkip(5);
      } else {
        if (res.data.length === 0) {
          setHasMore(false);
        } else {
          setNotifications((prev) => [...prev, ...res.data]);
          setSkip(skip + 5);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // ✅ Mark all as seen
  const markAllAsSeen = async () => {
    try {
      await axiosPublic.patch(`/notifications/mark-all?block=${block}&module=${subBlock}`);
      setNotificationCount(0);
    } catch (err) {
      console.error("Failed to mark notifications as seen:", err);
    }
  };

  // ✅ Handle bell icon
  const handleBellClick = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      await fetchNotifications(true);
      await markAllAsSeen();
    }
  };

  const handleLogOut = () => {
    logOut()
      .then(() => navigate("/"))
      .catch(console.log);
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  if (userData?.status === "none") {
    return block === "head" ? <HeadWelcomeMsg /> : <LocalWelcomeMsg />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* ✅ Sidebar */}
      <div className="w-full lg:w-64 text-white p-4" style={{ backgroundColor: themeColor }}>
        <div className="text-center mb-4">
          <img
            src={user?.photoURL}
            alt="profile"
            className="w-20 h-20 rounded-full mx-auto"
          />
          <p className="mt-2 font-semibold">{user?.displayName}</p>
          <p className="text-sm">{userData?.designation}</p>
          <p className="bg-blue-100 text-black text-xs mt-1 px-2 py-1 rounded font-semibold shadow-sm">
            Role: <span className="uppercase font-semibold">{userData?.status}</span>
          </p>
          <p className="bg-emerald-100 text-emerald-800 text-xs mt-1 px-2 py-1 rounded font-semibold shadow-sm">
            Current Block: <span className="uppercase font-bold">{block}</span>
          </p>
        </div>

        {/* ✅ Navigation Menu */}
        <ul className="menu space-y-2">
          {subBlock === "items" && (
            <>
              {userData?.status === "admin" && (
                <>
                  <li><NavLink to="items/home"><FaHome /> Home</NavLink></li>
                  <li><NavLink to="items/addItems"><MdFormatListBulletedAdd /> Add Items</NavLink></li>
                  <li><NavLink to="items/adminManageItems"><MdEditNote /> Manage Items</NavLink></li>
                  <li><NavLink to="items/adminRecords"><FaList /> Admin Records</NavLink></li>
                  <li><NavLink to="items/adminNotifications"><MdNotificationsActive /> All Notifications</NavLink></li>
                </>
              )}
              {userData?.status === "coordinator" && (
                <>
                  <li><NavLink to="items/home"><FaHome /> Home</NavLink></li>
                  <li><NavLink to="items/addItems"><MdFormatListBulletedAdd /> Add Items</NavLink></li>
                  <li><NavLink to="items/manageItems"><MdEditNote /> Manage Items</NavLink></li>
                  <li><NavLink to="items/records"><FaList /> Records</NavLink></li>
                </>
              )}
              {userData?.status === "monitor" && (
                <>
                  <li><NavLink to="items/home"><FaHome /> Home</NavLink></li>
                  <li><NavLink to="items/allItems"><FaSitemap /> Items</NavLink></li>
                  <li><NavLink to="items/records"><FaList /> Records</NavLink></li>
                </>
              )}
            </>
          )}

          {subBlock === "services" && (
            <>
              {userData?.status === "admin" && (
                <>
                  <li><NavLink to="services/home"><FaHome /> Home</NavLink></li>
                  <li><NavLink to="services/addServices"><MdFormatListBulletedAdd /> Add Service</NavLink></li>
                  <li><NavLink to="services/adminManageServices"><MdEditNote /> Manage Service</NavLink></li>
                  <li><NavLink to="services/adminNotifications"><MdNotificationsActive /> All Notifications</NavLink></li>
                </>
              )}
              {userData?.status === "coordinator" && (
                <>
                  <li><NavLink to="services/home"><FaHome /> Home</NavLink></li>
                  <li><NavLink to="services/addServices"><MdFormatListBulletedAdd /> Add Service</NavLink></li>
                  <li><NavLink to="services/manageServices"><MdEditNote /> Manage Service</NavLink></li>
                </>
              )}
              {userData?.status === "monitor" && (
                <>
                  <li><NavLink to="services/home"><FaHome /> Home</NavLink></li>
                  <li><NavLink to="services/allServices"><FaSitemap /> All Service</NavLink></li>
                </>
              )}
            </>
          )}

          <div className="divider" />
          <li><NavLink to="/dashboard/select-block">🔙 Back to Dashboard</NavLink></li>
          <li>
            <button onClick={handleLogOut}>
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </div>

      {/* ✅ Main Content */}
      <div className="flex-1 p-6 bg-gray-100 relative">
        {/* ✅ Notification Bell */}
        {userData?.status === "admin" && (
          <div className="absolute top-4 right-6 mb-10">
            <div className="relative">
              <button
                className="relative p-3 rounded-full bg-white shadow hover:bg-gray-100 transition"
                onClick={handleBellClick}
              >
                <FaBell className="text-gray-700" size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 flex items-center justify-center">
                    {notificationCount > 9 ? (
                      <>
                        9<sup className="ml-0.5 text-[9px]">+</sup>
                      </>
                    ) : (
                      notificationCount
                    )}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white border shadow-lg rounded-lg p-3 z-20">
                  <h4 className="font-semibold mb-2 text-gray-800">Notifications</h4>
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No notifications</p>
                  ) : (
                    <ul className={`space-y-2 ${showAll ? "max-h-64 overflow-y-auto" : ""}`}>
                      {notifications.map((n, idx) => (
                        <li key={idx} className="border-b pb-2 text-sm text-blue-700">
                          {n.message}
                          <div className="text-gray-400 text-xs">
                            {new Date(n.timestamp).toLocaleString()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!showAll && hasMore && (
                    <button
                      onClick={() => {
                        fetchNotifications();
                        setShowAll(true);
                      }}
                      className="mt-2 text-blue-600 text-xs hover:underline"
                    >
                      See Previous Notifications →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <Outlet context={{ block }} />
      </div>
    </div>
  );
};

export default GenericDashboard;
