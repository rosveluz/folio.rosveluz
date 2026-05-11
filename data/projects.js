export const categories = ["All", "Web Design", "UIUX", "Logo Design", "Graphics", "Desktop Publishing"];

const placeholder = (label, tone = 220) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='rgb(${tone},${tone},${tone})'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='38' fill='rgb(70,70,70)'%3E${encodeURIComponent(label)}%3C/text%3E%3C/svg%3E`;

const mobilePlaceholder = (label, tone = 220) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 1200'%3E%3Crect width='900' height='1200' fill='rgb(${tone},${tone},${tone})'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='34' fill='rgb(70,70,70)'%3E${encodeURIComponent(label)}%3C/text%3E%3C/svg%3E`;

export const projects = [
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
  {
    id: "editorial-layout-series",
    title: "Work Title",
    detail: "Detail",
    category: "Desktop Publishing",
    date: "2025-07-18",
    description:
      "A desktop publishing placeholder for editorial layouts, reports, presentation sheets, and print-ready collateral with clear structure and polished type hierarchy.",
    cover: placeholder("Publishing Cover", 215),
    images: [
      {
        desktopSrc: placeholder("Publishing Image 01", 215),
        mobileSrc: mobilePlaceholder("Publishing Mobile 01", 215),
        caption: "Image Caption",
      },
      {
        desktopSrc: placeholder("Publishing Image 02", 210),
        mobileSrc: mobilePlaceholder("Publishing Mobile 02", 210),
        caption: "Image Caption",
      },
      {
        desktopSrc: placeholder("Publishing Image 03", 205),
        mobileSrc: mobilePlaceholder("Publishing Mobile 03", 205),
        caption: "Image Caption",
      },
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
