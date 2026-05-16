import { mount, unmount } from "svelte";
import App from "./App.svelte";
import { loadSpecFromUrl } from "./state/actions";
import { initResizablePanes } from "./utils/resizable-panes";

export class ApiExplorerElement extends HTMLElement {
  static observedAttributes = ["url"];
  private _app: ReturnType<typeof mount> | null = null;

  connectedCallback() {
    if (!this.style.display) this.style.display = "block";
    if (!this.style.height) this.style.height = "100%";

    const initialUrl =
      this.getAttribute("url") ??
      new URLSearchParams(location.search).get("url") ??
      undefined;

    this._app = mount(App, { target: this, props: { initialUrl } });
    initResizablePanes(this);
  }

  disconnectedCallback() {
    if (this._app) {
      unmount(this._app);
      this._app = null;
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === "url" && newValue !== oldValue && this.isConnected && this._app) {
      loadSpecFromUrl(newValue!);
    }
  }
}
