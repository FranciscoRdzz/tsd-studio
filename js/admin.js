let editingPortfolioId = null;
let editingExperienceId = null;

function initAdmin() {
  document.getElementById("admin-login-btn").addEventListener("click", handleLogin);
  document.getElementById("admin-password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
  document.getElementById("admin-logout").addEventListener("click", handleLogout);

  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".admin-section").forEach((s) => s.classList.remove("active"));
      document.getElementById("section-" + tab.dataset.section).classList.add("active");
    });
  });

  document.getElementById("admin-add-portfolio").addEventListener("click", () => openPortfolioForm());
  document.getElementById("pf-save").addEventListener("click", savePortfolioForm);
  document.getElementById("pf-cancel").addEventListener("click", closePortfolioForm);

  document.getElementById("admin-add-experience").addEventListener("click", () => openExperienceForm());
  document.getElementById("expf-save").addEventListener("click", saveExperienceForm);
  document.getElementById("expf-cancel").addEventListener("click", closeExperienceForm);
  document.getElementById("exp-add-image").addEventListener("click", addExpImageField);

  document.getElementById("admin-save-services").addEventListener("click", saveServices);
  document.getElementById("admin-add-service").addEventListener("click", addServiceEntry);
  document.getElementById("admin-save-site").addEventListener("click", saveSiteText);

  if (isLoggedIn()) showPanel();
}

function isLoggedIn() {
  return sessionStorage.getItem("tsd-admin") === "true";
}

async function handleLogin() {
  const pw = document.getElementById("admin-password").value;
  if (checkAdminPassword(pw)) {
    sessionStorage.setItem("tsd-admin", "true");
    await showPanel();
  } else {
    document.getElementById("admin-error").style.display = "block";
  }
}

function handleLogout() {
  sessionStorage.removeItem("tsd-admin");
  document.getElementById("admin-panel").style.display = "none";
  document.getElementById("admin-login").style.display = "flex";
}

async function showPanel() {
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";
  await loadAllData();
}

function showSuccess(msg) {
  const el = document.getElementById("admin-success");
  el.textContent = msg || "Changes saved successfully";
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

async function loadAllData() {
  // getContent(true) espera a Firestore antes de renderizar
  siteData = await getContent(true);
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
    await saveData(siteData);
  }
  renderPortfolioList();
  renderExperienceList();
  renderServicesForm();
  renderSiteForm();
  // Re-render si llegan datos actualizados desde Firestore
  document.addEventListener("data-refresh", (e) => {
    siteData = e.detail;
    renderPortfolioList();
    renderExperienceList();
    renderServicesForm();
    renderSiteForm();
  });
}

/* ======= PORTFOLIO ======= */
function renderPortfolioList() {
  const container = document.getElementById("admin-portfolio-list");
  const items = siteData.portfolio || [];

  if (items.length === 0) {
    container.innerHTML = '<div class="admin-card"><div class="admin-card-info"><span style="color:var(--gray-mid)">No projects yet. Add one!</span></div></div>';
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
      <div class="admin-card">
        <div class="admin-card-info">
          <h4>${item.title}</h4>
          <span>${item.category} — ${item.description || ""}</span>
        </div>
        <div class="admin-card-actions">
          <button class="admin-btn-small" onclick="editPortfolioItem(${item.id})">Edit</button>
          <button class="admin-btn-small admin-btn-danger" onclick="deletePortfolioItem(${item.id})">Delete</button>
        </div>
      </div>
    `
    )
    .join("");
}

function openPortfolioForm(item) {
  editingPortfolioId = item ? item.id : null;
  const form = document.getElementById("admin-portfolio-form");
  document.getElementById("pf-title").value = item ? item.title : "";
  document.getElementById("pf-category").value = item ? item.category : "cars";
  document.getElementById("pf-image").value = item ? item.image : "";
  document.getElementById("pf-description").value = item ? item.description : "";
  form.classList.add("open");
  form.scrollIntoView({ behavior: "smooth" });
}

function closePortfolioForm() {
  document.getElementById("admin-portfolio-form").classList.remove("open");
  editingPortfolioId = null;
}

async function savePortfolioForm() {
  const title = document.getElementById("pf-title").value.trim();
  const category = document.getElementById("pf-category").value;
  const image = document.getElementById("pf-image").value.trim() || "assets/portfolio/placeholder.svg";
  const description = document.getElementById("pf-description").value.trim();

  if (!title) return;

  const item = { title, category, image, description };

  try {
    if (editingPortfolioId) {
      siteData = await updatePortfolioItem(editingPortfolioId, item);
    } else {
      siteData = await addPortfolioItem(item);
    }
  } catch (e) {
    console.error("Save error:", e);
  }
  renderPortfolioList();
  closePortfolioForm();
  showSuccess();
}

function editPortfolioItem(id) {
  const item = siteData.portfolio.find((p) => p.id === id);
  if (item) openPortfolioForm(item);
}

async function deletePortfolioItem(id) {
  if (confirm("Delete this project?")) {
    try {
      siteData = await window.deletePortfolioItem(id);
    } catch (e) {
      console.error("Delete error:", e);
    }
    renderPortfolioList();
    showSuccess("Project deleted");
  }
}

/* ======= EXPERIENCE ======= */
function renderExperienceList() {
  const container = document.getElementById("admin-experience-list");
  const items = siteData.experience || [];

  if (items.length === 0) {
    container.innerHTML = '<div class="admin-card"><div class="admin-card-info"><span style="color:var(--gray-mid)">No experience entries yet. Add one!</span></div></div>';
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
      <div class="admin-card">
        <div class="admin-card-info">
          <h4>${item.title}</h4>
          <span>${item.subtitle || ""}</span>
        </div>
        <div class="admin-card-actions">
          <button class="admin-btn-small" onclick="editExperienceItem(${item.id})">Edit</button>
          <button class="admin-btn-small admin-btn-danger" onclick="deleteExperienceItem(${item.id})">Delete</button>
        </div>
      </div>
    `
    )
    .join("");
}

