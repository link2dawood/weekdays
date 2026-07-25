import { hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.jsx";

// hydrateRoot REUSES the prerendered HTML instead of createRoot().render()'s
// wipe-and-rebuild. The prerendered markup becomes the final paint, so LCP
// happens at first paint rather than after the JS bundle re-renders the tree.
hydrateRoot(
  document.getElementById("root"),
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
