import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";

const Records = ({ block = "head" }) => {
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
                <th className="py-2 px-3 text-center border">
                  Item <br /> (Store)
                </th>
                <th className="py-2 px-3 text-center border">
                  Item <br /> (Use)
                </th>
                <th className="py-2 px-3 text-center border">
                  Item <br /> (Faulty Store)
                </th>
                <th className="py-2 px-3 text-center border">
                  Item <br /> (Faulty Use)
                </th>
                <th className="py-2 px-3 text-center border">Purpose</th>
                <th className="py-2 px-3 text-center border">Location</th>
                <th className="py-2 px-3 text-center border">Date</th>
                <th className="py-2 px-3 text-center border">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-center border">{index + 1}</td>
                  <td className="py-2 px-3 text-center border">
                    {record.itemName}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.model}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.items_quantity?.item_store}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.items_quantity?.item_use}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.items_quantity?.item_faulty_store}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.items_quantity?.item_faulty_use}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.purpose}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.locationGood}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.date}
                  </td>
                  <td className="py-2 px-3 text-center border">
                    {record.status}
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

Records.propTypes = {
  block: PropTypes.string,
};

export default Records;
