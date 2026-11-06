import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UniConnect",
    short_name: "UniConnect",
    description: "Emploi du temps, notes, absences et annonces universitaires",
    start_url: "/",
    display: "standalone",
    background_color: "#f0fdfa",
    theme_color: "#0f766e",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
