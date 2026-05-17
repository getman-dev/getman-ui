import "./style.css";
import { mountApiExplorer } from "./mount";

export { mountApiExplorer };

// Auto-mount all [data-api-explorer] elements (mirrors loader.ts, without font/style injection).
function autoMount() {
  document.querySelectorAll<HTMLElement>("[data-api-explorer]").forEach(el => {
    const url = el.getAttribute("data-api-explorer") || undefined;
    mountApiExplorer(el, { url });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMount);
} else {
  autoMount();
}
