/**
 * AppTheme — the full theme contract, assembled from per-component interfaces.
 * This file only imports types; it contains no styling values.
 */
import type { NavTheme }          from '../features/nav/Nav';
import type { EndpointTheme }     from '../features/endpoint/EndpointDetail';
import type { PlaygroundTheme }   from '../features/playground/Playground';
import type { TopBarTheme }       from '../shared/components/TopBar';
import type { ModalTheme }        from '../shared/components/Modal';
import type { SchemaTheme }       from '../features/schema/SchemaViewer';
import type { AuthModalTheme }    from '../features/auth/AuthModal';
import type { ServerConfigTheme } from '../features/server/ServerConfig';
import type { CommandBarTheme }   from '../shared/components/CommandBar';
import type { SyntaxTheme }       from '../shared/utils/highlight';

export type {
  NavTheme,
  EndpointTheme,
  PlaygroundTheme,
  TopBarTheme,
  ModalTheme,
  SchemaTheme,
  AuthModalTheme,
  ServerConfigTheme,
  CommandBarTheme,
  SyntaxTheme,
};

/** The complete theme contract. Every built-in and custom theme must satisfy this interface. */
export interface AppTheme {
  /** Display name shown in the theme picker UI. */
  name:         string;
  nav:          NavTheme;
  endpoint:     EndpointTheme;
  playground:   PlaygroundTheme;
  topBar:       TopBarTheme;
  modal:        ModalTheme;
  schema:       SchemaTheme;
  authModal:    AuthModalTheme;
  serverConfig: ServerConfigTheme;
  commandBar:   CommandBarTheme;
  syntax:       SyntaxTheme;
  /** Tailwind bg class for the resize handle divider line. */
  paneHandle:   string;
  /** Tailwind ring classes applied to focused interactive elements. */
  focusRing:    string;
  scrollbar:    { thumb: string; thumbHover: string };
}