import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site-url";
import { listProductosSitemap } from "@/lib/productos.functions";
import { escapeXml } from "@/lib/seo";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  image?: { loc: string; title: string } | undefined;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const productos = await listProductosSitemap();

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/pedidos", changefreq: "weekly", priority: "0.8" },
          { path: "/politica-de-devoluciones", changefreq: "yearly", priority: "0.3" },
          ...productos.map((p) => ({
            path: `/producto/${encodeURIComponent(p.slug)}`,
            lastmod: p.updated_at.slice(0, 10),
            changefreq: "monthly" as const,
            priority: "0.6",
            image: p.image_url ? { loc: p.image_url, title: p.name } : undefined,
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${escapeXml(`${SITE_URL}${e.path}`)}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            e.image
              ? [
                  `    <image:image>`,
                  `      <image:loc>${escapeXml(e.image.loc)}</image:loc>`,
                  `      <image:title>${escapeXml(e.image.title)}</image:title>`,
                  `    </image:image>`,
                ].join("\n")
              : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
