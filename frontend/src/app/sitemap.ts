import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://foodvilla.vercel.app";

/**
 * Static sitemap for the public-facing routes. Restaurant detail pages are
 * data-driven so we leave them out of the static map — listing crawl discovers
 * them via the `/restaurants` index page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/restaurants",
    "/about",
    "/help",
    "/offers",
    "/careers",
    "/partner/restaurant",
    "/partner/delivery",
    "/privacy",
    "/terms",
    "/login",
    "/signup",
  ];
  return routes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/restaurants" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/restaurants" ? 0.9 : 0.6,
  }));
}
