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

// Cache en memoria para respuesta instantánea
let cachedData = null;

// Lee datos desde Firestore (timeout 5s)
async function getFirestoreData() {
  if (!DOC_REF) return null;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Firestore no responde en 5s")), 5000));
    const doc = await Promise.race([DOC_REF.get(), timeout]);
    if (doc.exists) return doc.data().data;
  } catch (e) {
    console.error("Firestore read error — revisá que Firestore Database esté habilitado en Firebase Console:", e.message);
  }
  return null;
}

// Guarda datos en Firestore (con try/catch, nunca lanza)
async function saveData(data) {
  cachedData = data;
  if (!DOC_REF) return;
  try {
    await DOC_REF.set({ data }, { merge: true });
  } catch (e) {
    console.error("Firestore save error:", e);
  }
}

// --- API pública ---

// getContent: devuelve datos al instante.
// Primero usa cache en memoria, luego intenta Firestore.
// Si nunca se cargaron datos, devuelve DEFAULT_DATA de inmediato
// y en background intenta obtener desde Firestore.
let loadingFromFirestore = false;

async function getContent() {
  if (cachedData) return cachedData;

  // Primera vez: devolver DEFAULT_DATA inmediatamente
  cachedData = DEFAULT_DATA;

  // En background, intentar cargar desde Firestore
  if (!loadingFromFirestore) {
    loadingFromFirestore = true;
    getFirestoreData().then(remote => {
      if (remote) {
        cachedData = remote;
        // Disparar evento para que main.js/admin.js re-rendericen
        document.dispatchEvent(new CustomEvent("data-refresh", { detail: remote }));
      }
    }).catch(() => {}).finally(() => { loadingFromFirestore = false; });
  }

  return DEFAULT_DATA;
}

async function updateContent(updates) {
  const data = await getContent();
  Object.assign(data, updates);
  await saveData(data);
  return data;
}

async function addPortfolioItem(item) {
  const data = await getContent();
  item.id = Date.now();
  data.portfolio.push(item);
  await saveData(data);
  return data;
}

async function updatePortfolioItem(id, updates) {
  const data = await getContent();
  const idx = data.portfolio.findIndex((p) => p.id === id);
  if (idx !== -1) {
    data.portfolio[idx] = { ...data.portfolio[idx], ...updates };
    await saveData(data);
  }
  return data;
}

async function deletePortfolioItem(id) {
  const data = await getContent();
  data.portfolio = data.portfolio.filter((p) => p.id !== id);
  await saveData(data);
  return data;
}

async function addExperienceItem(item) {
  const data = await getContent();
  item.id = Date.now();
  data.experience.push(item);
  await saveData(data);
  return data;
}

async function updateExperienceItem(id, updates) {
  const data = await getContent();
  const idx = data.experience.findIndex((e) => e.id === id);
  if (idx !== -1) {
    data.experience[idx] = { ...data.experience[idx], ...updates };
    await saveData(data);
  }
  return data;
}

async function deleteExperienceItem(id) {
  const data = await getContent();
  data.experience = data.experience.filter((e) => e.id !== id);
  await saveData(data);
  return data;
}

async function updateServices(services) {
  return updateContent({ services });
}

async function deleteServiceItem(id) {
  const data = await getContent();
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
