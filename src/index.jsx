import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./i18n/i18n"; // Import i18n configuration
import "./css/index.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
