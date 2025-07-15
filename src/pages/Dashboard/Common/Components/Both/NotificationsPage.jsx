import { useCallback, useEffect, useState } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";
import jsPDF from "jspdf";

const NotificationsPage = () => {
  const axiosPublic = useAxiosPublic();
  const { block } = useOutletContext(); // 'head' or 'local'
  const location = useLocation();
  const module = location.pathname.split("/")[2]; // 'items' or 'services'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    axiosPublic
      .get(`/notifications/all?block=${block}&module=${module}`)
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error("Failed to fetch notifications:", err))
      .finally(() => setLoading(false));
  }, [axiosPublic, block, module]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this notification?"
    );
    if (!confirm) return;

    try {
      await axiosPublic.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  useEffect(() => {
    let filtered = [...notifications];

    // Search by message
    if (searchTerm.trim()) {
      filtered = filtered.filter((n) =>
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by month
    if (selectedMonth !== "all") {
      filtered = filtered.filter((n) => {
        const date = new Date(n.timestamp);
        return date.getMonth() === parseInt(selectedMonth);
      });
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((n) => {
        const date = new Date(n.timestamp);
        return date >= start && date <= end;
      });
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, selectedMonth, startDate, endDate]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableData = notifications.map((n, i) => [
      i + 1,
      n.message,
      n.type,
      new Date(n.timestamp).toLocaleString(),
    ]);

    doc.autoTable({
      head: [["#", "Message", "Type", "Date"]],
      body: tableData,
    });

    doc.save("all_notifications.pdf");
  };

  useEffect(() => {
    const isSearchActive = searchTerm.trim() !== "";
    const isMonthActive = selectedMonth !== "all";
    const isDateRangeActive = startDate !== "" && endDate !== "";

    setFilterApplied(isSearchActive || isMonthActive || isDateRangeActive);
  }, [searchTerm, selectedMonth, startDate, endDate]);

  const handleDownloadFilteredPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredNotifications.map((n, i) => [
      i + 1,
      n.message,
      n.type,
      new Date(n.timestamp).toLocaleString(),
    ]);

    doc.autoTable({
      head: [["#", "Message", "Type", "Date"]],
      body: tableData,
    });

    doc.save("filtered_notifications.pdf");
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mt-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by message"
          className="border px-3 py-2 rounded w-full"
        />

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="all">All Months</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <button
            onClick={handleDownloadPDF}
            className="btn bg-blue-500 text-white btn-sm"
          >
            Download All PDF
          </button>
          <button
            onClick={handleDownloadFilteredPDF}
            disabled={!filterApplied || filteredNotifications.length === 0}
            className={`btn btn-sm text-white ${
              !filterApplied || filteredNotifications.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600"
            }`}
          >
            Download Filtered PDF
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">All Notifications</h2>

      {loading ? (
        <p>Loading notifications...</p>
      ) : filteredNotifications.length === 0 ? (
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
              {filteredNotifications.map((n, idx) => (
                <tr key={n._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">{idx + 1}</td>
                  <td className="px-4 py-2 border text-blue-700">
                    {n.message}
                  </td>
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
