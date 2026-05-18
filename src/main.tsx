import "@fortawesome/fontawesome-free/css/all.min.css";
import { ConfigProvider } from "antd";
import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./redux/features/store";
import AppRoutes from "./routes/routes";
import SessionRestoreProvider from "./providers/SessionRestoreProvider";
import AuthSessionSyncProvider from "./providers/AuthSessionSyncProvider";
import SocketManager from "./components/common/SocketManager";
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
            <AuthSessionSyncProvider>
              <SessionRestoreProvider>
                <SocketManager />
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
                <AppRoutes />
              </SessionRestoreProvider>
            </AuthSessionSyncProvider>
          </PersistGate>
        </Provider>
      </HelmetProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
