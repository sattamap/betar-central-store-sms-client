import { useForm } from "react-hook-form";
import { useLoaderData } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const category_local = [
  "পরিষ্কার পরিচ্ছন্নতা সামগ্রী",
  "বইপত্র ও সাময়িকী",
  "প্রকাশনা",
  "নিরাপত্তা সামগ্রী",
  "কম্পিউটার সামগ্রী",
  "মুদ্রণ ও বাঁধাই",
  "অন্যান্য মনিহারি",
  "অনুষ্ঠান/ উৎসবাদি",
  "বাগান পরিচর্যা",
  "বৈদ্যুতিক সরঞ্জামাদি",
  "আসবাবপত্র",
];

const category_head = [
  "বেতার সরঞ্জামাদি",
  "বৈদ্যুতিক সরঞ্জামাদি",
  "কম্পিউটার ও আনুষঙ্গিক",
  "অফিস সরঞ্জামাদি",
  "কাঁচামাল ও খুচরা যন্ত্রাংশ",
  "প্রকৌশল ও অন্যান্য সরঞ্জামাদি",
];

const UpdateItems = ({ block = "head" }) => {
  const {
    itemName,
    category,
    model,
    origin,
    unit, // 👈 existing or newly added unit from DB
    locationGood,
    date,
    detail,
    _id,
    image,
  } = useLoaderData();

  const axiosPublic = useAxiosPublic();
  const { register, handleSubmit } = useForm();

  const [specificCategory, setSpecificCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState(image);

  const categoryOptions = block === "local" ? category_local : category_head;

  useEffect(() => {
    if (category) {
      const categoryInList = categoryOptions.includes(category);
      if (categoryInList) {
        setSelectedCategory(category);
        setSpecificCategory("");
      } else {
        setSelectedCategory("Others");
        setSpecificCategory(category);
      }
    }
  }, [category, categoryOptions, block]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value !== "Others") {
      setSpecificCategory("");
    }
  };

  const onSubmit = async (data) => {
    let imageUrl = currentImageUrl;

    if (data.image && data.image[0]) {
      const formData = new FormData();
      formData.append("image", data.image[0]);

      try {
        const res = await axiosPublic.post(image_hosting_api, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) {
          imageUrl = res.data.data.display_url;
          setCurrentImageUrl(imageUrl);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    const item = {
      itemName: data.itemName,
      category:
        selectedCategory === "Others" ? specificCategory : selectedCategory,
      model: data.model,
      origin: data.origin,
      unit: data.unit, // 👈 include Unit here
      locationGood: data.locationGood,
      date: data.date,
      detail: data.detail,
      image: imageUrl || undefined,
    };

    try {
      const itemResult = await axiosPublic.patch(
        `/${block}/items/${_id}`,
        item
      );
      if (itemResult.data.modifiedCount > 0) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `${data.itemName} has been updated.`,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-4 my-10 rounded-md shadow-xl md:w-4/5 lg:w-full xl:w-full">
      <h2 className="text-2xl font-bold mb-6 w-1/3 mx-auto text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-xl px-6 py-3 text-center shadow-md">
        Update the Item
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Item Name & Category */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name of the Item
            </label>
            <input
              type="text"
              defaultValue={itemName}
              placeholder="e.g. Module"
              {...register("itemName")}
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            />
          </div>

          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Category
            </label>
            <select
              {...register("category")}
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            >
              <option value="">Select Category</option>
              {categoryOptions.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Others">Others</option>
            </select>

            {selectedCategory === "Others" && (
              <div className="mt-2">
                <input
                  type="text"
                  {...register("specificCategory")}
                  placeholder="Specify the category"
                  value={specificCategory}
                  onChange={(e) => setSpecificCategory(e.target.value)}
                  className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
                />
              </div>
            )}
          </div>
        </div>

        {/* Model, Origin & Unit */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Model Name
            </label>
            <input
              type="text"
              defaultValue={model}
              placeholder="e.g. AM-10A"
              {...register("model")}
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            />
          </div>

          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Country Origin
            </label>
            <input
              type="text"
              defaultValue={origin}
              placeholder="e.g. USA"
              {...register("origin")}
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            />
          </div>

          {/* ✅ New Unit field */}
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Unit
            </label>
            <input
              type="text"
              defaultValue={unit}
              placeholder="e.g. pcs / set / box"
              {...register("unit")}
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            />
          </div>
        </div>

        {/* Location & Date */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Location (Good)
            </label>
            <input
              type="text"
              defaultValue={locationGood}
              placeholder="Location of good condition items"
              {...register("locationGood")}
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            />
          </div>

          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date
            </label>
            <input
              type="date"
              defaultValue={date}
              {...register("date")}
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            />
          </div>
        </div>

        {/* Detail */}
        <div className="form-control w-full mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Detail
          </label>
          <textarea
            defaultValue={detail}
            placeholder="Additional details about the item"
            {...register("detail")}
            className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
          ></textarea>
        </div>

        {/* Image Upload */}
        <div className="form-control w-full mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Upload Image
          </label>
          <input
            type="file"
            {...register("image")}
            className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
          />
        </div>

        {currentImageUrl && (
          <div className="form-control w-full mb-6">
            <img src={currentImageUrl} alt="Current" className="w-32 h-32" />
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-emerald-800 hover:shadow-lg transition-all duration-300"
          >
            Update Item
          </button>
        </div>
      </form>
    </div>
  );
};

UpdateItems.propTypes = {
  block: PropTypes.string,
};

export default UpdateItems;
