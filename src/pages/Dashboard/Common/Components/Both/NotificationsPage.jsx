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
    // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  // Render pagination buttons
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const range = 1;

    // Calculate the range of page numbers to display around the current page
    let startPage = Math.max(0, currentPage - range);
    let endPage = Math.min(numberOfPages - 1, currentPage + range);

    // Adjust the range if necessary
    if (endPage - startPage < range * 1) {
      startPage = Math.max(0, endPage - range * 1);
      endPage = Math.min(numberOfPages - 1, startPage + range * 1);
    }

    // Always include the first and last page
    if (startPage > 0) {
      pageNumbers.push(
        <button
          key={0}
          className={`btn btn-xs ${
            currentPage === 0 ? "bg-teal-950 text-white" : "btn-info text-black"
          }`}
          onClick={() => handlePageChange(0)}
        >
          1
        </button>
      );
      if (startPage > 1) {
        pageNumbers.push(
          <span key="dots1" className="mx-2">
            ...
          </span>
        );
      }
    }

    // Render page buttons within the range
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`btn btn-xs ${
            currentPage === i ? "bg-teal-950 text-white" : "btn-info text-black"
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i + 1}
        </button>
      );
    }

    // Always include the last page
    if (endPage < numberOfPages - 1) {
      if (endPage < numberOfPages - 2) {
        pageNumbers.push(
          <span key="dots2" className="mx-2">
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={numberOfPages - 1}
          className={`btn btn-xs ${
            currentPage === numberOfPages - 1
              ? "bg-teal-950 text-white"
              : "btn-info text-black"
          }`}
          onClick={() => handlePageChange(numberOfPages - 1)}
        >
          {numberOfPages}
        </button>
      );
    }

    return (
      <ul className="flex justify-center items-center space-x-2">
        <li>
          <button
            className="btn btn-xs btn-info mx-2"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </button>
        </li>
        {pageNumbers}
        <li>
          <button
            className="btn btn-xs btn-info mx-2"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === numberOfPages - 1}
          >
            Next
          </button>
        </li>
      </ul>
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
        </div>
      )}
        {/* Pagination Controls */}
         
          {/* Items per page selector */}
          <div className="flex flex-col lg:flex-row items-center justify-center mt-4">
            <div className="mb-4 lg:mb-0 lg:mr-4">
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
             {numberOfPages > 1 && renderPageNumbers()}
          </div>
    </div>
  );
};

export default NotificationsPage;
