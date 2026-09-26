import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Nitro detecta Vercel en el build y genera .vercel/output; en local construye
// un servidor Node (`npm run preview` lo sirve).
export default defineConfig(({ command }) => ({
  server: { host: "::", port: 8080 },
  css: { transformer: "lightningcss" },
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // src/server.ts envuelve el entry de Start para mostrar una página de error
      // propia cuando el SSR falla.
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    command === "build" && nitro(),
    viteReact(),
  ],
}));
