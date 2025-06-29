import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../provider/AuthProvider";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";

const BlockSelector = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const [userData, setUserData] = useState(null);

  // ✅ Load userData from backend using email
  useEffect(() => {
    if (user?.email) {
      axiosPublic.get(`/user/${user.email}`).then((res) => {
        setUserData(res.data);
      }).catch((err) => {
        console.error("Failed to fetch user data", err);
      });
    }
  }, [user, axiosPublic]);

  const handleSelect = (blockType) => {
    const access = userData?.accessBlock;

    if (!access || access === "none") {
      Swal.fire("Access Denied", "You are not assigned to any block yet.", "error");
      return;
    }

    if ((blockType === "head" && (access === "head" || access === "all")) ||
        (blockType === "local" && (access === "local" || access === "all"))) {
      navigate(`/${blockType}/home`);
    } else {
      Swal.fire("Access Denied", "You don't have access to this block.", "error");
    }
  };

  if (!userData) return <div className="text-center mt-10">Loading access...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">
        Welcome, {user?.displayName}
      </h2>
      <p className="text-gray-600">Please choose a management block:</p>
      <div className="flex flex-wrap justify-center gap-6">
        {/* Head Office */}
        <div
          onClick={() => handleSelect("head")}
          className={`cursor-pointer py-8 px-12 rounded-lg shadow-lg transition-all text-center
          ${["head", "all"].includes(userData?.accessBlock)
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          🔵 Head Office Item Management
        </div>

        {/* Local Office */}
        <div
          onClick={() => handleSelect("local")}
          className={`cursor-pointer py-8 px-12 rounded-lg shadow-lg transition-all text-center
          ${["local", "all"].includes(userData?.accessBlock)
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          🟢 Local Item Management
        </div>
      </div>
    </div>
  );
};

export default BlockSelector;
