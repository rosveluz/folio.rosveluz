import { mobilePlaceholder, placeholder } from "./project-placeholders.js";

export const uiuxProjects = [
  {
    id: "interface-study",
    title: "Work Title",
    detail: "Detail",
    category: "UIUX",
    date: "2026-02-18",
    description:
      "A UI UX placeholder project built around tidy controls, direct navigation, and interface patterns that stay calm while supporting repeated use.",
    cover: placeholder("UI UX Cover", 221),
    images: [
      { desktopSrc: placeholder("UI Image 01", 221), mobileSrc: mobilePlaceholder("UI Mobile 01", 221), caption: "Image Caption" },
      { desktopSrc: placeholder("UI Image 02", 216), mobileSrc: mobilePlaceholder("UI Mobile 02", 216), caption: "Image Caption" },
      { desktopSrc: placeholder("UI Image 03", 211), mobileSrc: mobilePlaceholder("UI Mobile 03", 211), caption: "Image Caption" },
    ],
  },
  {
    id: "mobile-flow",
    title: "Work Title",
    detail: "Detail",
    category: "UIUX",
    date: "2025-04-22",
    description:
      "A mobile flow placeholder for future app screens, interaction notes, and case-study captions.",
    cover: placeholder("Mobile Flow Cover", 219),
    images: [
      { desktopSrc: placeholder("Flow Image 01", 219), mobileSrc: mobilePlaceholder("Flow Mobile 01", 219), caption: "Image Caption" },
      { desktopSrc: placeholder("Flow Image 02", 214), mobileSrc: mobilePlaceholder("Flow Mobile 02", 214), caption: "Image Caption" },
      { desktopSrc: placeholder("Flow Image 03", 209), mobileSrc: mobilePlaceholder("Flow Mobile 03", 209), caption: "Image Caption" },
    ],
  },
];
