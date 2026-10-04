import { mobilePlaceholder, placeholder } from "./project-placeholders.js";

export const graphicsProjects = [
  {
    id: "graphic-series",
    title: "Work Title",
    detail: "Detail",
    category: "Graphics",
    date: "2025-12-08",
    description:
      "A graphic design series placeholder for posters, campaign assets, and visual systems that balance strong composition with restrained detail.",
    cover: placeholder("Graphics Cover", 209),
    images: [
      { desktopSrc: placeholder("Graphics Image 01", 209), mobileSrc: mobilePlaceholder("Graphics Mobile 01", 209), caption: "Image Caption" },
      { desktopSrc: placeholder("Graphics Image 02", 204), mobileSrc: mobilePlaceholder("Graphics Mobile 02", 204), caption: "Image Caption" },
      { desktopSrc: placeholder("Graphics Image 03", 199), mobileSrc: mobilePlaceholder("Graphics Mobile 03", 199), caption: "Image Caption" },
    ],
  },
  {
    id: "digital-campaign",
    title: "Work Title",
    detail: "Detail",
    category: "Graphics",
    date: "2025-08-14",
    description:
      "A digital campaign placeholder project prepared for visual assets, captions, and category filtering as the portfolio grows.",
    cover: placeholder("Campaign Cover", 212),
    images: [
      { desktopSrc: placeholder("Campaign Image 01", 212), mobileSrc: mobilePlaceholder("Campaign Mobile 01", 212), caption: "Image Caption" },
      { desktopSrc: placeholder("Campaign Image 02", 207), mobileSrc: mobilePlaceholder("Campaign Mobile 02", 207), caption: "Image Caption" },
      { desktopSrc: placeholder("Campaign Image 03", 202), mobileSrc: mobilePlaceholder("Campaign Mobile 03", 202), caption: "Image Caption" },
    ],
  },
];
