import { useCallback, useEffect, useState } from "react";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";
import PropTypes from "prop-types";
import { MdEdit, MdVisibility } from "react-icons/md";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";

const ManageServices = ({ block = "head" }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterApplied, setFilterApplied] = useState(false);

  const axiosPublic = useAxiosPublic();

  const fetchServices = useCallback(async () => {
    try {
      const res = await axiosPublic.get(`/${block}/services`);
      setServices(res.data);
      setFilteredServices(res.data);

      const categories = [
        ...new Set(res.data.map((s) => s.category).filter(Boolean)),
      ];
      setAllCategories(categories);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  }, [axiosPublic, block]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ✅ Apply search, category, month, and date range filters
  useEffect(() => {
    let filtered = [...services];

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (service) => service.category?.toLowerCase() === categoryFilter
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (service) =>
          service.serviceName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.provider?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ✅ Month Filter
    if (selectedMonth !== "all") {
      filtered = filtered.filter((service) => {
        const monthIndex = new Date(service.start_date).getMonth(); // 0-11
        return monthIndex === parseInt(selectedMonth);
      });
    }

    // ✅ Date Range Filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((service) => {
        const serviceDate = new Date(service.start_date);
        return serviceDate >= start && serviceDate <= end;
      });
    }

    setFilteredServices(filtered);
  }, [categoryFilter, searchTerm, selectedMonth, startDate, endDate, services]);


  const totalFiltered = filteredServices.length;
  const numberOfPages = Math.ceil(totalFiltered / itemsPerPage);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(0);
  }, [categoryFilter, searchTerm, selectedMonth, startDate, endDate]);

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

  // Function to generate and download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableData = services.map((service, index) => [
      startIndex + index + 1,
      service?.serviceName,
      service?.detail,
      service?.start_date,
      service?.end_date,
      service?.category,
      service?.provider,
    ]);

    doc.autoTable({
      head: [
        [
          "#",
          "Service Name",
          "Detail",
          "Start Date",
          "End Date",
          "Category",
          "Provider",
        ],
      ],
      body: tableData,
    });

    doc.save("service.pdf");
  };

  // Function to generate and download PDF for filtered items
  const handleDownloadFilteredPDF = () => {
    const doc = new jsPDF();

    // Define headers and data mapping based on the selected condition
    let headers = [];
    let tableData = [];

    headers = [
      [
        "#",
        "Service Name",
        "Detail",
        "Start Date",
        "End Date",
        "Category",
        "Provider",
      ],
    ];
    tableData = filteredServices.map((service, index) => [
      startIndex + index + 1,
      service?.serviceName,
      service?.detail,
      service?.start_date,
      service?.end_date,
      service?.category,
      service?.provider,
    ]);

    // Generate PDF with the dynamically set headers and table data
    doc.autoTable({
      head: headers,
      body: tableData,
    });

    doc.save("filtered_services.pdf");
  };

  useEffect(() => {
    const hasFilters =
      searchTerm !== "" ||
      categoryFilter !== "all" ||
      selectedMonth !== "all" ||
      (startDate && endDate);
    setFilterApplied(hasFilters);
  }, [searchTerm, categoryFilter, selectedMonth, startDate, endDate]);

  const isFiltered = filteredServices.length > 0 && filterApplied;

  const monthOptions = [
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Manage Services ({block === "head" ? "Head Office" : "Local Office"})
      </h2>

      {/* 🔍 Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Month & Date Filters */}
        <div className="flex flex-col md:flex-row gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="all">All Months</option>
            {monthOptions.map((month, idx) => (
              <option key={month} value={idx}>
                {month}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="border px-3 py-2 rounded w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border px-3 py-2 rounded w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Search & Category Filters */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="md:w-1/4">
            <input
              type="text"
              placeholder="Search by name or provider"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat, idx) => (
                <option key={idx} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col md:flex-row items-center  gap-2 md:gap-4 md:border-l-4 md: border-emerald-900">
            <button
              onClick={handleDownloadPDF}
              className="btn btn-xs bg-teal-300 md:btn-sm md:ml-3"
            >
              Download PDF
            </button>
            <button
              onClick={handleDownloadFilteredPDF}
              disabled={!isFiltered}
              className={`btn ${
                isFiltered ? "bg-green-500" : "bg-gray-300"
              } btn-xs md:btn-sm  text-white`}
            >
              Download Filtered PDF
            </button>
          </div>
        </div>
      </div>

      {paginatedServices.length === 0 ? (
        <p className="text-gray-500">No services found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Service Name</th>
                <th className="px-4 py-2 border">Details</th>
                <th className="px-4 py-2 border">Start Date</th>
                <th className="px-4 py-2 border">End Date</th>
                <th className="px-4 py-2 border">Category</th>
                <th className="px-4 py-2 border">Provider</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedServices.map((service, index) => (
                <tr key={service._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">{service.serviceName}</td>
                  <td className="px-4 py-2 border" title={service.detail}>
                    {service.detail?.length > 30
                      ? `${service.detail.slice(0, 30)}...`
                      : service.detail}
                  </td>
                  <td className="px-4 py-2 border">{service.start_date}</td>
                  <td className="px-4 py-2 border">{service.end_date}</td>
                  <td className="px-4 py-2 border">{service.category}</td>
                  <td className="px-4 py-2 border">{service.provider}</td>
                  <td className="px-4 py-2 border flex gap-2">
                    <Link to={`/${block}/services/details/${service._id}`}>
                      <button className="btn btn-info btn-xs">
                        <MdVisibility />
                      </button>
                    </Link>
                    <Link
                      to={`/${block}/services/updateService/${service._id}`}
                    >
                      <button className="btn btn-neutral btn-xs">
                        <MdEdit />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
        <div className="mb-6">
          {filteredServices.length > 0 && <>{renderPageNumbers()}</>}
        </div>
      </div>
    </div>
  );
};

ManageServices.propTypes = {
  block: PropTypes.string,
};

export default ManageServices;
