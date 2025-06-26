import {
  createBrowserRouter
} from "react-router-dom";
import Main from "../layout/Main";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../layout/Dashboard";
import AllUsers from "../pages/Dashboard/Admin/AllUsers/AllUsers";
import AddItems from "../pages/Dashboard/Coordinator/AddItems/AddItems";
import Items from "../pages/Dashboard/Monitor/Items/Items";
import WelcomeMsg from "../pages/Dashboard/NoRole/WelcomeMsg.jsx/WelcomeMsg";
import ManageItems from "../pages/Dashboard/Coordinator/ManageItems/ManageItems";
import UpdateItems from "../pages/Dashboard/Coordinator/UpdateItems/UpdateItems";
import Details from "../pages/Dashboard/Common/Components/Details";
import Home from "../pages/Dashboard/Common/Home/Home";
import Contact from "../pages/Login/Contact";
import AboutIMS from "../pages/Login/AboutIMS";
import PrivateRoutes from "./PrivateRoutes";
import Records from "../pages/Dashboard/Admin/Records/Records";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main></Main>,
    children:[
        {
            path:"/",
            element:<Login></Login>,
        },
        {
            path:"register",
            element:<Register></Register>,
        },
        {
            path:"contact",
            element:<Contact></Contact>,
        },
        {
            path:"about",
            element:<AboutIMS></AboutIMS>,
        },
    ]
  },
  {
    path: "dashboard",
    element: <PrivateRoutes><Dashboard></Dashboard></PrivateRoutes>,
    children: [



      // common routes
   
    
      
      {
        path: "home",
        element:<Home></Home>,
      },
      {
        path: "details/:id",
        element: <Details></Details>,
      },


      // admin routes
   
      {
        path: "allUsers",
        element: <AllUsers></AllUsers>,
      },
      {
        path: "records",
        element: <Records></Records>,
      },
     
      // coordinator routes
     
      {
        path: "addItems",
        element:<AddItems></AddItems>,
      },
      
      {
        path: "manageItems",
        element:<ManageItems></ManageItems>,
      },
      {
        path: 'updateItem/:id',
        element:<UpdateItems></UpdateItems>,
        loader: ({params})=> fetch(`http://localhost:5000/items/${params.id}`)

      },

      
      // monitor routes
     
      {
        path: "items",
        element:<Items></Items>,
      },
       // user (no role) routes
       {
          path: "none",
          element: <WelcomeMsg></WelcomeMsg>,
        },
      

      
    ]
   
  }
]);

