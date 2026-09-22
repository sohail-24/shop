import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { TRPCProvider } from "@/providers/trpc";
import { ThemeProvider } from "@/providers/theme";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import App from "./App.tsx";

// Gracefully handle dynamic import chunk mismatches across deploys without infinite reload loops
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  const reloadKey = "aistudio_last_preload_reload";
  const lastReload = Number(sessionStorage.getItem(reloadKey) || "0");
  const now = Date.now();
  if (now - lastReload > 10000) {
    sessionStorage.setItem(reloadKey, String(now));
    window.location.reload();
  } else {
    console.warn("Module preload failed repeatedly, suppressing reload loop.");
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <TRPCProvider>
            <App />
            <Toaster richColors closeButton />
          </TRPCProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
