import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";
const months = [
  "All",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const AdminRecords = ({ block = "head" }) => {
  const axiosPublic = useAxiosPublic();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  //const [filterApplied, setFilterApplied] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axiosPublic.get(`/${block}/records`);
        setRecords(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching records:", error);
        setLoading(false);
      }
    };
    fetchRecords();
  }, [axiosPublic, block]);

  const isRecordInDateRange = (recordDate) => {
    const date = new Date(recordDate);
    const start = dateRange.start ? new Date(dateRange.start) : null;
    const end = dateRange.end ? new Date(dateRange.end) : null;

    if (start && date < start) return false;
    if (end && date > end) return false;

    return true;
  };

  const isRecordInSelectedMonth = (recordDate) => {
    if (selectedMonth === "All") return true;
    const date = new Date(recordDate);
    const monthIndex = date.getMonth(); // 0-based
    return months[monthIndex + 1] === selectedMonth;
  };

  const filteredRecords = records.filter((record) => {
    const qty = record.items_quantity || {};

    const matchesType =
      filterType === "store"
        ? qty.item_store > 0
        : filterType === "use"
        ? qty.item_use > 0
        : filterType === "faulty_store"
        ? qty.item_faulty_store > 0
        : filterType === "faulty_use"
        ? qty.item_faulty_use > 0
        : filterType === "transfer"
        ? qty.item_transfer > 0
        : true;

    const matchesMonth = isRecordInSelectedMonth(record.date);
    const matchesRange = isRecordInDateRange(record.date);

    const search = searchTerm.toLowerCase();
    const matchesSearch =
      record.itemName?.toLowerCase().includes(search) ||
      record.model?.toLowerCase().includes(search);

    return matchesType && matchesMonth && matchesRange && matchesSearch;
  });

  // Calculate the total number of filtered items
  const totalFilteredItems = filteredRecords.length;

  // Calculate the total number of pages based on the filtered items and items per page
  const numberOfPages = Math.ceil(totalFilteredItems / itemsPerPage);

  // Calculate paginated items
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredItems);
  const paginatedItems = filteredRecords.slice(startIndex, endIndex);

  // Update the current page when search term or selected condition changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Handle changes in items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(0); // Reset current page
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Rendering page numbers
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
      <h2 className="text-xl font-semibold mb-4 capitalize">{block} Records</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Item Name or Model"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/2"
        />
      </div>
      {/* Filter Dropdown */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
        <div>
          <label className="font-medium mr-2">Filter by Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="all">All</option>
            <option value="store">Item (Store)</option>
            <option value="use">Item (Use)</option>
            <option value="faulty_store">Item (Faulty Store)</option>
            <option value="faulty_use">Item (Faulty Use)</option>
            <option value="transfer">Item (Transfer)</option>
          </select>
        </div>

        <div>
          <label className="font-medium mr-2">Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium mr-2">From:</label>
          <input
            type="date"
            className="border px-3 py-1 rounded"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="font-medium mr-2">To:</label>
          <input
            type="date"
            className="border px-3 py-1 rounded"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto max-h-[500px] border border-gray-300 rounded-md">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="sticky top-0 bg-gray-200 text-gray-700 uppercase text-xs shadow z-10">
              <tr>
                <th className="py-2 px-3 text-center border">S.No.</th>
                <th className="py-2 px-3 text-center border">Item Name</th>
                <th className="py-2 px-3 text-center border">Model</th>
                <th className="py-2 px-3 text-center border">
                  Item <br /> (Store)
                </th>
                <th className="py-2 px-3 text-center border">
                  Item <br /> (Use)
                </th>
                <th className="py-2 px-3 text-center border">
                  Item <br /> (Faulty Store)
                </th>
                <th className="py-2 px-3 text-center border">
                  Item <br /> (Faulty Use)
                </th>
                <th className="py-2 px-3 text-center border">
                  Item <br /> (Transfer)
                </th>
                <th className="py-2 px-3 text-center border">Purpose</th>
                <th className="py-2 px-3 text-center border">Location</th>
                <th className="py-2 px-3 text-center border">Date</th>
                <th className="py-2 px-3 text-center border">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((record, index) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-center border">{index + 1}</td>
                  <td className="py-2 px-3 text-center border">
                    {record.itemName}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.model}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.items_quantity?.item_store}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.items_quantity?.item_use}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.items_quantity?.item_faulty_store}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.items_quantity?.item_faulty_use}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.items_quantity?.item_transfer}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.purpose}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.locationGood}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.date}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-center justify-center mt-4">
        <div className="mb-4 lg:mb-0 lg:mr-4">
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-2 border border-teal-400 rounded-lg"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
          </select>
        </div>
        <nav>{renderPageNumbers()}</nav>
      </div>
    </div>
  );
};

AdminRecords.propTypes = {
  block: PropTypes.string,
};

export default AdminRecords;

