import { mobilePlaceholder, placeholder } from "./project-placeholders.js";

export const logoProjects = [
  {
    id: "sleek-logo-system",
    title: "Work Title",
    detail: "Detail",
    category: "Logo Design",
    date: "2026-04-20",
    description:
      "Explore our Logo Design portfolio featuring a diverse range of projects that showcase our creativity and attention to detail. Each design is carefully crafted to reflect the unique identity and vision of our clients. From sleek and modern to classic and timeless, our work speaks for itself.",
    cover: placeholder("Logo Design Cover", 218),
    images: [
      {
        desktopSrc: placeholder("Desktop Image 01", 216),
        mobileSrc: mobilePlaceholder("Mobile Image 01", 216),
        caption: "Image Caption",
      },
      {
        desktopSrc: placeholder("Desktop Image 02", 211),
        mobileSrc: mobilePlaceholder("Mobile Image 02", 211),
        caption: "Image Caption",
      },
      {
        desktopSrc: placeholder("Desktop Image 03", 205),
        mobileSrc: mobilePlaceholder("Mobile Image 03", 205),
        caption: "Image Caption",
      },
    ],
  },
  {
    id: "identity-concept",
    title: "Work Title",
    detail: "Detail",
    category: "Logo Design",
    date: "2025-10-26",
    description:
      "A placeholder identity concept with a focused mark, flexible supporting assets, and a simple presentation system for future project imagery.",
    cover: placeholder("Identity Cover", 217),
    images: [
      { desktopSrc: placeholder("Identity Image 01", 217), mobileSrc: mobilePlaceholder("Identity Mobile 01", 217), caption: "Image Caption" },
      { desktopSrc: placeholder("Identity Image 02", 212), mobileSrc: mobilePlaceholder("Identity Mobile 02", 212), caption: "Image Caption" },
      { desktopSrc: placeholder("Identity Image 03", 207), mobileSrc: mobilePlaceholder("Identity Mobile 03", 207), caption: "Image Caption" },
    ],
  },
];