function openExperienceForm(item) {
  editingExperienceId = item ? item.id : null;
  const form = document.getElementById("admin-experience-form");
  document.getElementById("expf-title").value = item ? item.title : "";
  document.getElementById("expf-subtitle").value = item ? item.subtitle : "";
  document.getElementById("expf-desc").value = item ? item.description : "";
  renderExpImages(item ? item.images || [] : []);
  form.classList.add("open");
  form.scrollIntoView({ behavior: "smooth" });
}

function closeExperienceForm() {
  document.getElementById("admin-experience-form").classList.remove("open");
  editingExperienceId = null;
}

async function saveExperienceForm() {
  const title = document.getElementById("expf-title").value.trim();
  const subtitle = document.getElementById("expf-subtitle").value.trim();
  const description = document.getElementById("expf-desc").value.trim();
  const images = collectExpImages();

  if (!title) return;

  try {
    if (editingExperienceId) {
      siteData = await updateExperienceItem(editingExperienceId, { title, subtitle, description, images });
    } else {
      siteData = await addExperienceItem({ title, subtitle, description, images });
    }
  } catch (e) {
    console.error("Save error:", e);
  }
  renderExperienceList();
  closeExperienceForm();
  showSuccess();
}

function editExperienceItem(id) {
  const item = siteData.experience.find((e) => e.id === id);
  if (item) openExperienceForm(item);
}

async function deleteExperienceItem(id) {
  if (confirm("Delete this experience entry?")) {
    try {
      siteData = await window.deleteExperienceItem(id);
    } catch (e) {
      console.error("Delete error:", e);
    }
    renderExperienceList();
    showSuccess("Experience deleted");
  }
}

function renderExpImages(images) {
  const container = document.getElementById("exp-images");
  if (images.length === 0) {
    container.innerHTML = '<div class="admin-card"><span style="color:var(--gray-mid)">No images yet. Add one!</span></div>';
    return;
  }
  container.innerHTML = images
    .map(
      (img, idx) => `
      <div class="admin-achievement-item" style="display:flex;gap:12px;align-items:center;">
        <div style="width:60px;height:40px;flex-shrink:0;background:var(--black);border:1px solid var(--gray-mid);overflow:hidden;">
          <img src="${(img.src || "assets/experience/placeholder.svg").replace(/"/g, "&quot;")}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='assets/experience/placeholder.svg'">
        </div>
        <div style="flex:1;">
          <input type="text" class="exp-img-src" value="${(img.src || "").replace(/"/g, "&quot;")}" placeholder="Image URL" style="margin-bottom:4px;">
          <input type="text" class="exp-img-caption" value="${(img.caption || "").replace(/"/g, "&quot;")}" placeholder="Caption (optional)" style="margin-bottom:0;">
        </div>
        <button class="admin-btn-small admin-btn-danger" onclick="removeExpImage(${idx})" style="white-space:nowrap;">X</button>
      </div>
    `
    )
    .join("");
}

function addExpImageField() {
  const container = document.getElementById("exp-images");
  const emptyMsg = container.querySelector(".admin-card");
  if (emptyMsg) emptyMsg.remove();

  const div = document.createElement("div");
  div.className = "admin-achievement-item";
  div.style.cssText = "display:flex;gap:12px;align-items:center;";
  div.innerHTML = `
    <div style="width:60px;height:40px;flex-shrink:0;background:var(--black);border:1px solid var(--gray-mid);display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:var(--gray-mid);">IMG</div>
    <div style="flex:1;">
      <input type="text" class="exp-img-src" placeholder="Image URL (assets/experience/...)" style="margin-bottom:4px;">
      <input type="text" class="exp-img-caption" placeholder="Caption (optional)" style="margin-bottom:0;">
    </div>
    <button class="admin-btn-small admin-btn-danger" onclick="this.closest('.admin-achievement-item').remove()" style="white-space:nowrap;">X</button>
  `;
  container.appendChild(div);
}

function removeExpImage(idx) {
  const items = document.querySelectorAll("#exp-images .admin-achievement-item");
  if (items[idx]) items[idx].remove();
}

