import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site-url";
import { listProductosSitemap } from "@/lib/productos.functions";
import { escapeXml } from "@/lib/seo";
import { categorias } from "@/components/tienda/images";

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

        // Sólo las categorías con productos: una página vacía no le sirve a nadie.
        const ultimaPorCategoria = new Map<string, string>();
        for (const p of productos) {
          const fecha = p.updated_at.slice(0, 10);
          if (fecha > (ultimaPorCategoria.get(p.category) ?? "")) {
            ultimaPorCategoria.set(p.category, fecha);
          }
        }

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/pedidos", changefreq: "weekly", priority: "0.8" },
          { path: "/politica-de-devoluciones", changefreq: "yearly", priority: "0.3" },
          ...categorias.flatMap((c) => {
            const lastmod = ultimaPorCategoria.get(c.id);
            if (c.id === "todos" || !lastmod) return [];
            return [
              {
                path: `/categoria/${c.id}`,
                lastmod,
                changefreq: "weekly" as const,
                priority: "0.7",
              },
            ];
          }),
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
