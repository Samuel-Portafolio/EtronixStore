import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProductDetail from "./pages/ProductDetail.jsx";
import Success from "./pages/Success.jsx";
import Failure from "./pages/Failure.jsx";
import Pending from "./pages/Pending.jsx";
import Admin from "./pages/Admin.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import Checkout from "./pages/Checkout.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import About from "./pages/About.jsx";
import Layout from "./components/Layout.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "shop", element: <Shop /> },
      { path: "checkout", element: <Checkout /> },
      { path: "admin", element: <Admin /> },
      { path: "success", element: <Success /> },
      { path: "failure", element: <Failure /> },
      { path: "pending", element: <Pending /> },
      { path: "faq", element: <FAQPage /> },
      { path: "about", element: <About /> },
      { path: "products/:id", element: <ProductDetail /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
