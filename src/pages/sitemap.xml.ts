import type { APIRoute } from "astro";

const SITE_URL =
  import.meta.env.PUBLIC_SITE_URL ?? "https://atlas.proysocial.org";

const pages = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
];

export const GET: APIRoute = () => {
  const urls = pages
    .map(
      (p) => `  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
