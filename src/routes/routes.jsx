import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "../layout/Main";
import Dashboard from "../layout/Dashboard";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Contact from "../pages/Login/Contact";
import PrivateRoutes from "./PrivateRoutes";
import BlockSelector from "../pages/Dashboard/Common/BlockSelector/BlockSelector";
import AllUsers from "../pages/Dashboard/Common/Components/AllUsers";
import GenericDashboad from "../layout/GenericDashboard";
import HeadHome from "../pages/Dashboard/HeadOffice/Items/Home/HeadHome";
import HeadAddItems from "../pages/Dashboard/HeadOffice/Items/Coordinator/HeadAddItems";
import AdminManageItems from "../pages/Dashboard/Common/Components/Items/AdminManageItems";
import HeadUpdateItems from "../pages/Dashboard/HeadOffice/Items/Coordinator/HeadUpdateItems";
import Items from "../pages/Dashboard/Common/Components/Items/Items";
import HeadCoRecords from "../pages/Dashboard/HeadOffice/Items/Coordinator/HeadCoRecords";
import HeadWelcomeMsg from "../pages/Dashboard/HeadOffice/Items/None/HeadWelcomeMsg";
import HeadAdminRecords from "../pages/Dashboard/HeadOffice/Items/Admin/HeadAdminRecords";
import HeadAddServices from "../pages/Dashboard/HeadOffice/Services/Admin/HeadAddServices";
import GenericDashboard from "../layout/GenericDashboard";
import LocalHome from "../pages/Dashboard/Local/Items/Home/LocalHome";
import LocalAddItems from "../pages/Dashboard/Local/Items/Coordinator/LocalAddItems";
import LocalUpdateItems from "../pages/Dashboard/Local/Items/Coordinator/LocalUpdateItems";
import LocalRecords from "../pages/Dashboard/Local/Items/Admin/LocalAdminRecords";
import LocalCoRecords from "../pages/Dashboard/Local/Items/Coordinator/LocalCoRecords";
import LocalWelcomeMsg from "../pages/Dashboard/Local/Items/None/LocalWelcomeMsg";
import LocalAddServices from "../pages/Dashboard/Local/Services/Admin/LocalAddServices";
import UpdateServices from "../pages/Dashboard/Common/Components/Services/UpdateServices";
import ServiceDetails from "../pages/Dashboard/Common/Components/Services/ServiceDetails";
import HomeServices from "../pages/Dashboard/Common/Components/Services/HomeServices";
import ManageServices from "../pages/Dashboard/Common/Components/Services/ManageServices";
import AdminManageServices from "../pages/Dashboard/Common/Components/Services/AdminManageServices";
import ManageItems from "../pages/Dashboard/Common/Components/Items/ManageItems";
import ItemsDetails from "../pages/Dashboard/Common/Components/Items/ItemsDetails";
import AboutSMS from "../pages/Login/AboutSMS";
import Services from "../pages/Dashboard/Common/Components/Services/Services";
import NotificationsPage from "../pages/Dashboard/Common/Components/Both/NotificationsPage";

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
        element: <AboutSMS />,
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
        <GenericDashboad />
      </PrivateRoutes>
    ),
    children: [
      // HEAD - Items Management Block
      {
        path: "items",
        //element: <GenericDashboard />,
        children: [
          { path: "home", element: <HeadHome /> },
          { path: "addItems", element: <HeadAddItems /> },
          {
            path: "adminManageItems",
            element: <AdminManageItems block="head" />,
          },
          {
            path: "updateItem/:id",
            element: <HeadUpdateItems block="head"/>,
            loader: ({ params }) =>
              fetch(`https://betar-central-store-sms-server.onrender.com/head/items/${params.id}`, {
                credentials: "include",
              }),
          },
          { path: "allItems", element: <Items block="head"/> },
          { path: "manageItems", element: <ManageItems block="head" /> },
          { path: "adminRecords", element: <HeadAdminRecords /> },
          { path: "adminNotifications", element: <NotificationsPage block="head"/> },
          { path: "records", element: <HeadCoRecords /> },
          { path: "details/:id", element: <ItemsDetails block="head"/> },
          { path: "none", element: <HeadWelcomeMsg /> },
        ],
      },
      // HEAD - Services Management Block (NEW ✅)
      {
        path: "services",
        // element: <GenericDashboard />,
        children: [
          {
            path: "home",
            element: <HomeServices />,
          },
          {
            path: "addServices",
            element: <HeadAddServices />,
          },
          {
            path: "adminManageServices",
            element: <AdminManageServices block="head" />,
          },
          {
            path: "ManageServices",
            element: <ManageServices block="head" />,
          },
          {
            path: "updateService/:id",
            element: <UpdateServices block="head"/>,
            loader: ({ params }) =>
              fetch(`https://betar-central-store-sms-server.onrender.com/head/services/${params.id}`, {
                credentials: "include",
              }),
          },
          { path: "allServices", element: <Services block="head"/> },
          { path: "details/:id", element: <ServiceDetails block="head"/> },
          { path: "adminNotifications", element: <NotificationsPage block="head"/> },
        ],
      },
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
      // LOCAL - Items Management Block
      {
        path: "items",
        children: [
          { path: "home", element: <LocalHome /> },
          { path: "addItems", element: <LocalAddItems /> },
          {
            path: "adminManageItems",
            element: <AdminManageItems block="local" />,
          },
          {
            path: "updateItem/:id",
            element: <LocalUpdateItems block="local"/>,
            loader: ({ params }) =>
              fetch(`https://betar-central-store-sms-server.onrender.com/local/items/${params.id}`, {
                credentials: "include",
              }),
          },
          { path: "allItems", element: <Items block="local"/> },
          { path: "manageItems", element: <ManageItems block="local" /> },
          { path: "adminRecords", element: <LocalRecords /> },
          { path: "adminNotifications", element: <NotificationsPage block="local"/> },
          { path: "records", element: <LocalCoRecords /> },
          { path: "details/:id", element: <ItemsDetails block="local"/> },
          { path: "none", element: <LocalWelcomeMsg /> },
        ],
      },
      // LOCAL - Services Management Block (NEW ✅)
      {
        path: "services",
        children: [
          {
            path: "home",
            element: <HomeServices />,
          },
          {
            path: "addServices",
            element: <LocalAddServices />,
          },
          {
            path: "adminManageServices",
            element: <AdminManageServices block="local" />,
          },
          {
            path: "manageServices",
            element: <ManageServices block="local" />,
          },
          {
            path: "updateService/:id",
            element: <UpdateServices block="local"/>,
            loader: ({ params }) =>
              fetch(`https://betar-central-store-sms-server.onrender.com/local/services/${params.id}`, {
                credentials: "include",
              }),
          },
           { path: "allServices", element: <Services block="local"/> },
          { path: "details/:id", element: <ServiceDetails block="local"/> },
          { path: "adminNotifications", element: <NotificationsPage block="local"/> },

          // Add actual services routes later
        ],
      },
    ],
  },
]);
