/** Load-spec modal: URL input, file upload, and Petstore shortcut. */
import * as React from "react";
import {useState} from "react";
import {useModal} from "../contexts";
import {specActions, useSpec} from "../../features/spec/spec-context";
import {loadSpecFromFile, loadSpecFromUrl} from "../state/actions";
import Modal from "./Modal";
import {slot, type ThemeSlot} from "../../themes/slot";
import {useTheme} from "../../themes/context";

export interface LoadModalTheme {
  title: ThemeSlot;
  footerText: ThemeSlot;
  petstoreLink: ThemeSlot;
  urlLabel: ThemeSlot;
  urlInput: ThemeSlot;
  dividerLine: ThemeSlot;
  dividerText: ThemeSlot;
  fileLabel: ThemeSlot;
  fileDropZone: ThemeSlot;
  fileDropIcon: ThemeSlot;
  fileDropText: ThemeSlot;
  errorBanner: ThemeSlot;
}

/** Renders the spec-loading modal. Visible when modalVisible is true. */
export default function LoadModal() {
  const t = useTheme().loadModal;
  const {modalVisible, setModalVisible, setModalUrlValue} = useModal();
  const {loadError} = useSpec();
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
      <h2 className={slot(t.title)}>Load OpenAPI specification</h2>
  );

  const footer = (
      <div className="flex items-center justify-between">
        <p className={slot(t.footerText)}>Supports OpenAPI 3.0 and 3.1</p>
        <button
            onClick={() => loadSpecFromUrl("https://petstore3.swagger.io/api/v3/openapi.json")}
            className={slot(t.petstoreLink)}
        >
          Try Petstore example
        </button>
      </div>
  );

  return (
      <Modal visible={modalVisible} onClose={close} title={title} footer={footer}>
        <div className="px-5 py-5 flex flex-col gap-4">

          <div>
            <label className={slot(t.urlLabel)}>From URL</label>
            <div className="flex gap-2">
              <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://api.example.com/openapi.json"
                  onKeyDown={(e) => e.key === "Enter" && loadUrl()}
                  className={slot(t.urlInput)}
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
            <div className={slot(t.dividerLine)}></div>
            <span className={slot(t.dividerText)}>or</span>
            <div className={slot(t.dividerLine)}></div>
          </div>

          <div>
            <label className={slot(t.fileLabel)}>From file</label>
            <label className={slot(t.fileDropZone)}>
              <svg className={slot(t.fileDropIcon)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span className={slot(t.fileDropText)}>Drop a .json file, or click to browse</span>
              <input type="file" accept=".json" className="hidden" onChange={onFileChange}/>
            </label>
          </div>

          {loadError && (
              <p className={slot(t.errorBanner)}>{loadError}</p>
          )}

        </div>
      </Modal>
  );
}