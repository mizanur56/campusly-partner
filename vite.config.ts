import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const workspaceSharedRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../workspace-shared",
);

// https://vite.dev/config/
// base: "/" ensures HTML references assets at /assets/...
// nginx preserves / prefix when forwarding
export default defineConfig({
  base: "/",
  resolve: {
    alias: { "@workspace-shared": workspaceSharedRoot },
  },
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
      // Static uploads proxy for local dev (avoids CORS for pdf.js/react-pdf)
      "/uploads": {
        target: "http://localhost:5030",
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: ["partner.gubdi.com"],
  },
});
