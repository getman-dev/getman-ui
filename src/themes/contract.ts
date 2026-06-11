/**
 * AppTheme — the full theme contract, assembled from per-component interfaces.
 * This file only imports types; it contains no styling values.
 */
import type { AppRootTheme }         from './components/app-root';
import type { NavTheme }             from './components/nav';
import type { EndpointTheme }        from './components/endpoint';
import type { AuthModalTheme }       from './components/auth-modal';
import type { ServerConfigTheme }    from './components/server-config';
import type { SchemaViewerTheme }    from './components/schema-viewer';
import type { SchemaNodeTheme }      from './components/schema-node';
import type { SchemaDetailTheme }    from './components/schema-detail';
import type { PlaygroundTheme }      from './components/playground';
import type { AuthStatusTheme }      from './components/auth-status';
import type { BodyEditorTheme }      from './components/body-editor';
import type { ParamLabelTheme }      from './components/param-label';
import type { ResponsePanelTheme }   from './components/response-panel';
import type { SendBarTheme }         from './components/send-bar';
import type {
  ScalarInputTheme,
  BooleanSelectTheme,
  EnumSelectTheme,
  FileInputTheme,
  ArrayInputTheme,
  MultiSelectTheme,
  ObjectInputTheme,
}                                    from './components/inputs';
import type { CommandBarTheme }      from './components/command-bar';
import type { LoadModalTheme }       from './components/load-modal';
import type { ModalTheme }           from './components/modal';
import type { TopBarTheme }          from './components/top-bar';
import type { DetailPaneTheme }      from './components/detail-pane';
import type { VerticalResizableTheme } from './components/vertical-resizable';
import type { SyntaxTheme }          from './components/syntax';

export type {
  AppRootTheme,
  NavTheme,
  EndpointTheme,
  AuthModalTheme,
  ServerConfigTheme,
  SchemaViewerTheme,
  SchemaNodeTheme,
  SchemaDetailTheme,
  PlaygroundTheme,
  AuthStatusTheme,
  BodyEditorTheme,
  ParamLabelTheme,
  ResponsePanelTheme,
  SendBarTheme,
  ScalarInputTheme,
  BooleanSelectTheme,
  EnumSelectTheme,
  FileInputTheme,
  ArrayInputTheme,
  MultiSelectTheme,
  ObjectInputTheme,
  CommandBarTheme,
  LoadModalTheme,
  ModalTheme,
  TopBarTheme,
  DetailPaneTheme,
  VerticalResizableTheme,
  SyntaxTheme,
};

/** The complete theme contract. Every built-in and custom theme must satisfy this interface. */
export interface AppTheme {
  /** Display name shown in the theme picker UI. */
  name:              string;

  // Layout & shell
  appRoot:           AppRootTheme;
  detailPane:        DetailPaneTheme;
  verticalResizable: VerticalResizableTheme;

  // Navigation
  nav:               NavTheme;

  // Content views
  endpoint:          EndpointTheme;
  schema:            SchemaViewerTheme;
  schemaNode:        SchemaNodeTheme;
  schemaDetail:      SchemaDetailTheme;

  // Playground
  playground:        PlaygroundTheme;
  authStatus:        AuthStatusTheme;
  bodyEditor:        BodyEditorTheme;
  paramLabel:        ParamLabelTheme;
  responsePanel:     ResponsePanelTheme;
  sendBar:           SendBarTheme;
  inputScalar:       ScalarInputTheme;
  inputBoolean:      BooleanSelectTheme;
  inputEnum:         EnumSelectTheme;
  inputFile:         FileInputTheme;
  inputArray:        ArrayInputTheme;
  inputMultiSelect:  MultiSelectTheme;
  inputObject:       ObjectInputTheme;

  // Auth & server
  authModal:         AuthModalTheme;
  serverConfig:      ServerConfigTheme;

  // Shared components
  topBar:            TopBarTheme;
  modal:             ModalTheme;
  loadModal:         LoadModalTheme;
  commandBar:        CommandBarTheme;

  // Utilities
  syntax:            SyntaxTheme;
  /** Tailwind bg class for the resize handle divider line. */
  paneHandle:        string;
  /** Tailwind ring classes applied to focused interactive elements. */
  focusRing:         string;
  scrollbar:         { thumb: string; thumbHover: string };
}