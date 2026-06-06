/** Load-spec modal: URL input, file upload, and Petstore shortcut. */
import { useState } from "react";
import { useModal } from "../contexts";
import { useSpec, specActions } from "../../features/spec/spec-context";
import { loadSpecFromUrl, loadSpecFromFile } from "../state/actions";
import Modal from "./Modal";
import * as React from "react";

/** Renders the spec-loading modal. Visible when modalVisible is true. */
export default function LoadModal() {
  const { modalVisible, setModalVisible, setModalUrlValue } = useModal();
  const { loadError } = useSpec();
  const [urlValue, setUrlValue] = useState("");

  function close() {
    setModalVisible(false);
    specActions.setLoadError("");
  }

  async function loadUrl() {
    const url = urlValue.trim();
    if (!url) return;
    setModalUrlValue(url);
    await loadSpecFromUrl(url);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadSpecFromFile(file);
  }

  const title = (
    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Load OpenAPI specification</h2>
  );

  const footer = (
    <div className="flex items-center justify-between">
      <p className="text-[10px] text-gray-400 dark:text-gray-500">Supports OpenAPI 3.0 and 3.1</p>
      <button
        onClick={() => loadSpecFromUrl("https://petstore3.swagger.io/api/v3/openapi.json")}
        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        Try Petstore example
      </button>
    </div>
  );

  return (
    <Modal visible={modalVisible} onClose={close} title={title} footer={footer}>
      <div className="px-5 py-5 flex flex-col gap-4">

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">From URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://api.example.com/openapi.json"
              onKeyDown={(e) => e.key === "Enter" && loadUrl()}
              className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors"
            />
            <button
              onClick={loadUrl}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium transition-colors shrink-0"
            >
              Load
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">or</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">From file</label>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg px-4 py-5 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="text-xs text-gray-500 dark:text-gray-400">Drop .json or .yaml file, or click to browse</span>
            <input type="file" accept=".json,.yaml,.yml" className="hidden" onChange={onFileChange} />
          </label>
        </div>

        {loadError && (
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md px-3 py-2">
            {loadError}
          </p>
        )}

      </div>
    </Modal>
  );
}
