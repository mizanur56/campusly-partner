import "@fortawesome/fontawesome-free/css/all.min.css";
import { ConfigProvider } from "antd";
import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./redux/features/store";
import router from "./routes/routes";
import "./styles/index.css";

const config = {
  token: {
    colorPrimary: "#237d3b",
    colorLink: "#237d3b",
    colorPrimaryBg: "#237d3b30",
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider theme={config}>
      <HelmetProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
            <RouterProvider
              //  React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
              future={{
                v7_startTransition: true,
              }}
              router={router}
            />
          </PersistGate>
        </Provider>
      </HelmetProvider>
    </ConfigProvider>
  </React.StrictMode>
);
