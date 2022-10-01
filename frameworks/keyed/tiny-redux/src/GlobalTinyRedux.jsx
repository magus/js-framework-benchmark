// @flow strict
import deepFreeze from "deep-freeze";
import { createStoreContext } from "./createStoreContext";
import { cloneDeep } from "./lodash";

/**
 *
 * Create a global `TinyRedux` store singleton
 *
 * ---
 * 🚨 IMPORTANT: this is a singleton and is shared globally
 * 💡 Learn more at http://go/tinyredux
 */
export function GlobalTinyRedux(_state, options) {
  // copy the initial state so we do not maintain any references
  const initialState = deepFreeze(cloneDeep(_state));

  return createStoreContext(initialState, options);
}
