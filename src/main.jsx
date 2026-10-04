import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { migrateStorage } from "./lib/migrate";
import "./index.css";

// Must run before the first render: the hooks read storage synchronously.
migrateStorage();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
