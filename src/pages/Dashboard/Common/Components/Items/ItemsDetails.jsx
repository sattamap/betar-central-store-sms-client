import { useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";

const ItemsDetails = () => {
  const { id } = useParams();
  const { block } = useOutletContext();
  const axiosPublic = useAxiosPublic();
  const [itemDetails, setItemDetails] = useState(null);

  useEffect(() => {
    const fetchItemById = async () => {
      try {
        const response = await axiosPublic.get(`/${block}/items/${id}`);
        setItemDetails(response.data);
      } catch (error) {
        console.error("Error fetching item by ID:", error);
      }
    };

    if (id && block) {
      fetchItemById();
    }
  }, [axiosPublic, block, id]);

  if (!itemDetails) {
    return <div>Loading item details...</div>;
  }

  return (
    <div>
    <div className="overflow-x-auto w-11/12 bg-white p-4 rounded-lg shadow-lg mt-10">
  <table className="table w-full border border-gray-300">
    <tbody>
      {/* Image Row */}
      <tr>
        <td className="w-1/3 border p-4 text-center align-top" rowSpan={Object.keys(itemDetails).length}>
          {itemDetails.image && (
            <img
              src={itemDetails.image}
              alt={itemDetails.itemName}
              className="rounded-lg max-w-full max-h-72 mx-auto"
            />
          )}
        </td>
        <td className="font-semibold border p-2 w-1/4">Item Name</td>
        <td className="border p-2">{itemDetails.itemName}</td>
      </tr>
      <tr>
        <td className="font-semibold border p-2">Category</td>
        <td className="border p-2">{itemDetails.category}</td>
      </tr>
      <tr>
        <td className="font-semibold border p-2">Model</td>
        <td className="border p-2">{itemDetails.model}</td>
      </tr>
      <tr>
        <td className="font-semibold border p-2">Origin</td>
        <td className="border p-2">{itemDetails.origin}</td>
      </tr>
      <tr>
        <td className="font-semibold border p-2">Location</td>
        <td className="border p-2">{itemDetails.locationGood}</td>
      </tr>
      <tr>
        <td className="font-semibold border p-2">Received/Installed On</td>
        <td className="border p-2">{itemDetails.date}</td>
      </tr>
      <tr>
        <td className="font-semibold border p-2">Number of Good Items</td>
        <td className="border p-2">{itemDetails.items_quantity?.item_store}</td>
      </tr>
      <tr>
        <td className="font-semibold border p-2">Used Items</td>
        <td className="border p-2">{itemDetails.items_quantity?.item_use}</td>
      </tr>
      <tr>
        <td className="font-semibold border p-2">Faulty Items (Store)</td>
        <td className="border p-2">{itemDetails.items_quantity?.item_faulty_store}</td>
      </tr>
      <tr>
        <td className="font-semibold border p-2">Faulty Items (Use)</td>
        <td className="border p-2">{itemDetails.items_quantity?.item_faulty_use}</td>
      </tr>
      <tr>
        <td className="font-semibold border p-2">Details</td>
        <td className="border p-2 text-justify">{itemDetails.detail}</td>
      </tr>
    </tbody>
  </table>
</div>

    </div>
  );
};

ItemsDetails.propTypes = {
  block: PropTypes.string,
};

export default ItemsDetails;
