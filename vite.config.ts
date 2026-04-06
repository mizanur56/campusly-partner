import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
// base: "/" ensures HTML references assets at /assets/...
// nginx preserves / prefix when forwarding
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://campustransferapi.thezoomit.com",
        changeOrigin: true,
        secure: true,
      },
    },
    allowedHosts: ["partner.gubdi.com"],
  },
});
