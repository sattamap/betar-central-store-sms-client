import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";
import { AuthContext } from "../../../../provider/AuthProvider";


const BlockSelector = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const [userData, setUserData] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(""); // NEW ✅

  useEffect(() => {
    if (user?.email) {
      axiosPublic.get(`/user/${user.email}`)
        .then((res) => setUserData(res.data))
        .catch((err) => console.error("Failed to fetch user data", err));
    }
  }, [user, axiosPublic]);

  const handleOfficeSelect = (blockType) => {
    const access = userData?.accessBlock;

    if (!access || access === "none") {
      Swal.fire("Access Denied", "You are not assigned to any block yet.", "error");
      return;
    }

    if ((blockType === "head" && (access === "head" || access === "all")) ||
        (blockType === "local" && (access === "local" || access === "all"))) {
      setSelectedBlock(blockType); // ✅ Go to 2nd level
    } else {
      Swal.fire("Access Denied", "You don't have access to this block.", "error");
    }
  };

  const handleSubBlockSelect = (subBlock) => {
    // Navigate based on selected office & sub-block
    navigate(`/${selectedBlock}/${subBlock}/home`);
  };

  if (!userData) return <div className="text-center mt-10">Loading access...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">
        Welcome, {user?.displayName}
      </h2>

      {!selectedBlock ? (
        <>
          <p className="text-gray-600">Please choose your office block:</p>
          <div className="flex flex-wrap justify-center gap-6">
            {/* Head Office */}
            <div
              onClick={() => handleOfficeSelect("head")}
              className={`cursor-pointer py-8 px-12 rounded-lg shadow-lg transition-all text-center
              ${["head", "all"].includes(userData?.accessBlock)
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              🔵 Head Office
            </div>

            {/* Local Office */}
            <div
              onClick={() => handleOfficeSelect("local")}
              className={`cursor-pointer py-8 px-12 rounded-lg shadow-lg transition-all text-center
              ${["local", "all"].includes(userData?.accessBlock)
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              🟢 Local Office
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-600">Choose management type for {selectedBlock === "head" ? "Head Office" : "Local Office"}:</p>
          <div className="flex flex-wrap justify-center gap-6">
            {/* Items Management */}
            <div
              onClick={() => handleSubBlockSelect("items")}
              className="cursor-pointer py-8 px-12 rounded-lg shadow-lg transition-all text-center bg-emerald-600 text-white hover:bg-emerald-700"
            >
              📦 Items Management
            </div>

            {/* Services Management */}
            <div
              onClick={() => handleSubBlockSelect("services")}
              className="cursor-pointer py-8 px-12 rounded-lg shadow-lg transition-all text-center bg-purple-600 text-white hover:bg-purple-700"
            >
              🛠️ Services Management
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => setSelectedBlock("")}
            className="mt-8 px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            🔙 Back to Office Selection
          </button>
        </>
      )}
    </div>
  );
};

export default BlockSelector;
