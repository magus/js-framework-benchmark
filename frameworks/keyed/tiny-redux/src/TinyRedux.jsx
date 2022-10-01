import * as React from "react";
import deepFreeze from "deep-freeze";
import { createStoreContext } from "./createStoreContext";
import { GlobalTinyRedux } from "./GlobalTinyRedux";
import { TinyReduxError } from "./TinyReduxError";
import { cloneDeep, merge } from "./lodash";

TinyRedux.Global = GlobalTinyRedux;

/**
 *
 * Create a new `TinyRedux` store
 *
 * ---
 *
 * 💡 Learn more at http://go/tinyredux
 */
export function TinyRedux(_state, options) {
  // copy the initial state so we do not maintain any references
  const initialState = deepFreeze(cloneDeep(_state));

  const UninitializedContext = new AlwaysErrorObject(
    "TinyRedux must wrap a React tree, e.g. `<Store.Provider>`"
  );

  const SharedContext = React.createContext(UninitializedContext);

  // create api instance and share with tree via context
  function Provider(props) {
    // combine props.state with initialState
    // this allows override the default state
    // useful for defining scoped stores and also tests
    const mergedState = merge({}, initialState, props.state);

    const clonedOptions = cloneDeep(options || {});

    if (props.name) {
      clonedOptions.name = props.name;
    }

    const isSetup = React.useRef(false);

    const contextValue = React.useRef(
      createStoreContext(mergedState, clonedOptions)
    );

    // Q: Why is this inline?
    // A: We want this to fire immediately for tests, etc.
    if (!isSetup.current) {
      isSetup.current = true;
      if (props.onSetup) {
        props.onSetup(contextValue.current);
      }
    }

    return (
      <SharedContext.Provider value={contextValue.current}>
        {props.children}
      </SharedContext.Provider>
    );
  }

  function useActions() {
    const context = React.useContext(SharedContext);
    // remove fields not exposed on actions
    const { store, useState, ...actions } = context;
    return actions;
  }

  function useState(selector, equalityFn) {
    const context = React.useContext(SharedContext);
    return context.useState(selector, equalityFn);
  }

  function useSelect(selectSelectorFn) {
    const context = React.useContext(SharedContext);
    const selector = selectSelectorFn(context.select);
    return context.useState(selector);
  }

  return { Provider, useActions, useState, useSelect };
}

function AlwaysErrorObject(errorMessage) {
  const error = new TinyReduxError(errorMessage);

  // this generic proxy will throw an error when accessing any fields
  // when accessing a store that was not setup previously with a Provider
  // we want the api to fail loudly so developers can easily fix it
  // $FlowIgnore[incompatible-return]
  return new Proxy(
    {},
    {
      get() {
        throw error;
      },
      set() {
        throw error;
      },
    }
  );
}
