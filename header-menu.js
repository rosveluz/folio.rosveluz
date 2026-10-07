const header = document.querySelector("[data-header]");
const toggle = header?.querySelector("[data-page-menu-toggle]");
const menu = header?.querySelector("#site-page-menu");

if (toggle && menu) {
  const links = [...menu.querySelectorAll("a")];
  const currentPath = window.location.pathname.replace(/\/$/, "");
  links.forEach((link) => {
    if (!link.hash && link.pathname.replace(/\/$/, "") === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });

  function setOpen(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("is-active", open);
    if (open) {
      header.classList.remove("is-menu-open");
      header.querySelectorAll("[data-menu-toggle]").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
      });
    }
  }

  toggle.addEventListener("click", () => setOpen(menu.hidden));
  toggle.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      links[0]?.focus();
    }
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  header.addEventListener("focusout", (event) => {
    if (!header.contains(event.relatedTarget)) setOpen(false);
  });
}
