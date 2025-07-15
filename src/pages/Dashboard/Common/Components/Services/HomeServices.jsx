import { useEffect, useState } from "react";
import useAxiosPublic from "../../../../../hooks/useAxiosPublic";
import PropTypes from "prop-types";

const HomeServices = ({ block = "head" }) => {
  const axiosPublic = useAxiosPublic();
  const [totalServices, setTotalServices] = useState(0);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosPublic.get(`/${block}/services`);
        const services = response.data;
        setTotalServices(services.length);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [axiosPublic, block]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-teal-600 mb-8 text-center">
        Total Services Summary
      </h2>

      <div className="flex justify-center">
        <StatCard
          title="Total Services"
          value={totalServices}
          color="from-blue-500 to-blue-700"
        />
      </div>

      <footer className="mt-16 text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Service Management System of Bangladesh Betar. All rights reserved.
        <br />Developed by Sattam.
      </footer>
    </div>
  );
};

HomeServices.propTypes = {
  block: PropTypes.string,
};

// ✅ Reusable Stat Card
const StatCard = ({ title, value, color }) => (
  <div
    className={`bg-gradient-to-r ${color} shadow-lg rounded-lg p-8 text-center w-72`}
  >
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-4xl font-bold text-white">{value}</p>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

export default HomeServices;
