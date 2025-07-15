import { useForm } from "react-hook-form";
import { useLoaderData } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const UpdateItems = ({ block = "head" }) => {
  const {
    itemName,
    category,
    model,
    origin,
    locationGood,
    date,
    detail,
    _id,
    image,
  } = useLoaderData();

  const axiosPublic = useAxiosPublic();
  const {
    register,
    handleSubmit,
    watch,
  } = useForm();

  const [userSelectedCategory, setUserSelectedCategory] = useState(
    category === "Equipment" || category === "SpareParts" ? category : "Others"
  );
  const [specificCategory, setSpecificCategory] = useState(category);
  const selectedCategory = watch("category");
  const [currentImageUrl, setCurrentImageUrl] = useState(image);

  useEffect(() => {
    setUserSelectedCategory(selectedCategory);
  }, [selectedCategory]);

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
        } else {
          console.error("Image upload failed:", res.data);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    const item = {
      itemName: data.itemName,
      category: data.category === "Others" ? specificCategory : data.category,
      model: data.model,
      origin: data.origin,
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full ">
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

          <div className="form-control w-full ">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Category
            </label>
            <select
              {...register("category")}
              defaultValue={category}
              value={userSelectedCategory}
              onChange={(e) => {
                const selectedValue = e.target.value;
                setUserSelectedCategory(selectedValue);
                if (selectedValue !== "Others") {
                  setSpecificCategory("");
                }
              }}
              className="border rounded w-full py-2 px-3 text-gray-700 text-sm md:text-base"
            >
              <option value="SpareParts">Spare Parts</option>
              <option value="Equipment">Equipment</option>
              <option value="Furniture">Furniture</option>
              <option value="Others">Others</option>
            </select>

            {userSelectedCategory === "Others" && (
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

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full ">
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
          <div className="form-control w-full ">
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
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full ">
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
          <div className="form-control w-full ">
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

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Update Item
        </button>
      </form>
    </div>
  );
};

UpdateItems.propTypes = {
  block: PropTypes.string,
};

export default UpdateItems;
