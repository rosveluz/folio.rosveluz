export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);

function mediaStyles(item) {
  const styles = [];
  if (item.background) styles.push(`--media-background: ${item.background}`);
  if (item.aspectRatio) styles.push(`--media-aspect: ${item.aspectRatio}`);
  if (item.coverPosition) styles.push(`object-position: ${item.coverPosition}`);
  return styles.join("; ");
}

function mediaClass(item) {
  return item.fit === "contain" ? "is-contained" : "";
}

export function renderMedia(item, mobile = false, context = "project") {
  const source = mobile ? item.mobileSrc || item.desktopSrc : item.desktopSrc;
  const src = escapeHtml(source.startsWith("img/") ? "/" + source : source);
  const className = mediaClass(item);
  const style = mediaStyles(item);

  if (item.type === "video") {
    const controls = context === "project" ? "controls" : "";
    return `<video src="${src}" ${controls} muted playsinline preload="metadata" class="${className}" style="${style}"></video>`;
  }

  return `<img src="${src}" alt="${escapeHtml(item.caption || "")}" loading="lazy" class="${className}" style="${style}" />`;
}


function projectDescription(project) {
  return `
    <div class="project-copy">
      <button class="project-copy-toggle" type="button" aria-expanded="false" data-copy-toggle>
        <span>${escapeHtml(project.title)}</span>
        <img class="chevron" src="/img/Down%20Arrow.svg" alt="" />
      </button>
      <div class="project-copy-content">
        <p class="project-detail-label">${escapeHtml(project.detail)}</p>
        <p class="project-description" data-project-description>${escapeHtml(project.description)}</p>
      </div>
    </div>
  `;
}

function projectImage(image, mobile = false) {
  return renderMedia(image, mobile, "project");
}


export function renderProject(project) {
  return `
    <h1 class="visually-hidden">${escapeHtml(project.title)}</h1>
    <section class="project-layout" aria-label="${escapeHtml(project.title)}">
      <aside class="thumb-rail" aria-label="Project image thumbnails">
        ${project.images
          .map(
            (image, index) => `
              <button class="thumb-button ${index === 0 ? "is-active" : ""}" type="button" data-thumb="${index}">
                ${renderMedia(image, true, "thumbnail")}
              </button>
            `
          )
          .join("")}
      </aside>

      <section class="project-media-column">
        <a class="breadcrumb" href="/">All / ${escapeHtml(project.category)} / ${project.title}</a>
        <div class="desktop-image-stack">
          ${project.images
            .map(
              (image, index) => `
                <figure class="project-figure" id="project-image-${index}" data-image-index="${index}">
                  ${projectImage(image)}
                  <figcaption>${escapeHtml(image.caption)}</figcaption>
                </figure>
              `
            )
            .join("")}
        </div>
        <div class="mobile-carousel" aria-label="Project images" data-carousel>
          ${project.images
            .map(
              (image, index) => `
                <figure class="carousel-slide" data-slide-index="${index}">
                  ${projectImage(image, true)}
                  <figcaption>${escapeHtml(image.caption)}</figcaption>
                </figure>
              `
            )
            .join("")}
        </div>
      </section>

      <aside class="project-description-column">
        ${projectDescription(project)}
      </aside>
    </section>
  `;
}

export function renderContactContent() {
  return `
    <section class="contact-panel">
      <p class="contact-kicker">Project inquiries, collaborations, and design work</p>
      <h1>Let's build something clean, useful, and quietly memorable.</h1>
      <form class="contact-form" data-contact-form>
        <div class="contact-form-grid">
          <label>Name<input name="name" autocomplete="name" required maxlength="100" /></label>
          <label>Email<input name="email" type="email" autocomplete="email" required maxlength="254" /></label>
          <label>Company (optional)<input name="company" autocomplete="organization" maxlength="150" /></label>
          <label>Country<input name="country" autocomplete="country-name" required maxlength="100" /></label>
        </div>
        <label>Service<select name="service" required>
          <option value="">Select a service</option>
          <option>Web design</option><option>UI/UX design</option><option>App Prototyping</option>
          <option>Logo and visual identity</option><option>Graphic design</option><option>Desktop publishing</option><option>Other</option>
        </select></label>
        <label>Project details<textarea name="message" rows="5" required minlength="10" maxlength="5000"></textarea></label>
        <p class="contact-form-note">Your details will be used to respond to this enquiry. You will not be subscribed to marketing emails.</p>
        <div data-turnstile></div>
        <button class="nav-pill contact-submit" type="submit" disabled>Send enquiry</button>
        <p class="contact-form-status" role="status" aria-live="polite" data-contact-status>Loading verification...</p>
        <noscript><p>Please email me directly to discuss your project.</p></noscript>
      </form>
    </section>
  `;
}

export function renderCards(projects) {
  return projects.map((project) => `
    <article class="work-card">
      <a class="work-card-button" href="/work/${project.id}/">
        ${renderMedia({ desktopSrc: project.cover, fit: project.coverBackground ? "contain" : project.coverFit, background: project.coverBackground, coverPosition: project.coverPosition }, false, "cover")}
        <span class="work-title">${escapeHtml(project.title)}</span>
        <span class="work-detail">${escapeHtml(project.detail)}</span>
      </a>
    </article>
  `).join("");
}
