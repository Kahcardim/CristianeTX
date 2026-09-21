const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const year = document.querySelector("[data-year]");

if (year) year.textContent = new Date().getFullYear();

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}


const nativeAccessibilityPreferences = {
  reducedMotion: "(prefers-reduced-motion: reduce)",
  moreContrast: "(prefers-contrast: more)",
  forcedColors: "(forced-colors: active)",
  reducedTransparency: "(prefers-reduced-transparency: reduce)"
};

Object.entries(nativeAccessibilityPreferences).forEach(([name, query]) => {
  const media = window.matchMedia(query);
  const attribute =
    "data-a11y-" +
    name.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());

  const update = () => {
    document.documentElement.setAttribute(attribute, String(media.matches));
  };

  update();
  media.addEventListener?.("change", update);
});

document.documentElement.dataset.a11yNative = "ready";
