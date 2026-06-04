const DB_KEY = "tsd-studio-data";
const ADMIN_PASSWORD_HASH = "tsd-admin-2024";

const PAYPAL_DONATION = "https://paypal.me/AndresTovar2320";

const DEFAULT_DATA = {
  site: {
    title: "TSD Studio",
    subtitle: "Thiago Simracing Designs",
    description: "Exclusive iRacing design studio specializing in custom liveries, suits, helmets, and esports merchandise for competitive simracers.",
    heroTag: "Precision in Every Pixel",
    social: {
      discord: "https://discord.gg/PhcxHCpWFc",
      instagram: "https://www.instagram.com/thiagosimracingdesigns",
      tradingpaints: "https://www.tradingpaints.com/profile/1224486/Andres-Tovar",
      team: "https://www.instagram.com/lmresports/",
      donation: PAYPAL_DONATION
    }
  },
  experience: [
    {
      id: 1,
      title: "LMR Esports — Official Designer",
      subtitle: "Official designer for LMR Esports",
      description: "Currently serving as the official designer for LMR Esports, a top split iRacing team. Responsible for creating custom car liveries, driver suits, and team merchandise.",
      images: [
        { id: 1, src: "assets/experience/placeholder.svg", caption: "Official Designer at LMR Esports" },
        { id: 2, src: "assets/experience/placeholder.svg", caption: "1000+ Followers on Instagram" },
        { id: 3, src: "assets/experience/placeholder.svg", caption: "5000+ Trading Paints Downloads" }
      ]
    }
  ],
  services: [
    {
      id: 1, category: "cars",
      title: "Car Liveries",
      description: "Custom paint schemes for any iRacing car. From sleek minimal designs to complex sponsor layouts.",
      price: "From $25"
    },
    {
      id: 2, category: "suits",
      title: "Driver Suits",
      description: "Personalized racing suits with custom colors, logos, and patterns to match your team identity.",
      price: "From $15"
    },
    {
      id: 3, category: "helmets",
      title: "Helmets",
      description: "Stand out on track with a custom helmet design that reflects your style and personality.",
      price: "From $10"
    },
    {
      id: 4, category: "tshirts",
      title: "Esports T-Shirts",
      description: "Team merchandise and apparel designs ready for print, built for the simracing community.",
      price: "From $20"
    }
  ],
  portfolio: [
    {
      id: 1, title: "Prototype Livery", category: "cars",
      image: "assets/portfolio/placeholder.svg",
      description: "Custom livery design for GTP class"
    },
    {
      id: 2, title: "GT3 Special Edition", category: "cars",
      image: "assets/portfolio/placeholder.svg",
      description: "Full wrap design for GT3 competition"
    },
    {
      id: 3, title: "Team Race Suit", category: "suits",
      image: "assets/portfolio/placeholder.svg",
      description: "Matching team suit design"
    },
    {
      id: 4, title: "Arai Custom Helmet", category: "helmets",
      image: "assets/portfolio/placeholder.svg",
      description: "Custom Arai helmet paint scheme"
    },
    {
      id: 5, title: "Esports Team Tee", category: "tshirts",
      image: "assets/portfolio/placeholder.svg",
      description: "Team merchandise t-shirt design"
    },
    {
      id: 6, title: "Oval Special", category: "cars",
      image: "assets/portfolio/placeholder.svg",
      description: "Oval racing custom livery"
    }
  ]
};

// Firebase — solo se inicializa si el SDK está cargado
let DOC_REF = null;
if (typeof firebase !== "undefined" && firebase.initializeApp) {
  try {
    firebase.initializeApp({
      apiKey: "AIzaSyBav__PNc1ZEc8PbY4KpwagTfAaR5sMiq8",
      authDomain: "thiagosimracingdesigns.firebaseapp.com",
      projectId: "thiagosimracingdesigns",
      storageBucket: "thiagosimracingdesigns.firebasestorage.app",
      messagingSenderId: "770558358808",
      appId: "1:770558358808:web:d54e71e867a965164b5a6d"
    });
    const DB = firebase.firestore();
    DOC_REF = DB.collection("config").doc("siteData");
  } catch (e) {
    console.error("Firebase init error:", e);
  }
}

