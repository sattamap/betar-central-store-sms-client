import { useEffect, useState } from "react";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";
import PropTypes from "prop-types";

const Home = ({ block = "head" }) => {
//   const outletContext = useOutletContext();
//   const block = outletContext?.block || "head";
  const axiosPublic = useAxiosPublic();

  const [totalItems, setTotalItems] = useState(0);
  const [itemStore, setItemStore] = useState(0);
  const [itemUse, setItemUse] = useState(0);
  const [faultyStore, setFaultyStore] = useState(0);
  const [faultyUse, setFaultyUse] = useState(0);

  const totalGood = itemStore + itemUse;
  const totalFaulty = faultyStore + faultyUse;
  const totalQuantity = totalGood + totalFaulty;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosPublic.get(`/${block}/items`);
        const items = response.data;

        setTotalItems(items.length);

        let store = 0, use = 0, faultStore = 0, faultUse = 0;

        items.forEach((item) => {
          const q = item.items_quantity || {};
          store += Number(q.item_store || 0);
          use += Number(q.item_use || 0);
          faultStore += Number(q.item_faulty_store || 0);
          faultUse += Number(q.item_faulty_use || 0);
        });

        setItemStore(store);
        setItemUse(use);
        setFaultyStore(faultStore);
        setFaultyUse(faultUse);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [axiosPublic, block]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-teal-600 mb-6 text-center">
        Inventory Management System of Bangladesh Betar, Bandarban
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <StatCard title="Total Records" value={totalItems} color="from-gray-500 to-gray-700" />
        <StatCard title="Total Items" value={totalQuantity} color="from-yellow-500 to-yellow-700" />
        <StatCard title="Good Items" value={totalGood} color="from-green-500 to-green-700" />
        <StatCard title="Faulty Items" value={totalFaulty} color="from-red-500 to-red-700" />
        <StatCard title="In Store" value={itemStore} color="from-blue-500 to-blue-700" />
        <StatCard title="In Use" value={itemUse} color="from-indigo-500 to-indigo-700" />
        <StatCard title="Faulty in Store" value={faultyStore} color="from-pink-500 to-pink-700" />
        <StatCard title="Faulty in Use" value={faultyUse} color="from-orange-500 to-orange-700" />
      </div>

      <footer className="mt-16 text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Inventory Management System of Bangladesh Betar, Bandarban. All rights reserved.
        <br />Developed by Sattam.
      </footer>
    </div>
  );
};

Home.propTypes = {
  block: PropTypes.string,
};

// ✅ Reusable Card Component with PropTypes
const StatCard = ({ title, value, color }) => (
  <div className={`bg-gradient-to-r ${color} shadow-lg rounded-lg p-6 text-center`}>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-3xl font-bold text-white">{value}</p>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

export default Home;
