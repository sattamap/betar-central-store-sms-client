import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useState } from "react";
import PropTypes from "prop-types";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";

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

const AddServices = ({ block = "head" }) => {
  const axiosPublic = useAxiosPublic();
  const { register, handleSubmit, reset, watch } = useForm();
  const [specificCategory, setSpecificCategory] = useState("");

  const category = watch("category");
  const categoryOptions =
    block === "local" ? categoryOptions_local : categoryOptions_head;

  const onSubmit = async (data) => {
    const service = {
      serviceName: data.serviceName,
      detail: data.detail,
      start_date: data.start_date,
      end_date: data.end_date,
      category: category === "Other" ? specificCategory : category,
      provider: data.provider,
    };

    try {
      const result = await axiosPublic.post(`/${block}/service`, service);

      if (result.data.insertedId) {
        reset();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `${data.serviceName} has been added successfully!`,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error adding service:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to add the service.",
      });
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-4 my-10 rounded-md shadow-xl md:w-4/5 lg:w-full xl:w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Service Name
            </label>
            <input
              type="text"
              placeholder="e.g. Air Conditioner Maintenance"
              {...register("serviceName", { required: true })}
              required
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            />
          </div>

          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Category<span className="text-red-500 ml-2">*</span>
            </label>
            <select
              {...register("category", { required: true })}
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            >
              <option value="">Select Category</option>
              {categoryOptions.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {category === "Other" && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Specify the category"
                  value={specificCategory}
                  onChange={(e) => setSpecificCategory(e.target.value)}
                  className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Start Date<span className="text-red-500 ml-2">*</span>
            </label>
            <input
              type="date"
              {...register("start_date", { required: true })}
              required
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            />
          </div>

          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              End Date<span className="text-red-500 ml-2">*</span>
            </label>
            <input
              type="date"
              {...register("end_date", { required: true })}
              required
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Service Provider<span className="text-red-500 ml-2">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ABC Maintenance Ltd."
              {...register("provider", { required: true })}
              required
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Service Details
          </label>
          <textarea
            {...register("detail")}
            placeholder="Write about the service scope, terms, etc..."
            className="border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="btn mt-10 bg-emerald-700 text-white hover:bg-emerald-900"
          >
            Add Service
          </button>
        </div>
      </form>
    </div>
  );
};

AddServices.propTypes = {
  block: PropTypes.string,
};

export default AddServices;