// --- Cache local (instantáneo) ---
function getLocalData() {
  try {
    const stored = localStorage.getItem(DB_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
}

function setLocalData(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (e) {}
}

// --- Firebase (primario) ---

// Guarda en Firestore (await) + cache en localStorage
async function saveData(data) {
  setLocalData(data);
  if (DOC_REF) {
    await DOC_REF.set({ data }, { merge: true });
  }
}

// Lee desde Firestore directamente (sin cache)
async function getFirestoreData() {
  if (!DOC_REF) return null;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000));
    const doc = await Promise.race([DOC_REF.get(), timeout]);
    if (doc.exists) return doc.data().data;
  } catch (e) {
    console.error("Firestore read error:", e);
  }
  return null;
}

// --- API pública ---

// getContent: devuelve datos desde localStorage (instantáneo)
// Si no hay, intenta Firestore; si tampoco, usa DEFAULT_DATA
async function getContent() {
  const local = getLocalData();
  if (local) return local;
  const remote = await getFirestoreData();
  if (remote) {
    setLocalData(remote);
    return remote;
  }
  await saveData(DEFAULT_DATA);
  return DEFAULT_DATA;
}

// syncFromFirestore: obtiene datos frescos desde Firestore y actualiza cache
// Devuelve los datos si cambiaron, o null si están iguales
async function syncFromFirestore() {
  const remote = await getFirestoreData();
  if (!remote) return null;
  setLocalData(remote);
  return remote;
}

// updateContent y CRUD: leen desde localStorage (rápido), guardan en Firestore (await)
async function updateContent(updates) {
  const data = getLocalData() || DEFAULT_DATA;
  Object.assign(data, updates);
  await saveData(data);
  return data;
}

async function addPortfolioItem(item) {
  const data = getLocalData() || DEFAULT_DATA;
  item.id = Date.now();
  data.portfolio.push(item);
  await saveData(data);
  return data;
}

async function updatePortfolioItem(id, updates) {
  const data = getLocalData() || DEFAULT_DATA;
  const idx = data.portfolio.findIndex((p) => p.id === id);
  if (idx !== -1) {
    data.portfolio[idx] = { ...data.portfolio[idx], ...updates };
    await saveData(data);
  }
  return data;
}

async function deletePortfolioItem(id) {
  const data = getLocalData() || DEFAULT_DATA;
  data.portfolio = data.portfolio.filter((p) => p.id !== id);
  await saveData(data);
  return data;
}

async function addExperienceItem(item) {
  const data = getLocalData() || DEFAULT_DATA;
  item.id = Date.now();
  data.experience.push(item);
  await saveData(data);
  return data;
}

async function updateExperienceItem(id, updates) {
  const data = getLocalData() || DEFAULT_DATA;
  const idx = data.experience.findIndex((e) => e.id === id);
  if (idx !== -1) {
    data.experience[idx] = { ...data.experience[idx], ...updates };
    await saveData(data);
  }
  return data;
}

async function deleteExperienceItem(id) {
  const data = getLocalData() || DEFAULT_DATA;
  data.experience = data.experience.filter((e) => e.id !== id);
  await saveData(data);
  return data;
}

async function updateServices(services) {
  return updateContent({ services });
}

async function deleteServiceItem(id) {
  const data = getLocalData() || DEFAULT_DATA;
  data.services = data.services.filter((s) => s.id !== id);
  await saveData(data);
  return data;
}

async function updateSiteInfo(site) {
  return updateContent({ site });
}

function checkAdminPassword(password) {
  return password === ADMIN_PASSWORD_HASH;
}
