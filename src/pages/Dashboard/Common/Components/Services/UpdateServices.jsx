import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";
import PropTypes from "prop-types";
import Swal from "sweetalert2";

const UpdateServices = ({ block = "head" }) => {
  const { id } = useParams();
  const serviceData = useLoaderData();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const [service, setService] = useState(serviceData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService((prev) => ({ ...prev, [name]: value.trimStart() }));
  };

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Update Service</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="serviceName"
          value={service.serviceName || ""}
          onChange={handleChange}
          placeholder="Service Name"
          className="input input-bordered w-full"
          required
        />
        <textarea
          name="detail"
          value={service.detail || ""}
          onChange={handleChange}
          placeholder="Detail"
          className="textarea textarea-bordered w-full"
        />
        <input
          type="date"
          name="start_date"
          value={service.start_date || ""}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
        <input
          type="date"
          name="end_date"
          value={service.end_date || ""}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
        <input
          type="text"
          name="category"
          value={service.category || ""}
          onChange={handleChange}
          placeholder="Category"
          className="input input-bordered w-full"
        />
        <input
          type="text"
          name="provider"
          value={service.provider || ""}
          onChange={handleChange}
          placeholder="Provider"
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-neutral w-full">
          Update Service
        </button>
      </form>
    </div>
  );
};

UpdateServices.propTypes = {
  block: PropTypes.string,
};

export default UpdateServices;
