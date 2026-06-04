const i18n = {
  en: {
    nav: {
      home: "Home",
      portfolio: "Portfolio",
      experience: "Experience",
      services: "Services",
      contact: "Contact",
      admin: "Admin"
    },
    hero: {
      tag: "Precision in Every Pixel",
      subtitle: "Exclusive iRacing design studio — custom liveries, suits, helmets & esports merchandise.",
      cta: "View Portfolio",
      scroll: "Scroll to explore"
    },
    portfolio: {
      title: "Portfolio",
      subtitle: "Selected works",
      empty: "No projects yet. Add one from the admin panel.",
      filterAll: "All",
      filterCars: "Cars",
      filterSuits: "Suits",
      filterHelmets: "Helmets",
      filterTshirts: "T-Shirts",
      viewProject: "View Project",
      close: "Close"
    },
    experience: {
      title: "Experience",
      subtitle: "Official designer for a top split iRacing team",
      description: "Currently serving as the official designer for one of iRacing's most competitive top split teams, responsible for creating custom car liveries and team merchandise.",
      cta: "Join Discord"
    },
    services: {
      title: "Services",
      subtitle: "What I do",
      inquire: "Inquire via Discord"
    },
    contact: {
      title: "Contact",
      subtitle: "Let's build something",
      discord: "Open a Ticket on Discord",
      discordDesc: "For design requests, questions, and updates — join the Discord server and open a ticket.",
      instagram: "Follow on Instagram",
      tradingPaints: "Trading Paints Profile",
      social: "Social",
      donation: "Buy me a Coffee",
      donationDesc: "Enjoyed the designs? Support via PayPal donation!"
    },
    footer: {
      copyright: "All rights reserved.",
      made: "Made for iRacing"
    },
    admin: {
      loginTitle: "Admin Login",
      password: "Password",
      login: "Login",
      logout: "Logout",
      wrongPassword: "Wrong password",
      dashboard: "Dashboard",
      editPortfolio: "Edit Portfolio",
      editExperience: "Edit Experience",
      editServices: "Edit Services",
      editSite: "Edit Site Text",
      save: "Save",
      add: "Add",
      delete: "Delete",
      edit: "Edit",
      cancel: "Cancel",
      confirm: "Confirm",
      addPortfolio: "Add Project",
      editPortfolioItem: "Edit Project",
      title: "Title",
      category: "Category",
      image: "Image URL",
      description: "Description",
      categories: {
        cars: "Cars",
        suits: "Suits",
        helmets: "Helmets",
        tshirts: "T-Shirts"
      },
      experienceTitle: "Experience Title",
      experienceSubtitle: "Experience Subtitle",
      experienceDesc: "Description",
      addAchievement: "Add Achievement",
      achievementYear: "Year",
      achievementText: "Text",
      servicesTitle: "Service Title",
      servicesDesc: "Description",
      servicesPrice: "Price",
      servicesPaypal: "PayPal Link",
      siteTitle: "Site Title",
      siteSubtitle: "Subtitle",
      siteDesc: "Description",
      siteHeroTag: "Hero Tagline",
      saved: "Changes saved successfully",
      error: "Error saving changes"
    }
  },
  es: {
    nav: {
      home: "Inicio",
      portfolio: "Portafolio",
      experience: "Experiencia",
      services: "Servicios",
      contact: "Contacto",
      admin: "Admin"
    },
    hero: {
      tag: "Precisión en Cada Píxel",
      subtitle: "Estudio exclusivo de diseño para iRacing — diseños personalizados de autos, trajes, cascos y merchandising esports.",
      cta: "Ver Portafolio",
      scroll: "Desplázate para explorar"
    },
    portfolio: {
      title: "Portafolio",
      subtitle: "Trabajos seleccionados",
      empty: "Sin proyectos aún. Agrega uno desde el panel de admin.",
      filterAll: "Todos",
      filterCars: "Autos",
      filterSuits: "Trajes",
      filterHelmets: "Cascos",
      filterTshirts: "Camisetas",
      viewProject: "Ver Proyecto",
      close: "Cerrar"
    },
    experience: {
      title: "Experiencia",
      subtitle: "Diseñador oficial de un equipo top split de iRacing",
      description: "Actualmente diseño oficial de uno de los equipos más competitivos de iRacing en top split, responsable de diseños de autos y merchandising del equipo.",
      cta: "Unirse a Discord"
    },
    services: {
      title: "Servicios",
      subtitle: "Lo que hago",
      inquire: "Consultar por Discord"
    },
    contact: {
      title: "Contacto",
      subtitle: "Construyamos algo",
      discord: "Abrir Ticket en Discord",
      discordDesc: "Para solicitudes de diseño, dudas y novedades — únete al servidor de Discord y abre un ticket.",
      instagram: "Seguir en Instagram",
      tradingPaints: "Perfil de Trading Paints",
      social: "Redes",
      donation: "Invítame un Café",
      donationDesc: "¿Te gustaron los diseños? Apoya con una donación por PayPal!"
    },
    footer: {
      copyright: "Todos los derechos reservados.",
      made: "Hecho para iRacing"
    },
    admin: {
      loginTitle: "Inicio de Sesión",
      password: "Contraseña",
      login: "Ingresar",
      logout: "Cerrar Sesión",
      wrongPassword: "Contraseña incorrecta",
      dashboard: "Panel",
      editPortfolio: "Editar Portafolio",
      editExperience: "Editar Experiencia",
      editServices: "Editar Servicios",
      editSite: "Editar Texto del Sitio",
      save: "Guardar",
      add: "Agregar",
      delete: "Eliminar",
      edit: "Editar",
      cancel: "Cancelar",
      confirm: "Confirmar",
      addPortfolio: "Agregar Proyecto",
      editPortfolioItem: "Editar Proyecto",
      title: "Título",
      category: "Categoría",
      image: "URL de Imagen",
      description: "Descripción",
      categories: {
        cars: "Autos",
        suits: "Trajes",
        helmets: "Cascos",
        tshirts: "Camisetas"
      },
      experienceTitle: "Título de Experiencia",
      experienceSubtitle: "Subtítulo de Experiencia",
      experienceDesc: "Descripción",
      addAchievement: "Agregar Logro",
      achievementYear: "Año",
      achievementText: "Texto",
      servicesTitle: "Título del Servicio",
      servicesDesc: "Descripción",
      servicesPrice: "Precio",
      servicesPaypal: "Enlace PayPal",
      siteTitle: "Título del Sitio",
      siteSubtitle: "Subtítulo",
      siteDesc: "Descripción",
      siteHeroTag: "Frase del Hero",
      saved: "Cambios guardados exitosamente",
      error: "Error al guardar cambios"
    }
  }
};

let currentLang = localStorage.getItem("tsd-lang") || "en";

function getText(key) {
  const keys = key.split(".");
  let obj = i18n[currentLang];
  for (const k of keys) {
    if (obj && obj[k] !== undefined) {
      obj = obj[k];
    } else {
      return key;
    }
  }
  return obj;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("tsd-lang", lang);
  document.documentElement.lang = lang;
  translatePage();
}

function translatePage() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = getText(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = getText(key);
  });
}
