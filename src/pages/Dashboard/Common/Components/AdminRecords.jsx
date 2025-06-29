import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";


const AdminRecords = ({ block = "head" }) => {
  const axiosPublic = useAxiosPublic();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axiosPublic.get(`/${block}/records`);
        setRecords(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching records:", error);
        setLoading(false);
      }
    };
    fetchRecords();
  }, [axiosPublic, block]);

  const handleApprove = async (id) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: "Are you sure you want to approve this record?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Approve",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (!isConfirmed) return;

      await axiosPublic.patch(`/${block}/records/approve/${id}`);

      setRecords((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "approved" } : r))
      );

      Swal.fire({
        icon: "success",
        title: "Record Approved!",
        text: "The record has been successfully approved.",
      });
    } catch (error) {
      console.error("Error approving record:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An error occurred while approving the record.",
      });
    }
  };

  const handleDecline = async (id) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: "Are you sure you want to decline this record?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Decline",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (isConfirmed) {
        await axiosPublic.delete(`/${block}/records/${id}`);
        setRecords(records.filter((record) => record._id !== id));
        Swal.fire({
          icon: "success",
          title: "Record Declined!",
          text: "The record has been successfully declined.",
        });
      }
    } catch (error) {
      console.error("Error declining record:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An error occurred while declining the record.",
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 capitalize">{block} Records</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto max-h-[500px] border border-gray-300 rounded-md">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="sticky top-0 bg-gray-200 text-gray-700 uppercase text-xs shadow z-10">
              <tr>
                <th className="py-2 px-3 text-center border">S.No.</th>
                <th className="py-2 px-3 text-center border">Item Name</th>
                <th className="py-2 px-3 text-center border">Model</th>
                <th className="py-2 px-3 text-center border">Item <br /> (Store)</th>
                <th className="py-2 px-3 text-center border">Item <br /> (Use)</th>
                <th className="py-2 px-3 text-center border">Item <br /> (Faulty Store)</th>
                <th className="py-2 px-3 text-center border">Item <br /> (Faulty Use)</th>
                <th className="py-2 px-3 text-center border">Purpose</th>
                <th className="py-2 px-3 text-center border">Location</th>
                <th className="py-2 px-3 text-center border">Date</th>
                <th className="py-2 px-3 text-center border">Status</th>
                <th className="py-2 px-3 text-center border">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-center border">{index + 1}</td>
                  <td className="py-2 px-3 text-center border">{record.itemName}</td>
                  <td className="py-2 px-3 text-center border">{record.model}</td>
                  <td className="py-2 px-3 text-center border">{record.items_quantity?.item_store}</td>
                  <td className="py-2 px-3 text-center border">{record.items_quantity?.item_use}</td>
                  <td className="py-2 px-3 text-center border">{record.items_quantity?.item_faulty_store}</td>
                  <td className="py-2 px-3 text-center border">{record.items_quantity?.item_faulty_use}</td>
                  <td className="py-2 px-3 text-center border">{record.purpose}</td>
                  <td className="py-2 px-3 text-center border">{record.locationGood}</td>
                  <td className="py-2 px-3 text-center border">{record.date}</td>
                  <td className="py-2 px-3 text-center border">{record.status}</td>
                  <td className="py-2 px-3 text-center border">
                    {["pending(add)", "pending(remove)", "pending(remove_fault_store)", "pending(remove_fault_use)"].includes(record.status) && (
                      <>
                        <button
                          onClick={() => handleApprove(record._id)}
                          className="btn btn-xs bg-blue-500 hover:bg-blue-600 text-white px-2 mb-1"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecline(record._id)}
                          className="btn btn-xs bg-red-500 hover:bg-red-600 text-white px-2"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

AdminRecords.propTypes = {
  block: PropTypes.string,
};

export default AdminRecords;
