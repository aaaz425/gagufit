import type { MetadataRoute } from "next";
import { SITE_URL } from "@/site/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/terms", "/privacy"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
