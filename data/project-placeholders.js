export const placeholder = (label, tone = 220) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='rgb(${tone},${tone},${tone})'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='38' fill='rgb(70,70,70)'%3E${encodeURIComponent(label)}%3C/text%3E%3C/svg%3E`;

export const mobilePlaceholder = (label, tone = 220) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 1200'%3E%3Crect width='900' height='1200' fill='rgb(${tone},${tone},${tone})'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='34' fill='rgb(70,70,70)'%3E${encodeURIComponent(label)}%3C/text%3E%3C/svg%3E`;
