import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../provider/AuthProvider";

const BlockSelector = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleSelect = (blockType) => {
    navigate(`/dashboard/${blockType}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">
        Welcome, {user?.displayName}
      </h2>
      <p className="text-gray-600">Please choose a management block:</p>
      <div className="flex flex-wrap justify-center gap-6">
        <div
          onClick={() => handleSelect("head-office")}
          className="cursor-pointer bg-blue-600 text-white py-8 px-12 rounded-lg shadow-lg hover:bg-blue-700 transition-all text-center"
        >
          🔵 Head Office Item Management
        </div>
        <div
          onClick={() => handleSelect("local")}
          className="cursor-pointer bg-green-600 text-white py-8 px-12 rounded-lg shadow-lg hover:bg-green-700 transition-all text-center"
        >
          🟢 Local Item Management
        </div>
      </div>
    </div>
  );
};

export default BlockSelector;
