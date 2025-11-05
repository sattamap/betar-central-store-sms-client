import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";
import useDownloadPDF from "../../../../../hooks/useDownloadPDF";
import { FiDownload } from "react-icons/fi";

const Items = () => {
  const axiosPublic = useAxiosPublic();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterApplied, setFilterApplied] = useState(false);

  const downloadPDF = useDownloadPDF();

  // Extract block name from the URL path: e.g., /head/items or /local/items
  const block = location.pathname.split("/")[1]; // "head" or "local"

  // Fetch items from block-specific endpoint
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosPublic.get(`/${block}/items`);
        setItems(response.data);
        const categories = [
          ...new Set(response.data.map((item) => item.category)),
        ];
        setAllCategories(categories);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, [axiosPublic, block]);

  const filteredItems = items.filter((item) => {
    const matchesName = item.itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || item.category === selectedCategory;
    return matchesName && matchesCategory;
  });

  const totalFilteredItems = filteredItems.length;
  const numberOfPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredItems);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  useEffect(() => {
    setFilterApplied(searchTerm !== "" || selectedCategory !== "");
  }, [searchTerm, selectedCategory]);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const range = 1;
    let startPage = Math.max(0, currentPage - range);
    let endPage = Math.min(numberOfPages - 1, currentPage + range);

    if (endPage - startPage < range * 1) {
      startPage = Math.max(0, endPage - range * 1);
      endPage = Math.min(numberOfPages - 1, startPage + range * 1);
    }

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
      if (startPage > 1)
        pageNumbers.push(
          <span key="dots1" className="mx-2">
            ...
          </span>
        );
    }

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

    if (endPage < numberOfPages - 1) {
      if (endPage < numberOfPages - 2)
        pageNumbers.push(
          <span key="dots2" className="mx-2">
            ...
          </span>
        );
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

  // const handleDownloadPDF = () => {
  //   const doc = new jsPDF();
  //   const tableData = items.map((item, index) => [
  //     startIndex + index + 1,
  //     [`${item.itemName}`, `${item.model}`, `${item.origin}`],
  //     item?.items_quantity?.item_store,
  //     item?.items_quantity?.item_use,
  //     item?.items_quantity?.item_faulty_store,
  //     item?.items_quantity?.item_faulty_use,
  //     item?.items_quantity?.item_transfer,
  //     item.totalQuantity,
  //     item.locationGood,
  //     item.category,
  //     item.date,
  //   ]);

  //   doc.autoTable({
  //     head: [
  //       [
  //         "#",
  //         "Name,Model & Origin",
  //         "Item (Store)",
  //         "Item (Use)",
  //         "Item (Faulty_store)",
  //         "Item (Faulty_use)",
  //         "Item (Transfer)",
  //         "Total item",
  //         "Location (Good)",
  //         "Category",
  //         "Date",
  //       ],
  //     ],
  //     body: tableData,
  //   });

  //   doc.save(`${block}_items.pdf`);
  // };

  // const handleDownloadFilteredPDF = () => {
  //   const doc = new jsPDF();

  //   // Define headers and data mapping based on the selected condition
  //   let headers = [];
  //   let tableData = [];

  //   headers = [
  //     [
  //       "#",
  //       "Name,Model & Origin",
  //       "Item (Store)",
  //       "Item (Use)",
  //       "Item (Faulty_store)",
  //       "Item (Faulty_use)",
  //       "Item (Transfer)",
  //       "Total item",
  //       "Location (Good)",
  //       "Category & Date",
  //     ],
  //   ];
  //   tableData = filteredItems.map((item, index) => [
  //     startIndex + index + 1,
  //     [`${item.itemName}`, `${item.model}`, `${item.origin}`], // Multi-line text array
  //     item?.items_quantity?.item_store,
  //     item?.items_quantity?.item_use,
  //     item?.items_quantity?.item_faulty_store,
  //     item?.items_quantity?.item_faulty_use,
  //     item?.items_quantity?.item_transfer,
  //     item.totalQuantity,
  //     item.locationGood,
  //     [`${item.category}`, `${item.date}`], // Multi-line text array
  //   ]);

  //   // Generate PDF with the dynamically set headers and table data
  //   doc.autoTable({
  //     head: headers,
  //     body: tableData,
  //   });

  //   doc.save("${block}_filtered_items.pdf");
  // };

  const isFiltered = filteredItems.length > 0 && filterApplied;

  return (
    <div>
      {/* Filter Panel */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by item name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full mb-4"
        />

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input input-bordered w-full md:w-36"
            >
              <option value="">All Categories</option>
              {allCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-row gap-2 border-l-4 border-emerald-900 pl-4">
            <button
              onClick={() => downloadPDF(items, "items")}
              className="btn btn-xs sm:btn-sm bg-green-500 text-white flex items-center justify-center"
              title="Download All PDF"
            >
              PDF <FiDownload className="text-lg" />
            </button>

            <button
              onClick={() => downloadPDF(filteredItems, "items")}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr>
              <th>#</th>
              <th>Name, Model, Origin</th>
              <th className="text-center">Item (Store)</th>
              <th className="text-center">Item (Use)</th>
              <th className="text-center">Faulty (Store)</th>
              <th className="text-center">Faulty (Use)</th>
              <th className="text-center">Item (Transfer)</th>
              <th className="text-center">Category & Date</th>
              <th className="text-center">Location</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item, index) => (
              <tr key={item._id}>
                <td>{startIndex + index + 1}.</td>
                <td>
                  <div className="font-bold">{item?.itemName}</div>
                  <div className="text-sm">{item?.model}</div>
                  <div className="text-sm">{item?.origin}</div>
                </td>
                <td className="text-center">
                  {item?.items_quantity?.item_store}{item?.unit || ""}
                </td>
                <td className="text-center">
                  {item?.items_quantity?.item_use}{item?.unit || ""}
                </td>
                <td className="text-center">
                  {item?.items_quantity?.item_faulty_store}{item?.unit || ""}
                </td>
                <td className="text-center">
                  {item?.items_quantity?.item_faulty_use}{item?.unit || ""}
                </td>
                <td className="text-center">
                  {item?.items_quantity?.item_transfer}{item?.unit || ""}
                </td>
                <td className="text-center">
                  <p>{item?.category}</p>
                  <p>{item?.date}</p>
                </td>
                <td className="text-center">{item?.locationGood}</td>
                <td className="text-center">
                  <Link to={`/${block}/items/details/${item._id}`}>
                    <button className="btn btn-neutral btn-xs">Details</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

export default Items;
