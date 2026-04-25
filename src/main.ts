import "./style.css";
import { initApp } from "./app";
import { initResizablePanes } from "./utils/resizable-panes";

document.addEventListener("DOMContentLoaded", () => {
  initResizablePanes();
  initApp();
});
