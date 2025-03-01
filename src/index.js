import React from "react";
import { createRoot } from 'react-dom/client'; // Updated for React 18
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store from "./redux/store"; // Uses the fixed store
import { Provider } from "react-redux";
import "./styles/reset.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

reportWebVitals();
