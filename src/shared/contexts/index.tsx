/** Composes all state providers into a single AppProviders wrapper. */
import type { ReactNode } from "react";
import { SpecProvider } from "../../features/spec/spec-context";
import { NavProvider } from "../../features/nav/nav-context";
import { ServerProvider } from "../../features/server/server-context";
import { AuthProvider } from "../../features/auth/auth-context";
import { PlaygroundProvider } from "../../features/playground/playground-context";
import { ModalProvider } from "./modal-context";

export * from "../../features/spec/spec-context";
export * from "../../features/nav/nav-context";
export * from "../../features/server/server-context";
export * from "../../features/auth/auth-context";
export * from "../../features/playground/playground-context";
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
