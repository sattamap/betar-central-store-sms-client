import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";
import PropTypes from "prop-types";
import Swal from "sweetalert2";

const categoryOptions_local = [
  "আসবাবপত্র",
  "কম্পিউটার",
  "অন্যান্য যন্ত্রপাতি ও সরঞ্জামাদি",
  "আবাসিক ভবন",
  "অনাবাসিক ভবন",
  "টেলিযোগাযোগ সরঞ্জামাদি",
  "Other",
];
const categoryOptions_head = [
  "অন্যান্য যন্ত্রপাতি ও সরঞ্জামাদি",
  "আবাসিক ভবন",
  "অনাবাসিক ভবন",
  "টেলিযোগাযোগ সরঞ্জামাদি",
  "Other",
];

const UpdateServices = ({ block = "head" }) => {
  const { id } = useParams();
  const serviceData = useLoaderData();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  const [service, setService] = useState(serviceData);
  const [specificCategory, setSpecificCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // ✅ Dynamically select correct category list
  const categoryOptions =
    block === "local" ? categoryOptions_local : categoryOptions_head;

  // ✅ Fix: Recalculate category when serviceData or block changes
  useEffect(() => {
    if (serviceData?.category) {
      const categoryInList = categoryOptions.includes(serviceData.category);

      if (categoryInList) {
        setSelectedCategory(serviceData.category);
        setSpecificCategory("");
      } else {
        setSelectedCategory("Other");
        setSpecificCategory(serviceData.category);
      }
    }
  }, [serviceData, categoryOptions]); // <— updated dependency

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setService((prev) => ({ ...prev, [name]: value.trimStart() }));
  };

  // Handle category select
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value !== "Other") {
      setSpecificCategory("");
      setService((prev) => ({ ...prev, category: value }));
    } else {
      setService((prev) => ({ ...prev, category: "" }));
    }
  };

  // Handle "Other" category input
  const handleSpecificCategoryChange = (e) => {
    const value = e.target.value;
    setSpecificCategory(value);
    setService((prev) => ({ ...prev, category: value }));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosPublic.patch(`/${block}/services/${id}`, service);
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Service updated successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate(`/${block}/services/manageServices`);
    } catch (err) {
      console.error("Update failed:", err);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Failed to update service.",
      });
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-4 my-10 rounded-md shadow-xl md:w-4/5 lg:w-full xl:w-full">
      <h2 className="text-3xl font-extrabold mb-6 w-fit mx-auto text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-lg px-8 py-3 text-center shadow-sm hover:bg-emerald-200 transition-all duration-300">
        Update the Service
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service Name */}
        <div className="form-control w-full">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Service Name
          </label>
          <input
            type="text"
            name="serviceName"
            value={service.serviceName || ""}
            onChange={handleChange}
            placeholder="Service Name"
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* ✅ Category (Dynamic by block) */}
        <div className="form-control w-full">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="border rounded w-full py-2 px-3 text-gray-700"
          >
            <option value="">Select Category</option>
            {categoryOptions.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {selectedCategory === "Other" && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Specify the category"
                value={specificCategory}
                onChange={handleSpecificCategoryChange}
                className="border rounded w-full py-2 px-3 text-gray-700"
              />
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={service.start_date || ""}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={service.end_date || ""}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        {/* Provider */}
        <div className="form-control w-full">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Service Provider
          </label>
          <input
            type="text"
            name="provider"
            value={service.provider || ""}
            onChange={handleChange}
            placeholder="Provider"
            className="input input-bordered w-full"
          />
        </div>

        {/* Details */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Service Details
          </label>
          <textarea
            name="detail"
            value={service.detail || ""}
            onChange={handleChange}
            placeholder="Detail"
            className="textarea textarea-bordered w-full"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-emerald-800 hover:shadow-lg transition-all duration-300"
          >
            Update Service
          </button>
        </div>
      </form>
    </div>
  );
};

UpdateServices.propTypes = {
  block: PropTypes.string,
};

export default UpdateServices;
