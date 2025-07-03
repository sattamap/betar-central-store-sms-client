//

import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../layout/Main";
import Dashboard from "../layout/Dashboard";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Contact from "../pages/Login/Contact";
import AboutIMS from "../pages/Login/AboutIMS";
import PrivateRoutes from "./PrivateRoutes";

import Items from "../pages/Dashboard/HeadOffice/Monitor/Items/HeadItems";
import Details from "../pages/Dashboard/Common/Components/Details";

import BlockSelector from "../pages/Dashboard/Common/BlockSelector/BlockSelector";

import HeadAddItems from "../pages/Dashboard/HeadOffice/Coordinator/AddItems/HeadAddItems";
import HeadAdminManageItems from "../pages/Dashboard/HeadOffice/Admin/ManageItems/HeadAdminManageItems";
import HeadUpdateItems from "../pages/Dashboard/HeadOffice/Coordinator/UpdateItems/HeadUpdateItems";
import LocalAddItems from "../pages/Dashboard/Local/Coordinator/AddItems/LocalAddItems";
import LocalAdminManageItems from "../pages/Dashboard/Local/Admin/ManageItems/LocalAdminManageItems";
import LocalUpdateItems from "../pages/Dashboard/Local/Coordinator/UpdateItems/LocalUpdateItems";
import HeadHome from "../pages/Dashboard/HeadOffice/Home/HeadHome";
import LocalHome from "../pages/Dashboard/Local/Home/LocalHome";
import HeadRecords from "../pages/Dashboard/HeadOffice/Admin/Records/HeadAdminRecords";
import LocalRecords from "../pages/Dashboard/Local/Admin/Records/LocalAdminRecords";
import AllUsers from "../pages/Dashboard/Common/Components/AllUsers";
import GenericDashboard from "../layout/GenericDashboard";
import HeadWelcomeMsg from "../pages/Dashboard/HeadOffice/None/HeadWelcomeMsg";
import LocalWelcomeMsg from "../pages/Dashboard/Local/None/LocalWelcomeMsg";
import HeadCoManageItems from "../pages/Dashboard/HeadOffice/Coordinator/ManageItems/HeadCoManageItems";
import LocalCoManageItems from "../pages/Dashboard/Local/Coordinator/ManageItems/LocalCoManageItems";
import HeadCoRecords from "../pages/Dashboard/HeadOffice/Coordinator/Records/HeadCoRecords";
import LocalCoRecords from "../pages/Dashboard/Local/Coordinator/Records/LocalCoRecords";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "about",
        element: <AboutIMS />,
      },
    ],
  },

  {
    path: "/dashboard",
    element: (
      <PrivateRoutes>
        <Dashboard />
      </PrivateRoutes>
    ), // Only photo + BlockSelector
    children: [
      {
        index: true,
        element: <Navigate to="select-block" replace />,
      },
      {
        path: "select-block",
        element: <BlockSelector />,
      },
      {
        path: "all-users",
        element: <AllUsers />,
      },
    ],
  },

  // ✅ HEAD OFFICE BLOCK
  {
    path: "/head",
    element: (
      <PrivateRoutes>
        <GenericDashboard />
      </PrivateRoutes>
    ),
    children: [
      { path: "home", element: <HeadHome /> },
      { path: "addItems", element: <HeadAddItems /> },
      { path: "adminManageItems", element: <HeadAdminManageItems /> },
      {
        path: "updateItem/:id",
        element: <HeadUpdateItems />,
        loader: ({ params }) =>
          fetch(`http://localhost:5000/head/items/${params.id}`,
            {
              credentials: "include", 
            }),
        // ✅ This sends cookies like the JWT token
      },
      { path: "items", element: <Items /> },
      { path: "manageItems", element: <HeadCoManageItems/> },
      { path: "adminRecords", element: <HeadRecords /> },
      { path: "records", element: <HeadCoRecords/> },
      { path: "details/:id", element: <Details /> },
      { path: "none", element: <HeadWelcomeMsg /> },
    ],
  },

  // ✅ LOCAL BLOCK
  {
    path: "/local",
    element: (
      <PrivateRoutes>
        <GenericDashboard />
      </PrivateRoutes>
    ),
    children: [
      { path: "home", element: <LocalHome /> },
      { path: "addItems", element: <LocalAddItems /> },
      { path: "adminManageItems", element: <LocalAdminManageItems /> },
      {
        path: "updateItem/:id",
        element: <LocalUpdateItems />,
        loader: ({ params }) =>
          fetch(`http://localhost:5000/local/items/${params.id}`,
                  {
              credentials: "include", 
            }
          ),
        
      },
      { path: "items", element: <Items /> },
      { path: "manageItems", element: <LocalCoManageItems /> },
      { path: "adminRecords", element: <LocalRecords /> },
      { path: "records", element: <LocalCoRecords/> },
      { path: "details/:id", element: <Details /> },
      { path: "none", element: <LocalWelcomeMsg /> },
    ],
  },
]);