function collectExpImages() {
  const items = document.querySelectorAll("#exp-images .admin-achievement-item");
  const images = [];
  items.forEach((item) => {
    const src = item.querySelector(".exp-img-src").value.trim();
    const caption = item.querySelector(".exp-img-caption").value.trim();
    if (src) images.push({ id: Date.now() + Math.random(), src, caption });
  });
  return images;
}

/* ======= SERVICES ======= */
function renderServicesForm() {
  const container = document.getElementById("admin-services-form");
  const services = siteData.services || [];

  if (services.length === 0) {
    container.innerHTML = '<div class="admin-card"><span style="color:var(--gray-mid)">No services configured. Add one!</span></div>';
    return;
  }

  let html = '';
  services.forEach((s, idx) => {
    html += `
      <div class="admin-service-entry" data-service-id="${s.id}" style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--gray-mid);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--gray-light);">${idx + 1}. ${s.title || 'Service'}</div>
          <button class="admin-btn-small admin-btn-danger" onclick="deleteServiceEntry(${s.id})" style="white-space:nowrap;">Delete</button>
        </div>
        <div class="admin-form-row">
          <div style="flex:2;">
            <label>Title</label>
            <input type="text" class="svc-title" value="${s.title.replace(/"/g, "&quot;")}">
          </div>
          <div style="flex:1;">
            <label>Price</label>
            <input type="text" class="svc-price" value="${(s.price || "").replace(/"/g, "&quot;")}">
          </div>
        </div>
        <label>Description</label>
        <input type="text" class="svc-desc" value="${s.description.replace(/"/g, "&quot;")}">
      </div>
    `;
  });
  container.innerHTML = html;
}

async function saveServices() {
  const entries = document.querySelectorAll("#admin-services-form .admin-service-entry");
  const services = [];
  entries.forEach((entry) => {
    const id = parseInt(entry.dataset.serviceId) || Date.now() + Math.random();
    const title = entry.querySelector(".svc-title").value.trim();
    const description = entry.querySelector(".svc-desc").value.trim();
    const price = entry.querySelector(".svc-price").value.trim();
    if (title) {
      services.push({ id, title, description, price });
    }
  });
  try {
    siteData = await updateServices(services);
  } catch (e) {
    console.error("Save error:", e);
  }
  showSuccess();
}

function addServiceEntry() {
  const container = document.getElementById("admin-services-form");
  const emptyMsg = container.querySelector(".admin-card");
  if (emptyMsg) emptyMsg.remove();

  const tempId = "new-" + Date.now();
  const div = document.createElement("div");
  div.className = "admin-service-entry";
  div.dataset.serviceId = tempId;
  div.style.cssText = "margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--gray-mid);";
  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--gray-light);">New Service</div>
      <button class="admin-btn-small admin-btn-danger" onclick="this.closest('.admin-service-entry').remove()" style="white-space:nowrap;">Delete</button>
    </div>
    <div class="admin-form-row">
      <div style="flex:2;">
        <label>Title</label>
        <input type="text" class="svc-title" placeholder="Service title">
      </div>
      <div style="flex:1;">
        <label>Price</label>
        <input type="text" class="svc-price" placeholder="From $XX">
      </div>
    </div>
    <label>Description</label>
    <input type="text" class="svc-desc" placeholder="Service description">
  `;
  container.appendChild(div);
  div.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function deleteServiceEntry(id) {
  if (confirm("Delete this service?")) {
    try {
      siteData = await window.deleteServiceItem(id);
    } catch (e) {
      console.error("Delete error:", e);
    }
    renderServicesForm();
    showSuccess("Service deleted");
  }
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ======= SITE TEXT ======= */
function renderSiteForm() {
  const site = siteData.site || {};
  document.getElementById("site-title").value = site.title || "";
  document.getElementById("site-subtitle").value = site.subtitle || "";
  document.getElementById("site-desc").value = site.description || "";
  document.getElementById("site-hero").value = site.heroTag || "";
  const social = site.social || {};
  const s = (id) => { const el = document.getElementById(id); if (el) el.value = social[id.replace("site-", "")] || ""; };
  s("site-discord");
  s("site-instagram");
  s("site-tradingpaints");
  s("site-team");
  s("site-donation");
}

async function saveSiteText() {
  const site = {
    title: document.getElementById("site-title").value.trim(),
    subtitle: document.getElementById("site-subtitle").value.trim(),
    description: document.getElementById("site-desc").value.trim(),
    heroTag: document.getElementById("site-hero").value.trim(),
    social: {
      discord: document.getElementById("site-discord").value.trim(),
      instagram: document.getElementById("site-instagram").value.trim(),
      tradingpaints: document.getElementById("site-tradingpaints").value.trim(),
      team: document.getElementById("site-team").value.trim(),
      donation: document.getElementById("site-donation").value.trim(),
    }
  };
  try {
    siteData = await updateSiteInfo(site);
  } catch (e) {
    console.error("Save error:", e);
  }
  showSuccess();
}

document.addEventListener("DOMContentLoaded", initAdmin);
