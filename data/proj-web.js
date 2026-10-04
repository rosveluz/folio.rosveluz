import { mobilePlaceholder, placeholder } from "./project-placeholders.js";

export const webProjects = [
  {
    id: "studio-web-refresh",
    title: "Work Title",
    detail: "Detail",
    category: "Web Design",
    date: "2026-03-12",
    description:
      "A clean web design concept focused on clear hierarchy, quiet interaction, and responsive layouts that keep portfolio content easy to browse on every screen size.",
    cover: placeholder("Web Design Cover", 213),
    images: [
      { desktopSrc: placeholder("Web Image 01", 213), mobileSrc: mobilePlaceholder("Web Mobile 01", 213), caption: "Image Caption" },
      { desktopSrc: placeholder("Web Image 02", 208), mobileSrc: mobilePlaceholder("Web Mobile 02", 208), caption: "Image Caption" },
      { desktopSrc: placeholder("Web Image 03", 203), mobileSrc: mobilePlaceholder("Web Mobile 03", 203), caption: "Image Caption" },
    ],
  },
  {
    id: "product-landing",
    title: "Work Title",
    detail: "Detail",
    category: "Web Design",
    date: "2025-06-30",
    description:
      "A product landing placeholder for future web work, using consistent project data and image fields across desktop and mobile.",
    cover: placeholder("Landing Cover", 214),
    images: [
      { desktopSrc: placeholder("Landing Image 01", 214), mobileSrc: mobilePlaceholder("Landing Mobile 01", 214), caption: "Image Caption" },
      { desktopSrc: placeholder("Landing Image 02", 209), mobileSrc: mobilePlaceholder("Landing Mobile 02", 209), caption: "Image Caption" },
      { desktopSrc: placeholder("Landing Image 03", 204), mobileSrc: mobilePlaceholder("Landing Mobile 03", 204), caption: "Image Caption" },
    ],
  },
];
