/** Composes all state providers into a single AppProviders wrapper. */
import type { ReactNode } from "react";
import { SpecProvider } from "./spec-context";
import { NavProvider } from "./nav-context";
import { ServerProvider } from "./server-context";
import { AuthProvider } from "./auth-context";
import { PlaygroundProvider } from "./playground-context";
import { ModalProvider } from "./modal-context";

export * from "./spec-context";
export * from "./nav-context";
export * from "./server-context";
export * from "./auth-context";
export * from "./playground-context";
export * from "./modal-context";

/** Wraps the React tree with all app state providers. Render at the root. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SpecProvider>
      <NavProvider>
        <ServerProvider>
          <AuthProvider>
            <PlaygroundProvider>
              <ModalProvider>{children}</ModalProvider>
            </PlaygroundProvider>
          </AuthProvider>
        </ServerProvider>
      </NavProvider>
    </SpecProvider>
  );
}
