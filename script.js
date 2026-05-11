import { projects } from "./data/projects.js";

const app = document.querySelector("#app");
const header = document.querySelector("[data-header]");
const brand = document.querySelector(".brand");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const filterToggles = [...document.querySelectorAll("[data-filter-toggle]")];
const menuToggles = [...document.querySelectorAll("[data-menu-toggle]")];
const mobileNav = document.querySelector("[data-mobile-nav]");

let currentFilter = "All";
let isFilterPanelOpen = false;
let projectControls = {
  sort: "newest",
  startDate: "",
  endDate: "",
  query: "",
};
let activeProject = null;
let detailObserver = null;
let carouselObserver = null;

const byId = (id) => projects.find((project) => project.id === id);

function setActiveFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });
}

function closeMobileMenu() {
  header.classList.remove("is-menu-open");
  menuToggles.forEach((button) => button.setAttribute("aria-expanded", "false"));
}

function setFilterPanel(open) {
  isFilterPanelOpen = open;
  filterToggles.forEach((button) => button.setAttribute("aria-expanded", String(open)));
  app.querySelector("[data-filter-panel]")?.classList.toggle("is-open", open);
}

function syncHash(hash) {
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
}

function projectMatchesControls(project) {
  const projectTime = Date.parse(project.date);
  const startTime = projectControls.startDate ? Date.parse(projectControls.startDate) : null;
  const endTime = projectControls.endDate ? Date.parse(projectControls.endDate) : null;
  const query = projectControls.query.trim().toLowerCase();
  const searchable = `${project.title} ${project.detail} ${project.category} ${project.description}`.toLowerCase();

  return (
    (!startTime || projectTime >= startTime) &&
    (!endTime || projectTime <= endTime) &&
    (!query || searchable.includes(query))
  );
}

function sortProjects(projectList) {
  return [...projectList].sort((a, b) => {
    const dateA = Date.parse(a.date);
    const dateB = Date.parse(b.date);
    return projectControls.sort === "oldest" ? dateA - dateB : dateB - dateA;
  });
}

function filterPanel() {
  return `
    <section class="folio-controls ${isFilterPanelOpen ? "is-open" : ""}" aria-label="Sorting and filters" data-filter-panel>
      <div class="control-header">
        <p>Filters</p>
        <button class="control-close" type="button" aria-label="Close sorting and filters" data-close-controls>Close</button>
      </div>
      <div class="control-field">
        <label for="sort-order">Sort</label>
        <select id="sort-order" data-sort-order>
          <option value="newest" ${projectControls.sort === "newest" ? "selected" : ""}>Newest first</option>
          <option value="oldest" ${projectControls.sort === "oldest" ? "selected" : ""}>Oldest first</option>
        </select>
      </div>
      <div class="control-field">
        <label for="date-start">Start</label>
        <input id="date-start" type="date" value="${projectControls.startDate}" data-date-start />
      </div>
      <div class="control-field">
        <label for="date-end">End</label>
        <input id="date-end" type="date" value="${projectControls.endDate}" data-date-end />
      </div>
      <div class="control-field control-field-search">
        <label for="project-search">Search</label>
        <input id="project-search" type="search" value="${projectControls.query}" placeholder="Title, detail, category" data-project-search />
      </div>
      <button class="control-reset" type="button" data-reset-controls>Reset</button>
    </section>
  `;
}

function renderHome(filter = currentFilter) {
  activeProject = null;
  setActiveFilter(filter);
  closeMobileMenu();
  if (detailObserver) detailObserver.disconnect();
  if (carouselObserver) carouselObserver.disconnect();

  const visibleProjects = sortProjects(
    projects.filter((project) => (filter === "All" || project.category === filter) && projectMatchesControls(project))
  );

  app.className = "site-main home-view";
  app.innerHTML = `
    ${filterPanel()}
    <section class="work-grid" aria-label="Portfolio work">
      ${visibleProjects
        .map(
          (project) => `
            <article class="work-card">
              <button class="work-card-button" type="button" data-project-id="${project.id}">
                <img src="${project.cover}" alt="" loading="lazy" />
                <span class="work-title">${project.title}</span>
                <span class="work-detail">${project.detail}</span>
              </button>
            </article>
          `
        )
        .join("") || `<p class="empty-state">No projects match the current filters.</p>`}
    </section>
  `;

  setupHomeControls();

  app.querySelectorAll("[data-project-id]").forEach((button) => {
    button.addEventListener("click", () => openProject(button.dataset.projectId));
  });
}

function setupHomeControls() {
  app.querySelector("[data-sort-order]")?.addEventListener("change", (event) => {
    projectControls.sort = event.target.value;
    renderHome();
  });

  app.querySelector("[data-date-start]")?.addEventListener("change", (event) => {
    projectControls.startDate = event.target.value;
    renderHome();
  });

  app.querySelector("[data-date-end]")?.addEventListener("change", (event) => {
    projectControls.endDate = event.target.value;
    renderHome();
  });

  app.querySelector("[data-project-search]")?.addEventListener("input", (event) => {
    projectControls.query = event.target.value;
    renderHome();
    const search = app.querySelector("[data-project-search]");
    search?.focus();
    search?.setSelectionRange(search.value.length, search.value.length);
  });

  app.querySelector("[data-reset-controls]")?.addEventListener("click", () => {
    projectControls = { sort: "newest", startDate: "", endDate: "", query: "" };
    renderHome();
  });

  app.querySelector("[data-close-controls]")?.addEventListener("click", () => {
    setFilterPanel(false);
  });
}

