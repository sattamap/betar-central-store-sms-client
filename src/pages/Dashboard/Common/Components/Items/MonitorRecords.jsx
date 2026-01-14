import { useEffect, useState } from "react";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import useDownloadPDF from "../../../../../hooks/useDownloadPDF";
import { FiDownload } from "react-icons/fi";

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

const MonitorRecords = ({ block = "head" }) => {
  const axiosPublic = useAxiosPublic();
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterApplied, setFilterApplied] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const downloadPDF = useDownloadPDF();

  // Fetch items from the API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosPublic.get(`/${block}/records`);
        setRecords(response.data);

        // Get all available categories from the items
        const categories = [
          ...new Set(response.data.map((record) => record.category)),
        ];
        setAllCategories(categories);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, [axiosPublic, records, block]);

  // Replace handleApprove with handleForwardToAdmin
  const handleAcceptByMonitor = async (id) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: "Accept this record?",
        text: "This will complete the workflow.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Accept",
      });

      if (!isConfirmed) return;

      await axiosPublic.patch(`/${block}/records/accept-by-monitor/${id}`);

      setRecords((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, workflowStatus: "accepted_by_monitor" } : r
        )
      );

      Swal.fire({
        icon: "success",
        title: "Accepted",
        text: "Record accepted successfully",
      });
    } catch (err) {
      console.error("Accept by monitor error", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not accept record",
      });
    }
  };

  // const handleDecline = async (id) => {
  //     try {
  //         const { isConfirmed } = await Swal.fire({
  //             title: "Are you sure you want to decline this record?",
  //             icon: "warning",
  //             showCancelButton: true,
  //             confirmButtonText: "Decline",
  //             cancelButtonText: "Cancel",
  //             reverseButtons: true,
  //         });

  //         if (isConfirmed) {
  //             await axiosPublic.delete(`/${block}/records/${id}`);
  //             setRecords(records.filter((record) => record._id !== id));
  //             Swal.fire({
  //                 icon: "success",
  //                 title: "Record Declined!",
  //                 text: "The record has been successfully declined.",
  //             });
  //         }
  //     } catch (error) {
  //         console.error("Error declining record:", error);
  //         Swal.fire({
  //             icon: "error",
  //             title: "Oops...",
  //             text: "An error occurred while declining the record.",
  //         });
  //     }
  // };

  // Filter items based on search term and selected category

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
    const matchesCategory =
      selectedCategory === "" || record.category === selectedCategory;

    return (
      matchesSearch &&
      matchesType &&
      matchesMonth &&
      matchesRange &&
      matchesCategory
    );
  });

  // Calculate the total number of filtered items
  const totalFilteredItems = filteredRecords.length;

  // Calculate the total number of pages based on the filtered items and items per page
  const numberOfPages = Math.ceil(totalFilteredItems / itemsPerPage);

  // Calculate paginated items
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredItems);
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Update the current page when search term or selected condition changes
  useEffect(() => {
    setCurrentPage(0);
  }, [setSearchTerm]);

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

  // Update filterApplied when searchTerm or selectedCondition changes  setFilterType   setSelectedMonth setDateRange
  useEffect(() => {
    const isAnyFilterApplied =
      searchTerm.trim() !== "" ||
      filterType !== "all" ||
      selectedCategory !== "" ||
      selectedMonth !== "All" ||
      (dateRange.start !== "" && dateRange.end !== "");

    setFilterApplied(isAnyFilterApplied);
  }, [searchTerm, filterType, selectedCategory, selectedMonth, dateRange]);

  const isFiltered = filteredRecords.length > 0 && filterApplied;

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
  };

  // =======================
  // TABLE COLUMNS
  // =======================
  const columns = [
    "#",
    <>
      Name
      <br />
      Model & Category
    </>,
    <>
      Item
      <br />
      (Store)
    </>,
    <>
      Item
      <br />
      (Use)
    </>,
    <>
      Item
      <br />
      (Faulty_store)
    </>,
    <>
      Item
      <br />
      (Faulty_use)
    </>,
    <>
      Item
      <br />
      (Transfer)
    </>,
    <>
      Purpose
      <br />
      Location
    </>,
    <>Date</>,
    <>Participants</>,
    <>
      Request Type
      <br />
      Workflow Status
    </>,
    <>Action</>,
  ];

  // =======================
  // TABLE HEADER
  // =======================
  const tableHeader = (
    <thead>
      <tr>
        {columns.map((column, index) => (
          <th key={index} className="text-center border text-xs">
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );

  // =======================
  // TABLE BODY
  // =======================
  const tableBody = (
    <tbody>
      {paginatedRecords.map((item, index) => (
        <tr key={item._id}>
          {/* SL */}
          <td className="border text-center">{startIndex + index + 1}.</td>

          {/* ITEM INFO */}
          <td className="border px-2">
            <div className="font-bold">{item?.itemName}</div>
            <div className="text-xs opacity-70">({item?.model})</div>
            <div className="text-xs font-semibold opacity-80">
              [{item?.category}]
            </div>
          </td>

          {/* STORE */}
          <td className="border text-center text-sm">
            {item?.items_quantity?.item_store} {item?.unit || ""}
          </td>

          {/* USE */}
          <td className="border text-center text-sm">
            {item?.items_quantity?.item_use} {item?.unit || ""}
          </td>

          {/* FAULTY STORE */}
          <td className="border text-center text-sm">
            {item?.items_quantity?.item_faulty_store} {item?.unit || ""}
          </td>

          {/* FAULTY USE */}
          <td className="border text-center text-sm">
            {item?.items_quantity?.item_faulty_use} {item?.unit || ""}
          </td>

          {/* TRANSFER */}
          <td className="border text-center text-sm">
            {item?.items_quantity?.item_transfer} {item?.unit || ""}
          </td>

          {/* PURPOSE + LOCATION */}
          <td className="border text-xs px-2">
            <div>
              <span className="font-semibold">Purpose:</span>
              <div className="opacity-80">{item?.purpose || "-"}</div>
            </div>
            <div className="mt-1">
              <span className="font-semibold">Location:</span>
              <div className="opacity-80">{item?.locationGood || "-"}</div>
            </div>
          </td>

          {/* DATE */}
          <td className="border text-center text-xs">
            {formatDate(item?.date)}
          </td>

          {/* PARTICIPANTS */}
          <td className="border text-xs px-2">
            <div className="space-y-0.5">
              {item?.requestedBy?.name && (
                <div>
                  <span className="font-semibold">চাহিদাকারী:</span> <br />
                  {item.requestedBy.name}
                </div>
              )}

              {item?.forwardedBy?.name && (
                <div>
                  <span className="font-semibold">স্টোরকিপার:</span> <br />
                  {item.forwardedBy.name}
                </div>
              )}

              {item?.finalApprovedBy?.name && (
                <div>
                  <span className="font-semibold">অনুমোদনকারী:</span> <br />
                  {item.finalApprovedBy.name}
                </div>
              )}

              {item?.acceptedBy?.name && (
                <div className="text-green-600 font-semibold">
                  ✔ গ্রহণকারী: <br /> {item.acceptedBy.name}
                </div>
              )}
            </div>
          </td>

          {/* STATUS */}
          <td className="py-2 px-3 text-center border">
            <div>
              <span className="badge bg-gray-300 text-xs text-black">
                {item?.actionStatus}
              </span>
            </div>
            <div className="mt-1">
              <span className="badge bg-blue-600 text-xs text-white">
                {item?.workflowStatus}
              </span>
            </div>
          </td>

          {/* ACTION */}
          <td className="border text-center">
            {item?.workflowStatus === "sent_back_to_monitor" && (
              <button
                onClick={() => handleAcceptByMonitor(item._id)}
                className="btn btn-xs bg-green-600 text-white"
              >
                Accept
              </button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  );

  // =======================
  // FINAL TABLE
  // =======================

  return (
    <div className="mt-4">
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-2 items-center justify-center">
          {/* 1/4 section */}
          <div className="w-full md:w-2/5 lg:mr-6">
            <input
              type="text"
              placeholder="Search by Item Name or Model"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* 3/4 section */}
          <div className="w-full md:w-3/5 flex flex-col md:flex-row gap-1">
            <div>
              <label className="font-medium">Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border px-3 py-1 rounded w-full md:w-auto"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium">From:</label>
              <input
                type="date"
                className="border px-3 py-1 rounded w-full md:w-auto"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="font-medium">To:</label>
              <input
                type="date"
                className="border px-3 py-1 rounded w-full md:w-auto"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center md:gap-6">
          {/* Filter by Type */}
          <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center">
            <label className="font-medium text-sm mb-1 md:mb-0 md:mr-2">
              Filter by Type:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full md:w-auto border px-3 py-2 rounded"
            >
              <option value="all">All</option>
              <option value="store">Item (Store)</option>
              <option value="use">Item (Use)</option>
              <option value="faulty_store">Item (Faulty Store)</option>
              <option value="faulty_use">Item (Faulty Use)</option>
              <option value="transfer">Item (Transfer)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-52 border px-3 py-2 rounded"
            >
              <option value="">All Categories</option>
              {allCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 md:pl-4 md:border-l-4 border-emerald-900">
            <button
              onClick={() => downloadPDF(records, "records")}
              className="btn btn-xs sm:btn-sm bg-green-500 text-white flex items-center justify-center"
              title="Download All PDF"
            >
              PDF <FiDownload className="text-lg" />
            </button>

            <button
              onClick={() => downloadPDF(filteredRecords, "records")}
              disabled={!isFiltered}
              className={`btn btn-xs sm:btn-sm flex items-center justify-center text-white ${
                isFiltered ? "bg-green-500" : "bg-gray-300 cursor-not-allowed"
              }`}
              title="Download Filtered PDF"
            >
              Filtered PDF <FiDownload className="text-lg" />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-xs">
          {tableHeader}
          {tableBody}
        </table>
      </div>
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

MonitorRecords.propTypes = {
  block: PropTypes.string,
};

export default MonitorRecords;
