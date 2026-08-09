import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Nosotros } from "@/components/site/Nosotros";
import { Aniversario } from "@/components/site/Aniversario";
import { Productos } from "@/components/site/Productos";
import { Pedidos } from "@/components/site/Pedidos";
import { Resenas } from "@/components/site/Resenas";
import { Contacto } from "@/components/site/Contacto";
import { Footer } from "@/components/site/Footer";

const title = "Papelería Yilbber | Papelería y útiles escolares en Duitama";
const description =
  "40 años en Duitama, Boyacá. Papelería, útiles escolares y artículos de oficina al detal y por mayor. Dos sedes: Cra. 15 No. 17-44 y Cra. 17 No. 18-26.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Papelería Yilbber",
          alternateName: "Publigráficas Yilbber",
          description,
          email: "yilbber.gerencia@gmail.com",
          areaServed: "Duitama, Boyacá, Colombia",
          location: [
            {
              "@type": "Place",
              name: "Sede principal",
              telephone: "+573112347090",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Cra. 15 No. 17-44",
                addressLocality: "Duitama",
                addressRegion: "Boyacá",
                addressCountry: "CO",
              },
            },
            {
              "@type": "Place",
              name: "Sucursal",
              telephone: "+573214512343",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Cra. 17 No. 18-26",
                addressLocality: "Duitama",
                addressRegion: "Boyacá",
                addressCountry: "CO",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Nosotros />
        <Aniversario />
        <Productos />
        <Pedidos />
        <Resenas />
        <Contacto />
      </main>
      <Footer />
    </div>
  );
}
