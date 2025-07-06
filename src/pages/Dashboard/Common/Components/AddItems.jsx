import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

import PropTypes from "prop-types";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const category_local = [
  "পরিষ্কার পরিচ্ছন্নতা সামগ্রী",
  "বইপত্র ও সাময়িকী",
  "প্রকাশনা",
  "স্বাস্থ্যবিধান সামগ্রী",
  "নিরাপত্তা সামগ্রী",
  "কম্পিউটার সামগ্রী",
  "মুদ্রণ ও বাঁধাই",
  "অন্যান্য মনিহারি",
  "ব্যবহার্য সামগ্রী",
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

const AddItems = ({ block = "head" }) => {
  const axiosPublic = useAxiosPublic();
  const { register, handleSubmit, reset, watch } = useForm();
  const [category, setCategory] = useState("");
  const [specificCategory, setSpecificCategory] = useState("");

  const selectedCategory = watch("category");

  useEffect(() => {
    setCategory(selectedCategory);
  }, [selectedCategory]);

  const onSubmit = async (data) => {
    let imageUrl = "";

    if (data.image && data.image[0]) {
      const formData = new FormData();
      formData.append("image", data.image[0]);

      try {
        const response = await axiosPublic.post(image_hosting_api, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          imageUrl = response.data.data.display_url;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    const items_quantity = {
      item_store: parseInt(data.goodQuantity),
      item_use: 0,
      item_faulty_store: 0,
      item_faulty_use: 0,
      item_transfer: 0,
    };

    const totalQuantity =
      items_quantity.item_store +
      items_quantity.item_use +
      items_quantity.item_faulty_store +
      items_quantity.item_faulty_use +
      items_quantity.item_transfer;

    const item = {
      itemName: data.itemName,
      category: category === "Others" ? specificCategory : category,
      model: data.model,
      origin: data.origin,
      items_quantity,
      locationGood: data.locationGood,
      totalQuantity,
      date: data.date,
      detail: data.detail,
      image: imageUrl,
    };

    try {
      const result = await axiosPublic.post(`/${block}/item`, item);

      if (result.data.insertedId) {
        reset();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `${data.itemName} has been added to the inventory.`,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "An item with the same model already exists.",
        });
      } else {
        console.error("Error adding item:", error);
      }
    }
  };

  const onBlurModel = async () => {
    const modelValue = watch("model");

    try {
      const response = await axiosPublic.get(
        `/${block}/items/model/${modelValue}`
      );

      if (response.data) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "An item with this model already exists in the database!",
        });
      }
    } catch (error) {
      console.error("Error checking item redundancy by model:", error);
    }
  };

  const categories = block === "local" ? category_local : category_head;

  return (
    <div>
      <div className="w-full mx-auto bg-white p-4 my-10 rounded-md shadow-xl md:w-4/5 lg:w-full xl:w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="form-control w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name of the Item<span className="text-red-500 ml-2">*</span>
              </label>
              <input
                type="text"
                  placeholder={block === "head" ? "e.g. PA Module" : "e.g. কলম, কাগজ"}
                {...register("itemName", { required: true })}
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
                className="..."
              >
                <option value="">Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Others">Others</option>
              </select>

              {category === "Others" && (
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
                Model Name<span className="text-red-500 ml-2">*</span>
              </label>
              <input
                type="text"
                  placeholder={block === "head" ? "e.g. FM-10s" : "e.g. Matador All-Time"}
                {...register("model")}
                onBlur={onBlurModel}
                className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
              />
            </div>

            <div className="form-control w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Country Origin<span className="text-red-500 ml-2">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. USA/China/BD"
                {...register("origin", { required: true })}
                required
                className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="form-control w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Item Quantity in Store
                <span className="text-red-500 ml-2">*</span>
              </label>
              <input
                type="number"
                placeholder="Add amount greater than 0"
                {...register("goodQuantity", { required: true })}
                required
                className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="form-control w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Current Location of Good Item
                <span className="text-red-500 ml-2">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. স্টোরে / এফ এম কক্ষে "
                {...register("locationGood", { required: true })}
                required
                className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
              />
            </div>

            <div className="form-control w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date of Receive<span className="text-red-500 ml-2">*</span>
              </label>
              <input
                type="date"
                id="receive"
                {...register("date")}
                className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Detail About the Item
            </label>
            <textarea
              {...register("detail")}
              placeholder="Write about specs, application etc..."
              className="border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="image"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Image of the Item
            </label>
            <input
              type="file"
              id="image"
              {...register("image")}
              className="border rounded w-full py-[6px] px-3 text-gray-700"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="btn w-1/2 mt-10 bg-emerald-700 text-white hover:bg-emerald-900"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddItems.propTypes = {
  block: PropTypes.string,
};

export default AddItems;
