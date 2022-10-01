import deepFreeze from "deep-freeze";
import { canUseDOM } from "fbjs/lib/ExecutionEnvironment";
import produce, { enableAllPlugins } from "immer";
import { createStore } from "redux";
import { noop } from "./lodash";

// use shim until react@18 when we can replace with `React.useSyncExternalStoreWithSelector`;
// see https://github.com/reactwg/react-18/discussions/86
/* eslint-disable import/order */
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";

enableAllPlugins();

export function createStoreContext(initialState, options) {
  const reducer = (state, action) => {
    // all reducers are passed undefined on initialization, so they should be
    // written such that when given undefined, some value should be returned.
    // see https://redux.js.org/usage/structuring-reducers/initializing-state
    if (!state) {
      return initialState;
    }

    // this isn't a typo, we intentionally use _type here
    // action.type is used by devtooling for naming so we use
    // create_setState below to set the type field to the mutation name
    // the end result is better redux devtools which have mutation names
    switch (action._type) {
      case Action.reset._type: {
        return initialState;
      }
      case Action.set._type: {
        // always ensure state is frozen
        // why? state can only be mutated via mutations
        return deepFreeze(action.nextState);
      }
      default:
        return state;
    }
  };

  // flow is complaining because empty object is not exactly equal to type
  // solving this requires an any somewhere, so we so it here
  // this just means nothing is available on those APIs
  // that is exactly what we want and intend, flow is wrong here
  // $FlowIgnore[incompatible-type]
  const select = {};
  // $FlowIgnore[incompatible-type]
  const mut = {};

  if (options?.selectors) {
    // bind all selectors to create a fresh instance for this store context
    for (const name of Object.keys(options.selectors)) {
      select[name] = options.selectors[name].bind({});
    }
  }

  const options_mutations = options?.mutations;
  if (options_mutations) {
    // create each mutation with a named set_state for redux devtools
    // this is strictly to have better redux devtooling
    // if we forgo devtools we can simplify all of this to 2 lines below
    //
    //     const setState = create_setState('set');
    //     mut = options_mutations({setState});
    //

    // create a shared params object used to generate mutations
    // we will replace the setState below with a named variant
    const params = { setState: create_setState("set") };

    // now walk each mutation and wrap it so we can pass in
    // the named setState variant which sets the type field
    for (const name of Object.keys(options_mutations(params))) {
      mut[name] = function wrapped_mut(...args) {
        params.setState = create_setState(name);
        const mut_map = options_mutations(params);
        const this_mut = mut_map[name];
        return this_mut(...args);
      };
    }
  }

  const store = createStore(reducer, initialState);

  function createReduxSelector(store) {
    // define our useSelector (same as react-redux)
    // uses the React `useSyncExternalStoreWithSelector` api
    // see https://github.com/reactwg/react-18/discussions/86
    // this allows us to work without wrapping the entire React tree
    return function useState(selector, equalityFn) {
      return useSyncExternalStoreWithSelector(
        store.subscribe, // subscribe, must return an unsubscribe function
        store.getState, // getSnapshot
        store.getState, // getServerSnapshot
        selector, // function which returns the selected subset of state
        equalityFn // return whether two selected states are equal
      );
    };
  }

  const useState = createReduxSelector(store);

  function create_setState(name) {
    return function setState(setterFn) {
      const currentState = store.getState();

      // use immer to produce the next state
      const nextState = produce(currentState, setterFn);

      store.dispatch({ ...Action.set, type: name, nextState });
    };
  }

  function reset() {
    store.dispatch(Action.reset);
  }

  const api = {
    store,

    useState,

    getState: store.getState,
    setState: create_setState("set"),

    mut,
    select,

    undo: noop,
    redo: noop,
    reset,
  };

  return api;
}

const Action = Object.freeze({
  reset: { _type: "reset", type: "reset" },
  set: { _type: "set", type: "set" },
});
