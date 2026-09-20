import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { TRPCProvider } from "@/providers/trpc";
import { ThemeProvider } from "@/providers/theme";
import { Toaster } from "@/components/ui/sonner";
import App from "./App.tsx";

// Gracefully handle dynamic import chunk mismatches across deploys
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <TRPCProvider>
          <App />
          <Toaster richColors closeButton />
        </TRPCProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
