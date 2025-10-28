import { useQuery } from "@tanstack/react-query";
import { FaTimes, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import Modal from "react-modal";
import { useState } from "react";
import useAxiosPublic from "../../../../hooks/useAxiosPublic";

Modal.setAppElement("#root");

const AllUsers = () => {
  const axiosPublic = useAxiosPublic();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: users = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosPublic.get("/users");
      return res.data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleToggleRole = (user) => {
    Swal.fire({
      title: `Select the new role for ${user.name}:`,
      input: "select",
      inputOptions: {
        admin: "Admin",
        coordinator: "Coordinator",
        monitor: "Monitor",
        none: "No Role",
      },
      inputPlaceholder: "Select a role",
      showCancelButton: true,
      confirmButtonText: "Change",
    }).then((result) => {
      if (result.isConfirmed) {
        const newRole = result.value;
        axiosPublic
          .patch(`/users/status/${user._id}`, { status: newRole })
          .then((res) => {
            if (res.data.modifiedCount > 0) {
              refetch();
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: `${user.name}'s role has been changed to ${newRole}`,
                showConfirmButton: false,
                timer: 1500,
              });
            }
          });
      }
    });
  };

  const handleToggleAccessBlock = (user) => {
    Swal.fire({
      title: `Assign access block for ${user.name}:`,
      input: "select",
      inputOptions: {
        head: "Head Office",
        local: "Local Office",
        all: "Both",
        none: "None",
      },
      inputPlaceholder: "Select access block",
      showCancelButton: true,
      confirmButtonText: "Assign",
    }).then((result) => {
      if (result.isConfirmed) {
        const newAccessBlock = result.value;
        axiosPublic
          .patch(`/users/accessBlock/${user._id}`, {
            accessBlock: newAccessBlock,
          })
          .then((res) => {
            if (res.data.modifiedCount > 0) {
              refetch();
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: `${user.name}'s access block set to "${newAccessBlock}"`,
                showConfirmButton: false,
                timer: 1500,
              });
            }
          });
      }
    });
  };

  const handleDelete = (user) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic
          .delete(`/users/${user._id}`)
          .then((res) => {
            if (res.data.deletedCount > 0) {
              refetch();
              Swal.fire("Deleted!", "The user has been deleted.", "success");
            } else {
              Swal.fire("Error!", "Failed to delete user.", "error");
            }
          })
          .catch((error) => {
            console.error("Error deleting user:", error);
            Swal.fire("Error!", "Failed to delete user.", "error");
          });
      }
    });
  };

  const handleSeeInfo = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row items-center justify-between text-center bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 p-8 md:p-10 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-[1.02]">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide drop-shadow-md">
          👥 All Users
        </h2>

        <h2 className="text-2xl md:text-3xl font-bold text-emerald-50 mt-4 lg:mt-0">
          Total Users:&nbsp;
          <span className="bg-lime-300 text-rose-950 font-extrabold px-3 py-1 rounded-lg shadow-sm border border-lime-400">
            {users.length}
          </span>
        </h2>
      </div>

      <div className="mt-6 mb-4 mx-4 lg:mx-20 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-md shadow-sm">
        <p className="text-emerald-800 text-sm md:text-base leading-relaxed">
          💡 <strong>Info:</strong> The{" "}
          <span className="font-semibold">Status</span> and
          <span className="font-semibold"> Access Block</span> buttons are{" "}
          <span className="text-emerald-700 font-semibold">changeable</span>,
          and only <span className="text-blue-700 font-semibold">Admin</span>{" "}
          users can modify them. Admins can also view detailed user information
          or
          <span className="text-rose-600 font-semibold"> delete users</span> if
          needed. Please click the respective button to perform these actions.
        </p>
      </div>

      <div className="overflow-x-auto px-4 lg:px-20">
        <table className="table table-xs table-zebra mt-10">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Access Block</th>
              <th>User Info</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <th>{index + 1}</th>
                <td>{user.name}</td>
                <td>{user.email}</td>
                {/* Role Status */}
                <td>
                  <button
                    onClick={() => handleToggleRole(user)}
                    className={`px-3 py-1 rounded-lg font-semibold border transition-all duration-200
      ${
        user.status === "admin"
          ? "bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200"
          : user.status === "coordinator"
          ? "bg-rose-100 text-rose-700 border-rose-400 hover:bg-rose-200"
          : user.status === "monitor"
          ? "bg-yellow-100 text-yellow-700 border-yellow-400 hover:bg-yellow-200"
          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
      }`}
                  >
                    {user.status === "admin"
                      ? "Admin"
                      : user.status === "coordinator"
                      ? "Coordinator"
                      : user.status === "monitor"
                      ? "Monitor"
                      : "No Role"}
                  </button>
                </td>

                {/* Access Block */}
                <td>
                  <button
                    onClick={() => handleToggleAccessBlock(user)}
                    className={`px-3 py-1 rounded-lg font-semibold border transition-all duration-200
      ${
        user.accessBlock === "head"
          ? "bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200"
          : user.accessBlock === "local"
          ? "bg-green-100 text-green-700 border-green-400 hover:bg-green-200"
          : user.accessBlock === "all"
          ? "bg-purple-100 text-purple-700 border-purple-400 hover:bg-purple-200"
          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
      }`}
                  >
                    {user.accessBlock === "head"
                      ? "Head"
                      : user.accessBlock === "local"
                      ? "Local"
                      : user.accessBlock === "all"
                      ? "All"
                      : "None"}
                  </button>
                </td>

                {/* Info & Delete */}
                <td>
                  <button
                    onClick={() => handleSeeInfo(user)}
                    className="px-3 py-1 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-200 transition-all duration-200"
                  >
                    See Info
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(user)}
                    className="px-3 py-1 bg-rose-100 border border-rose-400 text-rose-700 rounded-lg font-semibold hover:bg-rose-200 transition-all duration-200"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <div className="flex justify-center">
        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          contentLabel="User Information"
          style={{
            overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
            content: {
              width: "80%",
              maxWidth: "400px",
              height: "auto",
              maxHeight: "30%",
              margin: "auto",
              borderRadius: "8px",
              padding: "25px",
            },
          }}
        >
          <button
            onClick={handleCloseModal}
            className="absolute top-0 right-0 p-2 cursor-pointer"
          >
            <FaTimes />
          </button>
          {selectedUser && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div>
                <p>
                  <strong>Name:</strong> {selectedUser.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Section:</strong> {selectedUser.section}
                </p>
                <p>
                  <strong>Designation:</strong> {selectedUser.designation}
                </p>
              </div>
              <div className="w-2/5 md:w-32 h-auto">
                <img
                  src={selectedUser.photoURL}
                  alt={selectedUser.name}
                  className="w-full h-full md:object-contain"
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AllUsers;
