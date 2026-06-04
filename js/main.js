let siteData = {};
let currentFilter = "all";
let currentLightboxIndex = -1;
let filteredPortfolio = [];

async function init() {
  try {
    siteData = await getContent();
    // Migration: convert old single-object experience to array
    if (siteData.experience && !Array.isArray(siteData.experience)) {
      const old = siteData.experience;
      siteData.experience = [{
        id: 1,
        title: old.currentTeam || "Experience",
        subtitle: old.subtitle || "",
        description: old.description || "",
        images: old.images || []
      }];
    }
  } catch (e) {
    siteData = {};
  }
  renderPortfolio();
  renderExperience();
  renderServices();
  loadSocialLinks();
  initNavigation();
  initScrollReveal();
  initNavbarScroll();
  initMobileMenu();
  initLanguage();
  translatePage();
  setupPortfolioFilters();
  setupLightbox();
}

function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        document.querySelector(".navbar-links")?.classList.remove("open");
      }
    });
  });

  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".navbar-links a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#" + entry.target.id) {
              link.classList.add("active");
            }
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

function initMobileMenu() {
  const toggle = document.querySelector(".navbar-toggle");
  const links = document.querySelector(".navbar-links");
  if (toggle) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }
}

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger").forEach((el) => {
    observer.observe(el);
  });
}

function initLanguage() {
  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      setLang(lang);
      document.querySelectorAll(".lang-switch button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function renderPortfolio() {
  const container = document.getElementById("portfolio-grid");
  if (!container) return;
  const items = siteData.portfolio || [];
  const query = currentFilter === "all" ? items : items.filter((item) => item.category === currentFilter);
  filteredPortfolio = query;

  if (query.length === 0) {
    container.innerHTML = `<div class="portfolio-empty">${getText("portfolio.empty")}</div>`;
    return;
  }

  container.innerHTML = query
    .map(
      (item, idx) => `
      <div class="portfolio-item reveal-scale" data-index="${idx}">
        <img src="${item.image || 'assets/portfolio/placeholder.svg'}" alt="${item.title}" loading="lazy">
        <div class="portfolio-item-overlay">
          <div class="portfolio-item-title">${item.title}</div>
          <div class="portfolio-item-category">${item.category}</div>
        </div>
      </div>
    `
    )
    .join("");

  container.querySelectorAll(".portfolio-item").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.dataset.index);
      openLightbox(idx);
    });
  });

  setTimeout(() => initScrollReveal(), 100);
}

function setupPortfolioFilters() {
  document.querySelectorAll(".portfolio-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".portfolio-filter").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderPortfolio();
    });
  });
}

function openLightbox(index) {
  currentLightboxIndex = index;
  const item = filteredPortfolio[index];
  if (!item) return;

  const lightbox = document.getElementById("lightbox");
  const img = lightbox.querySelector(".lightbox-content img");
  const title = lightbox.querySelector(".lightbox-info h3");
  const desc = lightbox.querySelector(".lightbox-info p");

  img.src = item.image || "assets/portfolio/placeholder.svg";
  img.alt = item.title;
  title.textContent = item.title;
  desc.textContent = item.description;

  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";

  updateLightboxNav();
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
}

function navigateLightbox(dir) {
  const newIndex = currentLightboxIndex + dir;
  if (newIndex >= 0 && newIndex < filteredPortfolio.length) {
    openLightbox(newIndex);
  }
}

function updateLightboxNav() {
  const prev = document.querySelector(".lightbox-nav.prev");
  const next = document.querySelector(".lightbox-nav.next");
  if (prev) prev.style.display = currentLightboxIndex > 0 ? "block" : "none";
  if (next) next.style.display = currentLightboxIndex < filteredPortfolio.length - 1 ? "block" : "none";
}

function setupLightbox() {
  const closeBtn = document.querySelector(".lightbox-close");
  const lightbox = document.getElementById("lightbox");
  const prevBtn = document.querySelector(".lightbox-nav.prev");
  const nextBtn = document.querySelector(".lightbox-nav.next");

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeLightbox();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });
  if (prevBtn) prevBtn.addEventListener("click", () => navigateLightbox(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => navigateLightbox(1));
}

function renderExperience() {
  const container = document.getElementById("experience-grid");
  if (!container) return;

  let exp = siteData.experience;
  if (!exp) return;

  // Migration from old single-object format
  if (!Array.isArray(exp)) {
    exp = [{
      id: 1,
      title: exp.currentTeam || getText("experience.title"),
      subtitle: exp.subtitle || "",
      description: exp.description || "",
      images: exp.images || []
    }];
  }

  const discord = siteData.site?.social?.discord || "https://discord.gg/PhcxHCpWFc";
  const team = siteData.site?.social?.team || "#";

  if (exp.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--gray-mid);padding:40px;">No experience entries yet.</div>';
    return;
  }

  container.innerHTML = exp
    .map(
      (item, idx) => `
      <div class="experience-card reveal${idx % 2 === 0 ? ' reveal-left' : ' reveal-right'}">
        <div class="experience-card-content">
          <h3 class="experience-card-title">${escapeHtml(item.title)}</h3>
          ${item.subtitle ? `<div class="experience-card-subtitle">${escapeHtml(item.subtitle)}</div>` : ""}
          <p class="experience-card-desc">${escapeHtml(item.description)}</p>
          <div class="experience-card-actions">
            <a href="${discord}" target="_blank" class="experience-cta" data-i18n="experience.cta">Join Discord</a>
            <a href="${team}" target="_blank" class="experience-cta experience-cta-secondary">${escapeHtml(item.title.split("—")[0].trim() || item.title)}</a>
          </div>
        </div>
        ${item.images && item.images.length > 0 ? `
        <div class="experience-card-gallery">
          ${item.images.map(img => `
            <div class="exp-gallery-item">
              <img src="${img.src}" alt="${img.caption || ""}" loading="lazy" onerror="this.src='assets/experience/placeholder.svg'">
              ${img.caption ? `<div class="exp-gallery-caption">${escapeHtml(img.caption)}</div>` : ""}
            </div>
          `).join("")}
        </div>` : ""}
      </div>
    `
    )
    .join("");

  setTimeout(() => initScrollReveal(), 100);
}

function renderServices() {
  const container = document.getElementById("services-grid");
  if (!container) return;
  const services = siteData.services || [];

  const discord = siteData.site?.social?.discord || "https://discord.gg/PhcxHCpWFc";

  container.innerHTML = services
    .map(
      (s, idx) => `
      <div class="service-card reveal">
        <div class="service-card-number">${String(idx + 1).padStart(2, "0")}</div>
        <div class="service-card-title">${escapeHtml(s.title)}</div>
        <p>${escapeHtml(s.description)}</p>
        <div class="service-card-footer">
          <span class="service-card-price">${s.price || ""}</span>
          <a href="${discord}" target="_blank" class="service-card-btn" data-i18n="services.inquire">
            ${getText("services.inquire")}
          </a>
        </div>
      </div>
    `
    )
    .join("");
}

function loadSocialLinks() {
  const social = siteData.site?.social;
  if (!social) return;
  document.querySelectorAll("[data-social]").forEach((el) => {
    const key = el.dataset.social;
    if (social[key] && el.tagName === "A") {
      el.href = social[key];
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => init());
