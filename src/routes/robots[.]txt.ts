import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site-url";

// Antes era public/robots.txt, un archivo estático con el dominio escrito a
// mano. Se sirve desde una ruta para que la línea Sitemap siga a SITE_URL.
const USER_AGENTS = ["Googlebot", "Bingbot", "Twitterbot", "facebookexternalhit", "*"];

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = [
          ...USER_AGENTS.map((agent) => `User-agent: ${agent}\nAllow: /`),
          `Sitemap: ${SITE_URL}/sitemap.xml`,
        ].join("\n\n");

        return new Response(`${body}\n`, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
