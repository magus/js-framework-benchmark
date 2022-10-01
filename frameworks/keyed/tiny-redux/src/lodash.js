// @flow strict
export const noop = () => {};

export function cloneDeep(anything) {
  // TestGuid[E3143242517A]
  // there are 6 primitive data types
  // undefined  typeof instance === "undefined"
  // Boolean    typeof instance === "boolean"
  // Number     typeof instance === "number"
  // String     typeof instance === "string"
  // BigInt     typeof instance === "bigint"
  // Symbol     typeof instance === "symbol"
  // ...and 2 structural types
  // Object     typeof instance === "object"
  // Function   typeof instance === "function"
  // Read more at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures

  // This handles 7 of the 8 total types, letting only object fall through
  // undefined, Boolean, Number, String, BigInt, Symbol and Function
  if (typeof anything !== "object") {
    return anything;
  }

  // Everything below this point is an object

  // null is a special kind of object we should just return
  // TestGuid[3D7DBC20E137]
  if (anything === null) {
    return anything;
  }

  // Arrays
  // TestGuid[DDA5795EAB69]
  if (Array.isArray(anything)) {
    return anything.map(cloneDeep);
  }

  // Objects
  // TestGuid[FAC8EC97A5C5]
  // $FlowFixMe[incompatible-return] Cannot return `mapValues(...)` because  object type [1] is incompatible with  `T` [2].
  return mapValues(anything, (value) => cloneDeep(value));
}

function mapValues(obj, fn) {
  return Object.keys(obj).reduce((newObj, key) => {
    const newValue = fn(obj[key], key, obj);
    newObj[key] = newValue;
    return newObj;
  }, {});
}

export function merge(target, ...sources) {
  if (sources.length < 1) {
    return target;
  }
  sources.forEach((source) => {
    if (source) {
      deepMerge(target, source);
    }
  });
  return target;
}

const isNotObject = (val) => {
  return (
    val === undefined ||
    val === null ||
    typeof val !== "object" ||
    Array.isArray(val)
  );
};

const deepMerge = (target, source) => {
  if (!source) {
    return target;
  }
  Object.keys(source).forEach((key) => {
    const targetVal = target[key];
    const sourceVal = source[key];

    if (sourceVal === undefined) {
      // if source val explicitly set to undefined, remove from target
      delete target[key];
    } else if (isNotObject(targetVal)) {
      // if target is a simple (non-object) type, replace target with source val
      if (isNotObject(sourceVal)) {
        target[key] = sourceVal;
      } else {
        target[key] = deepMerge({}, sourceVal);
      }
    } else if (isNotObject(sourceVal)) {
      // no merge needed, replace target with source val
      target[key] = sourceVal;
    } else {
      // both object, needs to deep merge
      target[key] = deepMerge(targetVal, sourceVal);
    }
  });
  return target;
};
