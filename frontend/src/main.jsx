import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);
