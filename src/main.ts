import "./style.css";
import { ApiExplorerElement } from "./element";

if (!customElements.get("api-explorer")) {
  customElements.define("api-explorer", ApiExplorerElement);
}