// Per-page <head> tags for the pre-rendered pages (scripts/prerender.mjs):
// title, description, canonical URL, Open Graph / Twitter cards and
// schema.org structured data (Course, LearningResource, BreadcrumbList).
import { courseModules, lessonList } from "../data";
import { AUTHOR, REPO_URL, SITE_URL } from "../config";
import { HOME, pathFor, BASE } from "./routes";

const SITE_NAME = "Python for JS Developers";
const OG_IMAGE = `${SITE_URL}og-image.png`;

const HOME_TITLE = "Python for JavaScript Developers: Free Interactive Python Course";
const HOME_DESCRIPTION =
  "Learn Python through the JavaScript you already know. 33 free side-by-side lessons, common gotchas, and exercises that run real Python in your browser.";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

export const absoluteUrl = (key) => SITE_URL + pathFor(key).slice(BASE.length);

// First paragraph of the lesson, cut at a word boundary (~155 chars).
export function summarize(text, max = 155) {
  const first = text.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  if (first.length <= max) return first;
  const cut = first.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

const person = {
  "@type": "Person",
  name: AUTHOR.name,
  url: AUTHOR.linkedin,
  sameAs: [AUTHOR.linkedin],
};

function courseSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${SITE_URL}#course`,
    name: "Python for JavaScript Developers",
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    image: OG_IMAGE,
    inLanguage: "en",
    isAccessibleForFree: true,
    educationalLevel: "Intermediate",
    teaches: courseModules.map((m) => m.title),
    author: person,
    creator: person,
    provider: { ...person },
    license: "https://opensource.org/licenses/MIT",
    offers: { "@type": "Offer", category: "Free", price: 0, priceCurrency: "USD" },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: "PT6H" },
    syllabusSections: courseModules.map((m) => ({
      "@type": "Syllabus",
      name: m.title,
      description: `${m.subtitle}. Lessons: ${m.lessons.map((l) => l.title).join(", ")}.`,
    })),
  };
}

function homeHead() {
  return {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "en",
        author: person,
        sameAs: [REPO_URL],
      },
      courseSchema(),
    ],
  };
}

function lessonHead(key) {
  const entry = lessonList.find((e) => e.key === key);
  const { mod, lesson } = entry;
  const url = absoluteUrl(key);
  const description = summarize(lesson.content);
  return {
    title: `${lesson.title} (${mod.title}) · Python for JS Developers`,
    description,
    url,
    type: "article",
    schemas: [
      {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: `${lesson.title}: Python for JavaScript developers`,
        description,
        url,
        image: OG_IMAGE,
        inLanguage: "en",
        learningResourceType: "Lesson",
        educationalLevel: "Intermediate",
        isAccessibleForFree: true,
        teaches: lesson.title,
        author: person,
        isPartOf: { "@type": "Course", "@id": `${SITE_URL}#course`, name: "Python for JavaScript Developers", url: SITE_URL },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
          { "@type": "ListItem", position: 2, name: mod.title, item: absoluteUrl(`${mod.id}/${mod.lessons[0].id}`) },
          { "@type": "ListItem", position: 3, name: lesson.title, item: url },
        ],
      },
    ],
  };
}

export function headFor(key, { noindex = false } = {}) {
  const h = key === HOME ? homeHead() : lessonHead(key);
  return [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}" />`,
    `<meta name="author" content="${esc(AUTHOR.name)}" />`,
    `<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}" />`,
    noindex ? "" : `<link rel="canonical" href="${h.url}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${h.type}" />`,
    `<meta property="og:title" content="${esc(h.title)}" />`,
    `<meta property="og:description" content="${esc(h.description)}" />`,
    `<meta property="og:url" content="${h.url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Python for JS Developers: learn Python through the JavaScript you already know" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(h.title)}" />`,
    `<meta name="twitter:description" content="${esc(h.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    ...h.schemas.map(jsonLd),
  ]
    .filter(Boolean)
    .join("\n    ");
}

export function allRoutes() {
  return [
    { key: HOME, path: pathFor(HOME), file: "index.html" },
    ...lessonList.map((e) => ({ key: e.key, path: pathFor(e.key), file: `learn/${e.key}/index.html` })),
  ];
}

export function sitemapXml(lastmod) {
  const urls = allRoutes().map(
    (r) =>
      `  <url><loc>${absoluteUrl(r.key)}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>${r.key === HOME ? "1.0" : "0.8"}</priority></url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}
