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
import HeadManageItems from "../pages/Dashboard/HeadOffice/Coordinator/ManageItems/HeadManageItems";
import HeadUpdateItems from "../pages/Dashboard/HeadOffice/Coordinator/UpdateItems/HeadUpdateItems";
import LocalAddItems from "../pages/Dashboard/Local/Coordinator/AddItems/LocalAddItems";
import LocalManageItems from "../pages/Dashboard/Local/Coordinator/ManageItems/LocalManageItems";
import LocalUpdateItems from "../pages/Dashboard/Local/Coordinator/UpdateItems/LocalUpdateItems";
import HeadHome from "../pages/Dashboard/HeadOffice/Home/HeadHome";
import LocalHome from "../pages/Dashboard/Local/Home/LocalHome";
import HeadRecords from "../pages/Dashboard/HeadOffice/Admin/Records/HeadRecords";
import LocalRecords from "../pages/Dashboard/Local/Admin/Records/LocalRecords";
import AllUsers from "../pages/Dashboard/Common/Components/AllUsers";
import Records from "../pages/Dashboard/Common/Components/Records";
import GenericDashboard from "../layout/GenericDashboard";
import HeadWelcomeMsg from "../pages/Dashboard/HeadOffice/None/HeadWelcomeMsg";
import LocalWelcomeMsg from "../pages/Dashboard/Local/None/LocalWelcomeMsg";

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
      { path: "manageItems", element: <HeadManageItems /> },
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
      { path: "adminRecords", element: <HeadRecords /> },
      { path: "records", element: <Records/> },
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
      { path: "manageItems", element: <LocalManageItems /> },
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
      { path: "adminRecords", element: <LocalRecords /> },
      { path: "records", element: <Records/> },
      { path: "details/:id", element: <Details /> },
      { path: "none", element: <LocalWelcomeMsg /> },
    ],
  },
]);
