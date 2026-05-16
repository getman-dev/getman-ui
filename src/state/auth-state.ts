/** Owns authentication credentials and auth modal visibility. */
import type { AuthValues, AuthSchemeValue } from "../types/openapi";

function createAuthState() {
  let authValues: AuthValues = {};
  let authModalVisible = false;
  const subs = new Set<() => void>();
  const notify = () => subs.forEach(fn => fn());

  return {
    get authValues()       { return authValues; },
    get authModalVisible() { return authModalVisible; },
    setSchemeAuth(scheme: string, value: AuthSchemeValue) {
      authValues = { ...authValues, [scheme]: value }; notify();
    },
    clearSchemeAuth(scheme: string) {
      const { [scheme]: _, ...rest } = authValues;
      authValues = rest;
      notify();
    },
    openModal()  { authModalVisible = true;  notify(); },
    closeModal() { authModalVisible = false; notify(); },
    sub(fn: () => void) { subs.add(fn); return () => subs.delete(fn); },
  };
}

export const authState = createAuthState();