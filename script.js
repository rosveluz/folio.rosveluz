import { projects } from "./data/projects.js";
import { renderCards, renderProject, renderContactContent } from "./portfolio-render.js";
import { initContactForm } from "./contact-form.js?v=contact-2";

document.documentElement.classList.add("has-js");

fetch("/data/blog-status.json")
  .then((response) => response.ok ? response.json() : null)
  .then((status) => {
    if (!status?.published) return;
    const placeholder = document.querySelector("[data-blog-link]");
    if (!placeholder) return;
    const link = document.createElement("a");
    link.href = "/blog/";
    link.textContent = "Blog";
    placeholder.replaceWith(link);
  })
  .catch(() => {});

const app = document.querySelector("#app");
const header = document.querySelector("[data-header]");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const filterToggles = [...document.querySelectorAll("[data-filter-toggle]")];
const menuToggles = [...document.querySelectorAll("[data-menu-toggle]")];
const mobileNav = document.querySelector("[data-mobile-nav]");

const requestedFilter = new URLSearchParams(window.location.search).get("category");
let currentFilter = projects.some((project) => project.category === requestedFilter) ? requestedFilter : "All";
const projectsPerPage = 12;
let currentPage = 1;
let paginationCriteria = "";
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
  if (window.location.hash !== hash || (!hash && window.location.pathname !== "/")) {
    window.history.pushState(null, "", hash || "/");
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
  const criteria = JSON.stringify([filter, projectControls]);
  if (criteria !== paginationCriteria) currentPage = 1;
  paginationCriteria = criteria;
  activeProject = null;
  setActiveFilter(filter);
  closeMobileMenu();
  if (detailObserver) detailObserver.disconnect();
  if (carouselObserver) carouselObserver.disconnect();

  const visibleProjects = sortProjects(
    projects.filter((project) => (filter === "All" || project.category === filter) && projectMatchesControls(project))
  );
  const pageCount = Math.ceil(visibleProjects.length / projectsPerPage);
  currentPage = Math.min(currentPage, Math.max(1, pageCount));
  const pageProjects = visibleProjects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

  app.className = "site-main home-view";
  app.innerHTML = `
    <h1 class="visually-hidden">Ros Veluz design portfolio</h1>
    ${filterPanel()}
    <section class="work-grid ${pageCount > 1 ? "is-paginated" : ""}" aria-label="Portfolio work" tabindex="-1">
      ${renderCards(pageProjects) || `<p class="empty-state">No projects match the current filters.</p>`}
    </section>
    ${pageCount > 1 ? `
      <nav class="work-pagination" aria-label="Portfolio pages">
        <button type="button" data-page="${currentPage - 1}" aria-label="Previous page" title="Previous page" ${currentPage === 1 ? "disabled" : ""}>
          <img class="pagination-arrow is-previous" src="/img/Down%20Arrow.svg" alt="" />
        </button>
        ${Array.from({ length: pageCount }, (_, index) => {
          const page = index + 1;
          return `<button type="button" data-page="${page}" aria-label="Page ${page}" ${page === currentPage ? 'aria-current="page"' : ""}>${page}</button>`;
        }).join("")}
        <button type="button" data-page="${currentPage + 1}" aria-label="Next page" title="Next page" ${currentPage === pageCount ? "disabled" : ""}>
          <img class="pagination-arrow is-next" src="/img/Down%20Arrow.svg" alt="" />
        </button>
      </nav>
    ` : ""}
  `;

  setupHomeControls();
  app.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      currentPage = Number(button.dataset.page);
      renderHome();
      const grid = app.querySelector(".work-grid");
      grid?.focus({ preventScroll: true });
      grid?.scrollIntoView({ block: "start" });
    });
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
  app.innerHTML = renderContactContent();
  initContactForm(app.querySelector("[data-contact-form]"));
}

function openProject(projectId, updateHash = true) {
  const project = byId(projectId) || projects[0];
  activeProject = project;
  closeMobileMenu();
  setFilterPanel(false);
  setActiveFilter(project.category);
  if (detailObserver) detailObserver.disconnect();
  if (carouselObserver) carouselObserver.disconnect();
  if (updateHash) {
    window.location.assign(`/work/${project.id}/`);
    return;
  }

  app.className = "site-main detail-view";
  app.innerHTML = renderProject(project);

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
    if (window.location.pathname !== "/") {
      window.location.assign(filter === "All" ? "/" : `/?category=${encodeURIComponent(filter)}`);
      return;
    }
    if (activeProject) {
      renderHome(filter);
      syncHash("");
    } else {
      renderHome(filter);
    }
    closeMobileMenu();
  });
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
    if (window.location.pathname !== "/") {
      window.location.assign("/");
      return;
    }
    if (activeProject) {
      renderHome(currentFilter);
      syncHash("");
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
window.addEventListener("popstate", route);

function route() {
  const hash = window.location.hash;
  if (hash.startsWith("#work/")) {
    window.location.replace(`/work/${encodeURIComponent(hash.slice(6))}/`);
    return;
  }
  if (hash === "#contact") {
    window.location.replace("/contact/");
    return;
  }
  if (hash === "#home") window.history.replaceState(null, "", "/");
  const projectMatch = window.location.pathname.match(/^\/work\/([a-z0-9-]+)\/$/);
  if (projectMatch) {
    openProject(projectMatch[1], false);
    return;
  }
  if (window.location.pathname === "/contact/") {
    renderContact();
    return;
  }
  renderHome(currentFilter);
}

route();
