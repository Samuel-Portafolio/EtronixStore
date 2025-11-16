import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/Layout.jsx";
import "./index.css";

// Lazy loading para todas las páginas
const Home = lazy(() => import("./pages/Home.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const Success = lazy(() => import("./pages/Success.jsx"));
const Failure = lazy(() => import("./pages/Failure.jsx"));
const Pending = lazy(() => import("./pages/Pending.jsx"));
const FAQPage = lazy(() => import("./pages/FAQPage.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch(() => {
        // opcional: loguear el error
      });
  });
}


// Componente de carga
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { 
        index: true, 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Home />
          </Suspense>
        )
      },
      { 
        path: "shop", 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Shop />
          </Suspense>
        )
      },
      { 
        path: "checkout", 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Checkout />
          </Suspense>
        )
      },
      { 
        path: "admin", 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Admin />
          </Suspense>
        )
      },
      { 
        path: "success", 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Success />
          </Suspense>
        )
      },
      { 
        path: "failure", 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Failure />
          </Suspense>
        )
      },
      { 
        path: "pending", 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Pending />
          </Suspense>
        )
      },
      { 
        path: "faq", 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FAQPage />
          </Suspense>
        )
      },
      { 
        path: "about", 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <About />
          </Suspense>
        )
      },
      { 
        path: "products/:id", 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProductDetail />
          </Suspense>
        )
      },
    ],
  },
]);

// Función de renderizado para soporte de react-snap
const rootElement = document.getElementById("root");

if (rootElement.hasChildNodes()) {
  // react-snap ya pre-renderizó, usar hydrate
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </React.StrictMode>
  );
} else {
  // Renderizado normal
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </React.StrictMode>
  );
}