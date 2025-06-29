import { useLocation, useNavigate } from "react-router-dom";

const WelcomeMsg = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const block = location.pathname.split("/")[1]; // "head" or "local"

  const blockName =
    block === "head"
      ? "Head Office"
      : block === "local"
      ? "Local Station"
      : "System";

  const handleBackToDashboard = () => {
    navigate("/dashboard/select-block");
  };

  return (
    <div>
      <div className="w-11/12 md:w-2/3 mx-auto p-10 mt-10 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-6">
          Welcome to the {blockName} Panel!
        </h2>

        <p className="text-lg text-gray-700 mb-4">
          You have successfully created an account, but your access role has not been assigned yet.
          An administrator from the {blockName} team will soon review and assign you a role.
        </p>

        <p className="text-lg text-gray-700 mb-2">
          In the meantime, feel free to explore or contact the admin team if you have any questions or preferences.
        </p>

        <p className="text-sm text-gray-500 mt-6 italic">
          You are currently viewing: <strong>{block ? `/${block}` : `/dashboard`}</strong>
        </p>

        {/* ✅ Back button */}
        <button
          onClick={handleBackToDashboard}
          className="mt-8 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          🔙 Back to Dashboard
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-12 lg:mt-64 text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Inventory Management System of Bangladesh Betar, Bandarban.
        All rights reserved.
        <br />
        Developed by Sattam.
      </footer>
    </div>
  );
};

export default WelcomeMsg;
