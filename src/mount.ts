// Core mount function — framework-agnostic entry point for embedding the API Explorer.
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import App from "./App";

/**
 * Mounts the API Explorer into `target` and returns a cleanup function that unmounts it.
 * @param target - The DOM element to render into.
 * @param options - Optional `url` of an OpenAPI spec to load on startup.
 */
export function mountApiExplorer(
  target: HTMLElement,
  options?: { url?: string }
): () => void {
  const root = createRoot(target);
  root.render(createElement(App, { initialUrl: options?.url }));
  return () => root.unmount();
}
