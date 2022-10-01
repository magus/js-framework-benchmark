import * as React from "react";
import { createRoot } from "react-dom/client";
import { TinyRedux } from "./TinyRedux";

const container = document.getElementById("main");
const root = createRoot(container);
root.render(<Main />);

function Main() {
  const items = store.useState((state) => state.data);

  return (
    <div className="container">
      <Jumbotron />
      <table className="table table-hover table-striped test-data">
        <tbody>
          {items.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </tbody>
      </table>
      <span
        className="preloadicon glyphicon glyphicon-remove"
        aria-hidden="true"
      />
    </div>
  );
}

function Row(props) {
  const item = props.item;

  const isSelected = store.useState((state) => state.selected === item.id);

  return (
    <tr className={isSelected ? "danger" : ""}>
      <td className="col-md-1">{item.id}</td>
      <td className="col-md-4">
        <a onClick={() => store.mut.select(item.id)}>{item.label}</a>
      </td>
      <td className="col-md-1">
        <a onClick={() => store.mut.remove(item.id)}>
          <span className="glyphicon glyphicon-remove" aria-hidden="true" />
        </a>
      </td>
      <td className="col-md-6" />
    </tr>
  );
}

function Jumbotron() {
  const { run, runLots, add, update, clear, swapRows } = store.mut;

  return (
    <div className="jumbotron">
      <div className="row">
        <div className="col-md-6">
          <h1>Tiny Redux (keyed)</h1>
        </div>
        <div className="col-md-6">
          <div className="row">
            <Button id="run" text="Create 1,000 rows" cb={run} />
            <Button id="runlots" text="Create 10,000 rows" cb={runLots} />
            <Button id="add" text="Append 1,000 rows" cb={add} />
            <Button id="update" text="Update every 10th row" cb={update} />
            <Button id="clear" text="Clear" cb={clear} />
            <Button id="swaprows" text="Swap Rows" cb={swapRows} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Button(props) {
  return (
    <div className="col-sm-6 smallpad">
      <button
        type="button"
        className="btn btn-primary btn-block"
        id={props.id}
        onClick={props.cb}
      >
        {props.text}
      </button>
    </div>
  );
}

const store = new TinyRedux.Global(
  {
    data: [],
    selected: null,
  },
  {
    mutations: (options) => ({
      run() {
        options.setState((state) => {
          state.data = buildData(1000);
        });
      },

      runLots() {
        options.setState((state) => {
          state.data = buildData(10000);
        });
      },

      add() {
        options.setState((state) => {
          state.data = state.data.concat(buildData(1000));
        });
      },

      update() {
        options.setState((state) => {
          for (let i = 0, len = state.data.length; i < len; i += 10) {
            state.data[i].label = state.data[i].label + " !!!";
          }
        });
      },

      clear() {
        options.setState((state) => {
          state.data = [];
        });
      },

      swapRows() {
        options.setState((state) => {
          if (state.data.length > 998) {
            let tmp = state.data[1];
            state.data[1] = state.data[998];
            state.data[998] = tmp;
          }
        });
      },

      remove(id) {
        options.setState((state) => {
          const idx = state.data.findIndex((d) => d.id === id);
          state.data.splice(idx, 1);
        });
      },

      select(id) {
        options.setState((state) => {
          state.selected = id;
        });
      },
    }),
  }
);

window.store = store;

let nextId = 1;

function buildData(count) {
  const data = new Array(count);

  for (let i = 0; i < count; i++) {
    data[i] = {
      id: nextId++,
      label: `${A[random(A.length)]} ${C[random(C.length)]} ${
        N[random(N.length)]
      }`,
    };
  }

  return data;
}

const random = (max) => Math.round(Math.random() * 1000) % max;

const A = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy",
];

const C = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "brown",
  "white",
  "black",
  "orange",
];

const N = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard",
];
