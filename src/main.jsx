import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes";
import AuthProvider from "./provider/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Maintenance from "./Maintenance"; // ⬅ add this

const queryClient = new QueryClient();

// ⬅ Toggle this to turn maintenance ON/OFF
const MAINTENANCE_MODE = false; // true = show maintenance page

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {MAINTENANCE_MODE ? (
      <Maintenance /> // ⬅ show maintenance page
    ) : (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    )}
  </React.StrictMode>
);
