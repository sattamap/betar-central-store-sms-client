import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";


const NotificationsPage = () => {
  const axiosPublic = useAxiosPublic();
  const { block } = useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

 const fetchNotifications = useCallback(() => {
    setLoading(true);
    axiosPublic
      .get(`/notifications/all?block=${block}`)
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error("Failed to fetch notifications:", err))
      .finally(() => setLoading(false));
  }, [axiosPublic, block]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this notification?");
    if (!confirm) return;

    try {
      await axiosPublic.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">All Notifications</h2>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border text-left">Message</th>
                <th className="px-4 py-2 border text-left">Type</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n, idx) => (
                <tr key={n._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{idx + 1}</td>
                  <td className="px-4 py-2 border text-blue-700">{n.message}</td>
                  <td className="px-4 py-2 border text-blue-700">{n.type}</td>
                  <td className="px-4 py-2 border text-center">
                    {new Date(n.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => handleDelete(n._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
