/** Owns server selection, URL variables, and server popover visibility source. */
import type { Server } from "../types/openapi";

export const serverState = $state({
  selectedServer: "",
  serverVariables: {} as Record<string, string>,
  serverPopoverSource: null as "topbar" | "playground" | null,
});

/** Builds initial variable values from a server's variable defaults. */
export function initServerVariables(server: Server | undefined): Record<string, string> {
  if (!server?.variables) return {};
  return Object.fromEntries(
    Object.entries(server.variables).map(([name, v]) => [name, v.default])
  );
}