function renderContact() {
  activeProject = null;
  closeMobileMenu();
  setFilterPanel(false);
  app.className = "site-main contact-view";
  app.innerHTML = `
    <section class="contact-panel">
      <p class="contact-kicker">Project inquiries, collaborations, and design work</p>
      <h1>Let's build something clean, useful, and quietly memorable.</h1>
      <a class="contact-email" href="mailto:hello@rosveluz.com">hello@rosveluz.com</a>
      <div class="contact-links" aria-label="Related links">
        <a href="https://www.rosveluz.com/">www.rosveluz.com</a>
        <a href="https://art.rosveluz.com/" target="_blank" rel="noopener noreferrer">art.rosveluz.com</a>
      </div>
    </section>
  `;
}

function projectDescription(project) {
  return `
    <div class="project-copy">
      <button class="project-copy-toggle" type="button" aria-expanded="false" data-copy-toggle>
        <span>${project.title}</span>
        <img class="chevron" src="img/Down%20Arrow.svg" alt="" />
      </button>
      <div class="project-copy-content">
        <p class="project-detail-label">${project.detail}</p>
        <p class="project-description" data-project-description>${project.description}</p>
      </div>
    </div>
  `;
}

function openProject(projectId, updateHash = true) {
  const project = byId(projectId) || projects[0];
  activeProject = project;
  closeMobileMenu();
  setFilterPanel(false);
  setActiveFilter(project.category);
  if (detailObserver) detailObserver.disconnect();
  if (carouselObserver) carouselObserver.disconnect();
  if (updateHash) syncHash(`#work/${project.id}`);

  app.className = "site-main detail-view";
  app.innerHTML = `
    <section class="project-layout" aria-label="${project.title}">
      <aside class="thumb-rail" aria-label="Project image thumbnails">
        ${project.images
          .map(
            (image, index) => `
              <button class="thumb-button ${index === 0 ? "is-active" : ""}" type="button" data-thumb="${index}">
                <img src="${image.mobileSrc || image.desktopSrc}" alt="" loading="lazy" />
              </button>
            `
          )
          .join("")}
      </aside>

      <section class="project-media-column">
        <a class="breadcrumb" href="#home">All / ${project.category} / ${project.title}</a>
        <div class="desktop-image-stack">
          ${project.images
            .map(
              (image, index) => `
                <figure class="project-figure" id="project-image-${index}" data-image-index="${index}">
                  <img src="${image.desktopSrc}" alt="" loading="lazy" />
                  <figcaption>${image.caption}</figcaption>
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
                  <img src="${image.mobileSrc || image.desktopSrc}" alt="" loading="lazy" />
                  <figcaption>${image.caption}</figcaption>
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

  setupDetailInteractions();
  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "auto" });
}

function setupDetailInteractions() {
  const thumbs = [...app.querySelectorAll("[data-thumb]")];
  const figures = [...app.querySelectorAll("[data-image-index]")];
  const slides = [...app.querySelectorAll("[data-slide-index]")];
  const carousel = app.querySelector("[data-carousel]");
  const copyToggle = app.querySelector("[data-copy-toggle]");

  const activateThumb = (index) => {
    thumbs.forEach((thumb) => thumb.classList.toggle("is-active", Number(thumb.dataset.thumb) === index));
  };

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const index = Number(thumb.dataset.thumb);
      activateThumb(index);

      if (window.matchMedia("(max-width: 760px)").matches) {
        slides[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      } else {
        figures[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  detailObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) activateThumb(Number(visible.target.dataset.imageIndex));
    },
    { threshold: [0.35, 0.55, 0.75], rootMargin: "-20% 0px -35% 0px" }
  );

  figures.forEach((figure) => detailObserver.observe(figure));

  if (carousel) {
    carouselObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) activateThumb(Number(visible.target.dataset.slideIndex));
      },
      { root: carousel, threshold: [0.55, 0.7, 0.85] }
    );
    slides.forEach((slide) => carouselObserver.observe(slide));
  }

  copyToggle?.addEventListener("click", () => {
    const isOpen = copyToggle.getAttribute("aria-expanded") === "true";
    copyToggle.setAttribute("aria-expanded", String(!isOpen));
    copyToggle.closest(".project-copy")?.classList.toggle("is-open", !isOpen);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    if (activeProject) {
      renderHome(filter);
      syncHash("#home");
    } else {
      renderHome(filter);
    }
    closeMobileMenu();
  });
});

brand?.addEventListener("click", (event) => {
  event.preventDefault();
  renderHome("All");
  syncHash("#home");
});

menuToggles.forEach((button) => {
  button.addEventListener("click", () => {
    const willOpen = !header.classList.contains("is-menu-open");
    header.classList.toggle("is-menu-open", willOpen);
    menuToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", String(willOpen)));
  });
});

filterToggles.forEach((button) => {
  button.addEventListener("click", () => {
    if (activeProject) {
      renderHome(currentFilter);
      syncHash("#home");
    }
    closeMobileMenu();
    setFilterPanel(!isFilterPanelOpen);
  });
});

document.addEventListener("click", (event) => {
  const clickedHeader = header.contains(event.target);
  const clickedFilterPanel = Boolean(app.querySelector("[data-filter-panel]")?.contains(event.target));

  if (!clickedHeader) {
    closeMobileMenu();
  }

  if (!clickedHeader && !clickedFilterPanel) {
    setFilterPanel(false);
  }
});

window.addEventListener("hashchange", route);

function route() {
  const hash = window.location.hash;

  if (hash.startsWith("#work/")) {
    openProject(hash.replace("#work/", ""), false);
    return;
  }

  if (hash === "#contact") {
    renderContact();
    return;
  }

  renderHome(currentFilter);
}

route();
