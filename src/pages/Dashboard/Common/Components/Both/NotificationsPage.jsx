import { useCallback, useEffect, useState } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";
import useDownloadPDF from "../../../../../hooks/useDownloadPDF";
import { FiDownload } from "react-icons/fi";

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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const downloadPDF = useDownloadPDF();

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

  // Filtering logic
  useEffect(() => {
    let filtered = [...notifications];

    if (searchTerm.trim()) {
      filtered = filtered.filter((n) =>
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMonth !== "all") {
      filtered = filtered.filter((n) => {
        const date = new Date(n.timestamp);
        return date.getMonth() === parseInt(selectedMonth);
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((n) => {
        const date = new Date(n.timestamp);
        return date >= start && date <= end;
      });
    }

    setFilteredNotifications(filtered);
    setCurrentPage(0); // Reset page when filters change
  }, [notifications, searchTerm, selectedMonth, startDate, endDate]);

  useEffect(() => {
    const isSearchActive = searchTerm.trim() !== "";
    const isMonthActive = selectedMonth !== "all";
    const isDateRangeActive = startDate !== "" && endDate !== "";

    setFilterApplied(isSearchActive || isMonthActive || isDateRangeActive);
  }, [searchTerm, selectedMonth, startDate, endDate]);

  // Pagination calculations
  const totalFiltered = filteredNotifications.length;
  const numberOfPages = Math.ceil(totalFiltered / itemsPerPage);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);

  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  // Render pagination buttons
  const renderPageNumbers = () => {
    const pageNumbers = [];

    for (let i = 0; i < numberOfPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`btn btn-xs mx-1 ${
            i === currentPage ? "bg-emerald-700 text-white" : "bg-gray-200"
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return (
      <div className="mt-4 flex justify-center items-center gap-2">
        <button
          className="btn btn-xs"
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0}
        >
          Prev
        </button>
        {pageNumbers}
        <button
          className="btn btn-xs"
          onClick={() =>
            setCurrentPage((prev) => Math.min(numberOfPages - 1, prev + 1))
          }
          disabled={currentPage === numberOfPages - 1}
        >
          Next
        </button>
      </div>
    );
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
            onClick={() => downloadPDF(notifications, "notifications")}
            className="btn btn-xs sm:btn-sm bg-green-500 text-white flex items-center justify-center"
            title="Download All PDF"
          >
            PDF <FiDownload className="text-lg" />
          </button>

          <button
            onClick={() => downloadPDF(filteredNotifications, "notifications")}
            disabled={!filterApplied}
            className={`btn btn-xs sm:btn-sm flex items-center justify-center text-white ${
              filterApplied ? "bg-green-500" : "bg-gray-300 cursor-not-allowed"
            }`}
            title="Download Filtered PDF"
          >
            Filtered PDF <FiDownload className="text-lg" />
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">All Notifications</h2>

      {loading ? (
        <p>Loading notifications...</p>
      ) : paginatedNotifications.length === 0 ? (
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
              {paginatedNotifications.map((n, idx) => (
                <tr key={n._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">
                    {startIndex + idx + 1}
                  </td>
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
          {/* Pagination Controls */}
          {numberOfPages > 1 && renderPageNumbers()}
          {/* Items per page selector */}
          <div className="flex flex-col lg:flex-row items-center justify-center mt-4">
            <div className="mb-2 lg:mr-6">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(0);
                }}
                className="p-2 border border-teal-400 rounded-lg"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
