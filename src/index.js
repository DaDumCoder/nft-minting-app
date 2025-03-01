// src/index.js (after fix)
import React from "react";
import { createRoot } from 'react-dom/client'; // Line 2: Updated import
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store from "./redux/store";
import { Provider } from "react-redux";
import "./styles/reset.css";

const root = createRoot(document.getElementById("root")); // Line 9: New root creation
root.render( // Line 10: New render method
  <Provider store={store}>
    <App />
  </Provider>
);

reportWebVitals();
