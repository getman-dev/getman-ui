/** Owns server selection, URL variables, and server popover visibility source. */
import type { Server } from "../types/openapi";

/** Builds initial variable values from a server's variable defaults. */
export function initServerVariables(server: Server | undefined): Record<string, string> {
  if (!server?.variables) return {};
  return Object.fromEntries(
    Object.entries(server.variables).map(([name, v]) => [name, v.default])
  );
}

function createServerState() {
  let selectedServer = "";
  let serverVariables: Record<string, string> = {};
  let serverPopoverSource: "topbar" | "playground" | null = null;
  const subs = new Set<() => void>();
  const notify = () => subs.forEach(fn => fn());

  return {
    get selectedServer()      { return selectedServer; },
    get serverVariables()     { return serverVariables; },
    get serverPopoverSource() { return serverPopoverSource; },
    init(server: Server | undefined) {
      selectedServer = server?.url ?? "";
      serverVariables = initServerVariables(server);
      notify();
    },
    setServer(url: string, variables: Record<string, string>) {
      selectedServer = url; serverVariables = variables; notify();
    },
    setVariable(name: string, value: string) {
      serverVariables = { ...serverVariables, [name]: value }; notify();
    },
    setPopoverSource(source: "topbar" | "playground" | null) { serverPopoverSource = source; notify(); },
    clear() { selectedServer = ""; serverVariables = {}; serverPopoverSource = null; notify(); },
    sub(fn: () => void) { subs.add(fn); return () => subs.delete(fn); },
  };
}

export const serverState = createServerState();