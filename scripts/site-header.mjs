export function renderInnerHeader() {
  return `    <header class="site-header inner-header" data-header>
      <a class="brand" href="/" aria-label="Rosveluz home"><img src="/img/rvz-blk.svg" alt="Rosveluz Logo" /></a>
      <button class="nav-pill header-menu-toggle" type="button" aria-expanded="false" aria-controls="site-page-menu" data-page-menu-toggle>MENU</button>
      <nav class="header-page-menu" id="site-page-menu" aria-label="Page navigation" hidden>
        <a href="/">Home</a>
        <a href="/about/">About</a>
        <a href="/service/">Services</a>
        <a href="/blog/">Blog</a>
        <a href="/contact/">Contact</a>
      </nav>
    </header>`;
}
