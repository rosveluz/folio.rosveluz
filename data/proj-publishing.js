import { mobilePlaceholder, placeholder } from "./project-placeholders.js";

export const publishingProjects = [
  {
    id: "editorial-layout-series",
    title: "Work Title",
    detail: "Detail",
    category: "Desktop Publishing",
    date: "2025-07-18",
    description: "A desktop publishing placeholder for editorial layouts, reports, presentation sheets, and print-ready collateral with clear structure and polished type hierarchy.",
    cover: placeholder("Publishing Cover", 215),
    images: [
      {
        desktopSrc: placeholder("Publishing Image 01", 215),
        mobileSrc: mobilePlaceholder("Publishing Mobile 01", 215),
        caption: "Image Caption",
      },
    ],
  },
  {
    id: "test-publish",
    title: "Test Publish",
    detail: "Detail",
    category: "Desktop Publishing",
    date: "2025-07-18",
    description: "A desktop publishing placeholder for editorial layouts, reports, presentation sheets, and print-ready collateral with clear structure and polished type hierarchy.",
    cover: placeholder("Publishing Cover", 215),
    images: [
      {
        desktopSrc: placeholder("Test Publish Image 01", 215),
        mobileSrc: mobilePlaceholder("Test Publish Mobile 01", 215),
        caption: "Image Caption",
      },
    ],
  },
];
