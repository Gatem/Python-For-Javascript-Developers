import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { migrateStorage } from "./lib/migrate";
// Self-hosted fonts (no third-party requests, no render-blocking font CSS).
import "@fontsource-variable/geist/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./index.css";

// Must run before the first render: the hooks read storage synchronously.
migrateStorage();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
