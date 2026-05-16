/** Owns authentication credentials and auth modal visibility. */
import type { AuthValues } from "../types/openapi";

export const authState = $state({
  authValues: {} as AuthValues,
  authModalVisible: false,
});