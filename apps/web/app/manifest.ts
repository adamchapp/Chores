import type { MetadataRoute } from "next";

// Web app manifest for installability. The service worker (offline support)
// arrives in milestone M3.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chores",
    short_name: "Chores",
    description: "Turn household chores into a family adventure.",
    lang: "en-GB",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#6d28d9",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
