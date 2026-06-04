import styles from "./style.css?inline";
import { mountApiExplorer, autoMount } from "./mount";

export { mountApiExplorer };

function ensureFonts() {
  if (document.querySelector("link[data-api-explorer-fonts]")) return;
  const p1 = Object.assign(document.createElement("link"), { rel: "preconnect", href: "https://fonts.googleapis.com" });
  const p2 = Object.assign(document.createElement("link"), { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" });
  const font = Object.assign(document.createElement("link"), {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
  });
  font.setAttribute("data-api-explorer-fonts", "");
  document.head.append(p1, p2, font);
}

function ensureStyles() {
  if (document.querySelector("style[data-api-explorer-styles]")) return;
  const el = document.createElement("style");
  el.setAttribute("data-api-explorer-styles", "");
  el.textContent = styles;
  document.head.appendChild(el);
}

ensureFonts();
ensureStyles();
autoMount();
