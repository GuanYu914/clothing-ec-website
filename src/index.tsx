import React from "react";
import ReactDOM from "react-dom";
// 添加自定義的 css 檔案
// 優先性排序先引入的最小，反之最大
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/reset.css";
import "./css/effect.css";
import "./css/font.css";
import "./css/global.css";
import App from "./App";
import store from "./redux/store";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { ROOT_DIR } from "./constant";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router basename={ROOT_DIR}>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
