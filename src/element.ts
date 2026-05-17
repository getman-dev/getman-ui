// Web component shell — mounts and unmounts the React App into the custom element.
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import type { Root } from "react-dom/client";
import App from "./App";
import { loadSpecFromUrl } from "./state/actions";

export class ApiExplorerElement extends HTMLElement {
  static observedAttributes = ["url"];
  private _root: Root | null = null;

  connectedCallback() {
    if (!this.style.display) this.style.display = "block";
    if (!this.style.height) this.style.height = "100%";
    const url = this.getAttribute("url") ?? undefined;
    this._root = createRoot(this);
    this._root.render(createElement(App, { initialUrl: url }));
  }

  disconnectedCallback() {
    this._root?.unmount();
    this._root = null;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === "url" && newValue !== oldValue && this.isConnected) {
      loadSpecFromUrl(newValue!);
    }
  }
}
