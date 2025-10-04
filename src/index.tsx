import React from "react";
import { Container, createRoot } from "react-dom/client";
import App from "./App";
import "./css/index.css";

const root = createRoot(document.getElementById("root") as Container);
root.render(<App />);
