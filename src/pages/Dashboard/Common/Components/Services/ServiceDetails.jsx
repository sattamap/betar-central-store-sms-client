import { useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";

const ServiceDetails = () => {
  const { id } = useParams();
  const { block } = useOutletContext();
  const axiosPublic = useAxiosPublic();
  const [serviceDetails, setServiceDetails] = useState(null);

  useEffect(() => {
    const fetchServiceById = async () => {
      try {
        const response = await axiosPublic.get(`/${block}/services/${id}`);
        setServiceDetails(response.data);
      } catch (error) {
        console.error("Error fetching service by ID:", error);
      }
    };

    if (id && block) {
      fetchServiceById();
    }
  }, [axiosPublic, block, id]);

  if (!serviceDetails) {
    return <div>Loading service details...</div>;
  }

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-4 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Service Details</h2>
        <table className="w-full table-auto border border-gray-300">
          <tbody>
            <tr>
              <td className="w-1/4 font-semibold p-2 border">Service Name</td>
              <td className="w-3/4 p-2 border">{serviceDetails?.serviceName}</td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border">Category</td>
              <td className="p-2 border">{serviceDetails?.category}</td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border">Provider</td>
              <td className="p-2 border">{serviceDetails?.provider}</td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border">Start Date</td>
              <td className="p-2 border">{serviceDetails?.start_date}</td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border">End Date</td>
              <td className="p-2 border">{serviceDetails?.end_date}</td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border align-top">Details</td>
              <td className="p-2 border text-justify max-h-64 overflow-auto">
                {serviceDetails?.detail}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceDetails;
