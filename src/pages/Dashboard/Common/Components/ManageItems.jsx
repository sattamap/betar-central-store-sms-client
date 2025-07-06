import { useEffect, useState } from "react";

// import { Link, useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaPlusMinus } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";
import Modal from "react-modal";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

Modal.setAppElement("#root");
const ManageItems = ({ block = "head" }) => {
  const axiosPublic = useAxiosPublic();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterApplied, setFilterApplied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    good: "",
    condition: "", // 'add' or 'use'
    locationGood: "",
    purpose: "",
    date: "",
  });

  const [selectedItemData, setSelectedItemData] = useState(null);
  //const [operation, setOperation] = useState("plus");
  //   const outletContext = useOutletContext();
  // const block = outletContext?.block || "head";

  // Fetch items from the API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosPublic.get(`/${block}/items/all`);
        setItems(response.data);

        // Get all available categories from the items
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

  // Filter items based on search term and selected category
  const filteredItems = items.filter((item) => {
      const search = searchTerm.toLowerCase();
    const matchesSearch =
      item.itemName?.toLowerCase().includes(search) ||
      item.model?.toLowerCase().includes(search);
    const matchesCategory =
      selectedCategory === "" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate the total number of filtered items
  const totalFilteredItems = filteredItems.length;

  // Calculate the total number of pages based on the filtered items and items per page
  const numberOfPages = Math.ceil(totalFilteredItems / itemsPerPage);

  // Calculate paginated items
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredItems);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

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

  // Function to generate and download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableData = items.map((item, index) => [
      startIndex + index + 1,
      [`${item.itemName}`, `${item.model}`, `${item.origin}`],
      item?.items_quantity?.item_store,
      item?.items_quantity?.item_use,
      item?.items_quantity?.item_faulty_store,
      item?.items_quantity?.item_faulty_use,
      item?.items_quantity?.item_transfer,
      item.totalQuantity,
      item.locationGood,
      item.category,
      item.date,
    ]);

    doc.autoTable({
      head: [
        [
          "#",
          "Name,Model & Origin",
          "Item (Store)",
          "Item (Use)",
          "Item (Faulty_store)",
          "Item (Faulty_use)",
          "Item (Transfer)",
          "Total item",
          "Location (Good)",
          "Category",
          "Date",
        ],
      ],
      body: tableData,
    });

    doc.save("items.pdf");
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
        "Name,Model & Origin",
        "Item (Store)",
        "Item (Use)",
        "Item (Faulty_store)",
        "Item (Faulty_use)",
        "Item (Transfer)",
        "Total item",
        "Location (Good)",
        "Category & Date",
      ],
    ];
    tableData = filteredItems.map((item, index) => [
      startIndex + index + 1,
      [`${item.itemName}`, `${item.model}`, `${item.origin}`], // Multi-line text array
      item?.items_quantity?.item_store,
      item?.items_quantity?.item_use,
      item?.items_quantity?.item_faulty_store,
      item?.items_quantity?.item_faulty_use,
      item?.items_quantity?.item_transfer,
      item.totalQuantity,
      item.locationGood,
      [`${item.category}`, `${item.date}`], // Multi-line text array
    ]);

    // Generate PDF with the dynamically set headers and table data
    doc.autoTable({
      head: headers,
      body: tableData,
    });

    doc.save("filtered_items.pdf");
  };


  const openModal = (item) => {
    setSelectedItemData(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.condition) throw new Error("Please select an action");
      if (!selectedItemData?._id) throw new Error("Missing item ID");

      const inputQty = Number(formData.good);
      const availableStore = Number(
        selectedItemData.items_quantity?.item_store || 0
      );
      const availableUse = Number(
        selectedItemData.items_quantity?.item_use || 0
      );

      // ❗ Validate input before submit
      if (formData.condition === "use" && inputQty > availableStore) {
        return Swal.fire({
          icon: "error",
          title: "Insufficient Store Quantity",
          text: `Only ${availableStore} items available in store.`,
        });
      }

      if (formData.condition === "faulty_store" && inputQty > availableStore) {
        return Swal.fire({
          icon: "error",
          title: "Insufficient Store Quantity",
          text: `Cannot mark ${inputQty} faulty from store. Only ${availableStore} available.`,
        });
      }

      if (formData.condition === "faulty_use" && inputQty > availableUse) {
        return Swal.fire({
          icon: "error",
          title: "Insufficient Use Quantity",
          text: `Cannot mark ${inputQty} faulty from use. Only ${availableUse} available.`,
        });
      }
      if (formData.condition === "transfer" && inputQty > availableStore) {
        return Swal.fire({
          icon: "error",
          title: "Insufficient Use Quantity",
          text: `Cannot mark ${inputQty} faulty from use. Only ${availableStore} available.`,
        });
      }

      // ✅ Build payload
      const payload = {
        itemName: selectedItemData.itemName,
        model: selectedItemData.model,
        category: selectedItemData.category,
        date: formData.date,
        itemId: selectedItemData._id,
        locationGood: formData.locationGood,
        purpose:
          formData.purpose ||
          (formData.condition === "add"
            ? "To store"
            : formData.condition === "use"
            ? "For use"
            : "Faulty removal"),
        items_quantity: {
          item_store: 0,
          item_use: 0,
          item_faulty_store: 0,
          item_faulty_use: 0,
          item_transfer: 0,
        },
      };

      // ✅ Set status and the corresponding field
      if (formData.condition === "add") {
        payload.status = "pending(add)";
        payload.items_quantity.item_store = inputQty;
      } else if (formData.condition === "use") {
        payload.status = "pending(remove)";
        payload.items_quantity.item_use = inputQty;
      } else if (formData.condition === "faulty_store") {
        payload.status = "pending(remove_fault_store)";
        payload.items_quantity.item_faulty_store = inputQty;
      } else if (formData.condition === "faulty_use") {
        payload.status = "pending(remove_fault_use)";
        payload.items_quantity.item_faulty_use = inputQty;
      } else if (formData.condition === "transfer") {
        payload.status = "pending(transfer)";
        payload.items_quantity.item_transfer = inputQty;
      }

      console.log("Submitting payload:", payload);

      const response = await axiosPublic.post(`/${block}/records`, payload);

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Submitted for approval",
          timer: 1500,
          showConfirmButton: false,
          position: "top-end",
        });

        closeModal();
        setFormData({
          good: "",
          condition: "",
          locationGood: "",
          purpose: "",
          date: "",
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong",
      });
    }
  };

  // Update filterApplied when searchTerm or selectedCondition changes
  useEffect(() => {
    setFilterApplied(
      searchTerm !== "" || selectedCategory !== ""
    );
  }, [searchTerm, selectedCategory]);

  const isFiltered = filteredItems.length > 0 && filterApplied;

  const columns = [
    "#",
    <>
      Name,
      <br />
      Model & Origin
    </>,
    <>
      Item
      <br />
      (Store)
    </>,
    <>
      Location
      <br />
      (Good)
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
      Total
      <br />
      Item
    </>,
    <>
      Category
      <br />& Date
    </>,
    "Action",
  ];

  const tableHeader = (
    <thead>
      <tr>
        {columns.map((column, index) => (
          <th key={index} className="text-center">
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );

  const tableBody = (
    <tbody>
      {paginatedItems.map((item, index) => (
        <tr key={item._id}>
          <td>{startIndex + index + 1}.</td>
          <td>
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="mask mask-squircle w-12 h-12">
                  <img src={item?.image} alt={item?.itemName} />
                </div>
              </div>
              <div>
                <div className="font-bold">{item?.itemName}</div>
                <div className="text-sm opacity-50">{item?.model}</div>
                <div className="text-sm opacity-50">{item?.origin}</div>
              </div>
            </div>
          </td>
          <td>
            <div className="text-sm opacity-50 text-center">
              {item?.items_quantity?.item_store}
            </div>
          </td>
          <td>
            <div className="text-sm opacity-50 text-center">
              {item?.locationGood}
            </div>
          </td>
          <td>
            <div className="text-sm opacity-50 text-center">
              {item?.items_quantity?.item_use}
            </div>
          </td>
          <td>
            <div className="text-sm opacity-50 text-center">
              {item?.items_quantity?.item_faulty_store}
            </div>
          </td>
          <td>
            <div className="text-sm opacity-50 text-center">
              {item?.items_quantity?.item_faulty_use}
            </div>
          </td>
          <td>
            <div className="text-sm opacity-50 text-center">
              {item?.items_quantity?.item_transfer}
            </div>
          </td>
          <td>
            <div className="text-center">
              <p>{item?.totalQuantity}</p>
            </div>
          </td>
          <td>
            <div className="text-center">
              <p>{item?.category}</p>
              <p>{item?.date}</p>
            </div>
          </td>
          <td>
            <div className="flex gap-2 justify-center">
              <Link to={`/${block}/updateItem/${item._id}`}>
                <button className="btn btn-neutral btn-xs">
                  <MdEdit />
                </button>
              </Link>

              <Link to={`/${block}/details/${item._id}`}>
                <button className="btn btn-neutral btn-xs">
                  <CgDetailsMore />
                </button>
              </Link>

              <button
                onClick={() => openModal(item)}
                className="btn btn-neutral btn-xs"
              >
                <FaPlusMinus />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <div>
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:gap-4 items-center justify-center">
                 <div className="md:w-2/5 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search by Item Name or Model"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          <div className="mb-4 md:mb-0">
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
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:border-l-4 md: border-emerald-900">
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
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Submit Item Operation"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
          content: {
            width: "80%",
            maxWidth: "600px",
            height: "auto",
            maxHeight: "80%",
            margin: "auto",
            borderRadius: "8px",
            padding: "30px",
          },
        }}
      >
        <div className="modal-content">
          <button className="modal-close-btn" onClick={closeModal}>
            <svg
              className="h-6 w-6 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h3 className="text-lg font-semibold mb-2">Submit Item Operation</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Item Name and Model */}
            <input
              type="text"
              value={selectedItemData?.itemName || ""}
              readOnly
              className="input input-bordered"
            />
            <input
              type="text"
              value={selectedItemData?.model || ""}
              readOnly
              className="input input-bordered"
            />
            <input
              type="text"
              value={selectedItemData?.category || ""}
              readOnly
              className="input input-bordered"
            />

            {/* Action Selector */}
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="input input-bordered col-span-2"
            >
              <option value="">Select Action</option>
              <option value="add">Add to Store</option>
              <option value="use">Items for Use</option>
              <option value="faulty_store">Remove from Store (Faulty)</option>
              <option value="faulty_use">Remove from Use (Faulty)</option>
              <option value="transfer">Items for Transfer</option>
            </select>

            {/* Show the rest of the form only when an action is selected */}
            {formData.condition && (
              <>
                <input
                  type="number"
                  name="good"
                  value={formData.good}
                  onChange={handleInputChange}
                  placeholder={
                    formData.condition === "add"
                      ? "Quantity to Add"
                      : "Quantity to Remove"
                  }
                  className="input input-bordered"
                />
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="Purpose"
                  className="input input-bordered"
                />
                <input
                  type="text"
                  name="locationGood"
                  value={formData.locationGood}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="input input-bordered"
                />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input input-bordered"
                />
              </>
            )}
          </div>

          <button onClick={handleSubmit} className="btn mt-4">
            Submit for Approval
          </button>
        </div>
      </Modal>
    </div>
  );
};

ManageItems.propTypes = {
  block: PropTypes.string,
};

export default ManageItems;



// import { useCallback, useEffect, useState } from "react";
// import Swal from "sweetalert2";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { FaPlusMinus } from "react-icons/fa6";
// import { MdEdit } from "react-icons/md";
// import { CgDetailsMore } from "react-icons/cg";
// import Modal from "react-modal";
// import useAxiosPublic from "../../../../hooks/useAxiosPublic";
// import PropTypes from "prop-types";
// import { Link } from "react-router-dom";

// Modal.setAppElement("#root");

// const ManageItems = ({ block = "head" }) => {
//   const axiosPublic = useAxiosPublic();
//   const [items, setItems] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [allCategories, setAllCategories] = useState([]);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [itemsPerPage, setItemsPerPage] = useState(5);
//   const [totalCount, setTotalCount] = useState(0);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedItemData, setSelectedItemData] = useState(null);
//   const [formData, setFormData] = useState({
//     good: "",
//     condition: "",
//     locationGood: "",
//     purpose: "",
//     date: "",
//   });
  
//     const [filterApplied, setFilterApplied] = useState(false);
//     const fetchItems = useCallback(async () => {
//     try {
//       const params = {
//         search: searchTerm,
//         category: selectedCategory,
//         page: currentPage + 1,
//         limit: itemsPerPage,
//       };
//       const response = await axiosPublic.get(`/${block}/items`, { params });

//       setItems(response.data.items || []);
//       setAllCategories(response.data.categories || []);
//       setTotalCount(response.data.totalCount || 0);
//     } catch (error) {
//       console.error("Error fetching items:", error);
//     }
//   }, [axiosPublic, block, searchTerm, selectedCategory, currentPage, itemsPerPage]);

//   useEffect(() => {
//     fetchItems();
//   }, [fetchItems]);

//     useEffect(() => {
//     setFilterApplied(searchTerm !== "" || selectedCategory !== "");
//   }, [searchTerm, selectedCategory]);

//   const handleItemsPerPageChange = (e) => {
//     setItemsPerPage(parseInt(e.target.value));
//     setCurrentPage(0);
//   };

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   const handleDownloadPDF = () => {
//     const doc = new jsPDF();
//     const tableData = items.map((item, index) => [
//       currentPage * itemsPerPage + index + 1,
//       `${item.itemName}\n${item.model}\n${item.origin}`,
//       item?.items_quantity?.item_store,
//       item?.locationGood,
//       item?.items_quantity?.item_use,
//       item?.items_quantity?.item_faulty_store,
//       item?.items_quantity?.item_faulty_use,
//       item?.items_quantity?.item_transfer,
//       item?.totalQuantity,
//       `${item.category}\n${item.date}`,
//     ]);

//     doc.autoTable({
//       head: [[
//         "#",
//         "Name, Model & Origin",
//         "Item (Store)",
//         "Location (Good)",
//         "Item (Use)",
//         "Item (Faulty_store)",
//         "Item (Faulty_use)",
//         "Item (Transfer)",
//         "Total Item",
//         "Category & Date"
//       ]],
//       body: tableData,
//     });

//     doc.save("items.pdf");
//   };


//    const handleDownloadFilteredPDF = () => {
//     const doc = new jsPDF();
//     const tableData = items.map((item, index) => [
//       currentPage * itemsPerPage + index + 1,
//       [`${item.itemName}`, `${item.model}`, `${item.origin}`],
//       item?.items_quantity?.item_store,
//       item?.items_quantity?.item_use,
//       item?.items_quantity?.item_faulty_store,
//       item?.items_quantity?.item_faulty_use,
//       item?.items_quantity?.item_transfer,
//       item?.totalQuantity,
//       item?.locationGood,
//       [`${item.category}`, `${item.date}`],
//     ]);

//     doc.autoTable({
//       head: [[
//         "#",
//         "Name,Model & Origin",
//         "Item (Store)",
//         "Item (Use)",
//         "Item (Faulty_store)",
//         "Item (Faulty_use)",
//         "Item (Transfer)",
//         "Total item",
//         "Location (Good)",
//         "Category & Date"
//       ]],
//       body: tableData,
//     });

//     doc.save("filtered_items.pdf");
//   };


//   const openModal = (item) => {
//     setSelectedItemData(item);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setFormData({ good: "", condition: "", locationGood: "", purpose: "", date: "" });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     try {
//       if (!formData.condition) throw new Error("Please select an action");
//       if (!selectedItemData?._id) throw new Error("Missing item ID");

//       const inputQty = Number(formData.good);
//       const availableStore = Number(selectedItemData.items_quantity?.item_store || 0);
//       const availableUse = Number(selectedItemData.items_quantity?.item_use || 0);

//       if (formData.condition === "use" && inputQty > availableStore) {
//         return Swal.fire({ icon: "error", title: "Insufficient Store Quantity", text: `Only ${availableStore} items available in store.` });
//       }
//       if (formData.condition === "faulty_store" && inputQty > availableStore) {
//         return Swal.fire({ icon: "error", title: "Insufficient Store Quantity", text: `Cannot mark ${inputQty} faulty from store. Only ${availableStore} available.` });
//       }
//       if (formData.condition === "faulty_use" && inputQty > availableUse) {
//         return Swal.fire({ icon: "error", title: "Insufficient Use Quantity", text: `Cannot mark ${inputQty} faulty from use. Only ${availableUse} available.` });
//       }
//       if (formData.condition === "transfer" && inputQty > availableStore) {
//         return Swal.fire({ icon: "error", title: "Insufficient Use Quantity", text: `Cannot mark ${inputQty} faulty from use. Only ${availableStore} available.` });
//       }

//       const payload = {
//         itemName: selectedItemData.itemName,
//         model: selectedItemData.model,
//         category: selectedItemData.category,
//         date: formData.date,
//         itemId: selectedItemData._id,
//         locationGood: formData.locationGood,
//         purpose: formData.purpose || (formData.condition === "add" ? "To store" : formData.condition === "use" ? "For use" : "Faulty removal"),
//         items_quantity: {
//           item_store: 0,
//           item_use: 0,
//           item_faulty_store: 0,
//           item_faulty_use: 0,
//           item_transfer: 0,
//         },
//       };

//       if (formData.condition === "add") {
//         payload.status = "pending(add)";
//         payload.items_quantity.item_store = inputQty;
//       } else if (formData.condition === "use") {
//         payload.status = "pending(remove)";
//         payload.items_quantity.item_use = inputQty;
//       } else if (formData.condition === "faulty_store") {
//         payload.status = "pending(remove_fault_store)";
//         payload.items_quantity.item_faulty_store = inputQty;
//       } else if (formData.condition === "faulty_use") {
//         payload.status = "pending(remove_fault_use)";
//         payload.items_quantity.item_faulty_use = inputQty;
//       } else if (formData.condition === "transfer") {
//         payload.status = "pending(transfer)";
//         payload.items_quantity.item_transfer = inputQty;
//       }

//       const response = await axiosPublic.post(`/${block}/records`, payload);

//       if (response.status === 200 || response.status === 201) {
//         Swal.fire({ icon: "success", title: "Submitted for approval", timer: 1500, showConfirmButton: false, position: "top-end" });
//         closeModal();
//       } else {
//         throw new Error("Submission failed");
//       }
//     } catch (error) {
//       console.error("Submit error:", error);
//       Swal.fire({ icon: "error", title: "Error", text: error.message || "Something went wrong" });
//     }
//   };

//   const renderPageNumbers = () => {
//     const numberOfPages = Math.ceil(totalCount / itemsPerPage);
//     const pageNumbers = [];
//     const range = 1;

//     let startPage = Math.max(0, currentPage - range);
//     let endPage = Math.min(numberOfPages - 1, currentPage + range);

//     if (startPage > 0) {
//       pageNumbers.push(<button key={0} className={`btn btn-xs ${currentPage === 0 ? "bg-teal-950 text-white" : "btn-info text-black"}`} onClick={() => handlePageChange(0)}>1</button>);
//       if (startPage > 1) pageNumbers.push(<span key="dots1" className="mx-2">...</span>);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pageNumbers.push(<button key={i} className={`btn btn-xs ${currentPage === i ? "bg-teal-950 text-white" : "btn-info text-black"}`} onClick={() => handlePageChange(i)}>{i + 1}</button>);
//     }

//     if (endPage < numberOfPages - 1) {
//       if (endPage < numberOfPages - 2) pageNumbers.push(<span key="dots2" className="mx-2">...</span>);
//       pageNumbers.push(<button key={numberOfPages - 1} className={`btn btn-xs ${currentPage === numberOfPages - 1 ? "bg-teal-950 text-white" : "btn-info text-black"}`} onClick={() => handlePageChange(numberOfPages - 1)}>{numberOfPages}</button>);
//     }

//     return (
//       <ul className="flex justify-center items-center space-x-2">
//         <li><button className="btn btn-xs btn-info mx-2" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>Previous</button></li>
//         {pageNumbers}
//         <li><button className="btn btn-xs btn-info mx-2" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === numberOfPages - 1}>Next</button></li>
//       </ul>
//     );
//   };


//     const isFiltered = filterApplied && items.length > 0;

//   const columns = [
//     "#",
//     <>
//       Name,
//       <br />
//       Model & Origin
//     </>,
//     <>
//       Item
//       <br />
//       (Store)
//     </>,
//     <>
//       Location
//       <br />
//       (Good)
//     </>,
//     <>
//       Item
//       <br />
//       (Use)
//     </>,
//     <>
//       Item
//       <br />
//       (Faulty_store)
//     </>,
//     <>
//       Item
//       <br />
//       (Faulty_use)
//     </>,
//     <>
//       Item
//       <br />
//       (Transfer)
//     </>,
//     <>
//       Total
//       <br />
//       Item
//     </>,
//     <>
//       Category
//       <br />& Date
//     </>,
//     "Action",
//   ];

//   const tableHeader = (
//     <thead>
//       <tr>
//         {columns.map((column, index) => (
//           <th key={index} className="text-center">
//             {column}
//           </th>
//         ))}
//       </tr>
//     </thead>
//   );

//   const tableBody = (
//     <tbody>
//       {items.map((item, index) => (
//         <tr key={item._id}>
//           <td>{currentPage * itemsPerPage + index + 1}.</td>
//           <td>
//             <div className="flex items-center gap-3">
//               <div className="avatar">
//                 <div className="mask mask-squircle w-12 h-12">
//                   <img src={item?.image} alt={item?.itemName} />
//                 </div>
//               </div>
//               <div>
//                 <div className="font-bold">{item?.itemName}</div>
//                 <div className="text-sm opacity-50">{item?.model}</div>
//                 <div className="text-sm opacity-50">{item?.origin}</div>
//               </div>
//             </div>
//           </td>
//           <td>
//             <div className="text-sm opacity-50 text-center">
//               {item?.items_quantity?.item_store}
//             </div>
//           </td>
//           <td>
//             <div className="text-sm opacity-50 text-center">
//               {item?.locationGood}
//             </div>
//           </td>
//           <td>
//             <div className="text-sm opacity-50 text-center">
//               {item?.items_quantity?.item_use}
//             </div>
//           </td>
//           <td>
//             <div className="text-sm opacity-50 text-center">
//               {item?.items_quantity?.item_faulty_store}
//             </div>
//           </td>
//           <td>
//             <div className="text-sm opacity-50 text-center">
//               {item?.items_quantity?.item_faulty_use}
//             </div>
//           </td>
//           <td>
//             <div className="text-sm opacity-50 text-center">
//               {item?.items_quantity?.item_transfer}
//             </div>
//           </td>
//           <td>
//             <div className="text-center">
//               <p>{item?.totalQuantity}</p>
//             </div>
//           </td>
//           <td>
//             <div className="text-center">
//               <p>{item?.category}</p>
//               <p>{item?.date}</p>
//             </div>
//           </td>
//           <td>
//             <div className="flex gap-2 justify-center">
//               <Link to={`/${block}/updateItem/${item._id}`}>
//                 <button className="btn btn-neutral btn-xs">
//                   <MdEdit />
//                 </button>
//               </Link>

//               <Link to={`/${block}/details/${item._id}`}>
//                 <button className="btn btn-neutral btn-xs">
//                   <CgDetailsMore />
//                 </button>
//               </Link>

//               <button
//                 onClick={() => openModal(item)}
//                 className="btn btn-neutral btn-xs"
//               >
//                 <FaPlusMinus />
//               </button>
//             </div>
//           </td>
//         </tr>
//       ))}
//     </tbody>
//   );

//   return (
//     <div>
//       <div className="mb-4">
//         <div className="flex flex-col md:flex-row md:gap-4 items-center justify-center">
//                  <div className="md:w-2/5 mb-4 md:mb-0">
//             <input
//               type="text"
//               placeholder="Search by Item Name or Model"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="border px-3 py-2 rounded w-full"
//             />
//           </div>
//           <div className="mb-4 md:mb-0">
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               className="input input-bordered w-full md:w-36"
//             >
//               <option value="">All Categories</option>
//               {allCategories.map((category, index) => (
//                 <option key={index} value={category}>
//                   {category}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:border-l-4 md: border-emerald-900">
//             <button
//               onClick={handleDownloadPDF}
//               className="btn btn-xs bg-teal-300 md:btn-sm md:ml-3"
//             >
//               Download PDF
//             </button>
//             <button
//               onClick={handleDownloadFilteredPDF}
//               disabled={!isFiltered}
//               className={`btn ${
//                 isFiltered ? "bg-green-500" : "bg-gray-300"
//               } btn-xs md:btn-sm  text-white`}
//             >
//               Download Filtered PDF
//             </button>
//           </div>
//         </div>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="table table-xs">
//           {tableHeader}
//           {tableBody}
//         </table>
//       </div>
//       <div className="flex flex-col lg:flex-row items-center justify-center mt-4">
//         <div className="mb-4 lg:mb-0 lg:mr-4">
//           <select
//             value={itemsPerPage}
//             onChange={handleItemsPerPageChange}
//             className="p-2 border border-teal-400 rounded-lg"
//           >
//             <option value={5}>5 per page</option>
//             <option value={10}>10 per page</option>
//             <option value={20}>20 per page</option>
//           </select>
//         </div>
//         <nav>{renderPageNumbers()}</nav>
//       </div>

//       <Modal
//         isOpen={isModalOpen}
//         onRequestClose={closeModal}
//         contentLabel="Submit Item Operation"
//         style={{ overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)" }, content: { width: "80%", maxWidth: "600px", margin: "auto", borderRadius: "8px", padding: "30px" } }}
//       >
//         <div className="modal-content">
//           <button className="modal-close-btn" onClick={closeModal}>
//             <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//           <h3 className="text-lg font-semibold mb-2">Submit Item Operation</h3>

//           <div className="grid grid-cols-2 gap-4">
//             <input type="text" value={selectedItemData?.itemName || ""} readOnly className="input input-bordered" />
//             <input type="text" value={selectedItemData?.model || ""} readOnly className="input input-bordered" />
//             <input type="text" value={selectedItemData?.category || ""} readOnly className="input input-bordered" />

//             <select name="condition" value={formData.condition} onChange={handleInputChange} className="input input-bordered col-span-2">
//               <option value="">Select Action</option>
//               <option value="add">Add to Store</option>
//               <option value="use">Items for Use</option>
//               <option value="faulty_store">Remove from Store (Faulty)</option>
//               <option value="faulty_use">Remove from Use (Faulty)</option>
//               <option value="transfer">Items for Transfer</option>
//             </select>

//             {formData.condition && (
//               <>
//                 <input type="number" name="good" value={formData.good} onChange={handleInputChange} placeholder={formData.condition === "add" ? "Quantity to Add" : "Quantity to Remove"} className="input input-bordered" />
//                 <input type="text" name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="Purpose" className="input input-bordered" />
//                 <input type="text" name="locationGood" value={formData.locationGood} onChange={handleInputChange} placeholder="Location" className="input input-bordered" />
//                 <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="input input-bordered" />
//               </>
//             )}
//           </div>

//           <button onClick={handleSubmit} className="btn mt-4">Submit for Approval</button>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// ManageItems.propTypes = {
//   block: PropTypes.string,
// };

// export default ManageItems;


