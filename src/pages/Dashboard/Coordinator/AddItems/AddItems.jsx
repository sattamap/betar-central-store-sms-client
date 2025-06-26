import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";
import { useEffect, useState } from "react";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const AddItems = () => {
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
    };

    const totalQuantity = items_quantity.item_store + items_quantity.item_use + items_quantity.item_faulty_store+items_quantity.item_faulty_use;

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
      const result = await axiosPublic.post("/item", item);

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
          icon: 'error',
          title: 'Oops...',
          text: 'An item with the same model already exists.',
        });
      } else {
        console.error("Error adding item:", error);
      }
    }
  };

  const onBlurModel = async () => {
    const modelValue = watch("model");

    try {
      const response = await axiosPublic.get(`/items/model/${modelValue}`);

      if (response.data) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'An item with this model already exists in the database!',
        });
      }
    } catch (error) {
      console.error('Error checking item redundancy by model:', error);
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-4 my-10 rounded-md shadow-xl md:w-4/5 lg:w-full xl:w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <span className="label-text">Name of the Item</span>
              <span className="text-red-500 text-lg ml-2">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Module"
              {...register("itemName", { required: true })}
              required
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
            />
          </div>
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <span className="label-text">Category</span>
              <span className="text-red-500 text-lg ml-2">*</span>
            </label>
            <select
              {...register("category", { required: true })}
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
            >
              <option value="SpareParts">Spare Parts</option>
              <option value="Equipment">Equipment</option>
              <option value="Furniture">Furniture</option>
              <option value="Others">Others</option>
            </select>
            {category === "Others" && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Specify the category"
                  value={specificCategory}
                  onChange={(e) => setSpecificCategory(e.target.value)}
                  className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <span className="label-text">Model Name</span>
              <span className="text-red-500 text-lg ml-2">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AM-10A"
              {...register("model")}
              onBlur={onBlurModel}
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
            />
          </div>
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <span className="label-text">Country Origin</span>
              <span className="text-red-500 text-lg ml-2">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. USA"
              {...register("origin", { required: true })}
              required
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
            />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <span className="label-text">Item Quantity in Store</span>
              <span className="text-red-500 text-lg ml-2">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 4"
              {...register("goodQuantity", { required: true })}
              required
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
            />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <span className="label-text">Current Location of Good Item</span>
              <span className="text-red-500 text-lg ml-2">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. At Store/FM Room"
              {...register("locationGood", { required: true })}
              required
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
            />
          </div>
          <div className="form-control w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              <span className="label-text">Date of Receive</span>
              <span className="text-red-500 text-lg ml-2">*</span>
            </label>
            <input
              type="date"
              id="receive"
              {...register("date", {})}
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm md:text-base"
            />
          </div>
        </div>
        <div className="flex gap-6 mb-6">
          <div className="form-control w-full">
            <label htmlFor="detail" className="block text-gray-700 text-sm font-bold mb-2">
              Detail About the Item
            </label>
            <textarea
              id="detail"
              placeholder="Write about specs, application etc of the item..."
              {...register("detail")}
              className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="form-control w-full">
            <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">
              Image of the Item
            </label>
            <input
              type="file"
              id="image"
              {...register("image", {})}
              className="border rounded w-full py-[6px] px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div className="flex justify-center">
          <button className="btn w-1/2 mt-10 bg-emerald-700 text-white hover:bg-emerald-950 hover:text-white">
            Add Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItems;
