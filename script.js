const config = {
  bookingUrl: "https://calendly.com/barbearia-aurora/agendamento",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rua+da+Aurora+145,+Boa+Vista,+Recife,+PE",
  phone: "+55 (81) 99123-4567",
  instagram: "https://www.instagram.com/barbeariaaurora"
};

function sanitizePhone(phone) {
  return phone.replace(/\D/g, "");
}

function applyDynamicLinks() {
  const bookingLinks = document.querySelectorAll(".js-booking-link");
  bookingLinks.forEach((link) => {
    link.href = config.bookingUrl;
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  const mapsLink = document.querySelector(".js-maps-link");
  if (mapsLink) {
    mapsLink.href = config.mapsUrl;
    mapsLink.setAttribute("target", "_blank");
    mapsLink.setAttribute("rel", "noopener noreferrer");
  }

  const phoneText = document.querySelectorAll(".js-phone-text");
  phoneText.forEach((item) => {
    item.textContent = config.phone;
  });

  const phoneDigits = sanitizePhone(config.phone);
  const message = encodeURIComponent("Olá! Quero agendar um horário na Barbearia Aurora.");
  const phoneLinkUrl = `https://wa.me/${phoneDigits}?text=${message}`;
  const phoneLinks = document.querySelectorAll(".js-phone-link");
  phoneLinks.forEach((link) => {
    link.href = phoneLinkUrl;
  });

  const instagramLinks = document.querySelectorAll(".js-instagram-link");
  instagramLinks.forEach((link) => {
    link.href = config.instagram;
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

function setupMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  if (!menuToggle || !mainNav) {
    return;
  }

  const closeMenu = () => {
    mainNav.classList.remove("open");
    document.body.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  };

  const openMenu = () => {
    mainNav.classList.add("open");
    document.body.classList.add("nav-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fechar menu");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.contains("open");
    if (isOpen) {
      closeMenu();
      return;
    }
    openMenu();
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        closeMenu();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav = mainNav.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);
    if (!clickedInsideNav && !clickedToggle && mainNav.classList.contains("open")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

function setupPortfolioFilters() {
  const buttons = document.querySelectorAll(".filter-btn[data-filter]");
  const items = document.querySelectorAll(".portfolio-item[data-category]");
  if (!buttons.length || !items.length) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((btn) => {
        btn.classList.remove("is-active");
      });
      button.classList.add("is-active");

      items.forEach((item) => {
        const itemCategory = item.dataset.category;
        const show = filter === "todos" || filter === itemCategory;

        item.classList.toggle("is-hidden", !show);
        item.setAttribute("aria-hidden", show ? "false" : "true");
      });
    });
  });
}

function setupFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) {
    return;
  }

  const closeItem = (item) => {
    item.classList.remove("open");
    const button = item.querySelector(".faq-question");
    if (button) {
      button.setAttribute("aria-expanded", "false");
    }
  };

  const openItem = (item) => {
    item.classList.add("open");
    const button = item.querySelector(".faq-question");
    if (button) {
      button.setAttribute("aria-expanded", "true");
    }
  };

  items.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      const shouldOpen = !item.classList.contains("open");
      items.forEach(closeItem);
      if (shouldOpen) {
        openItem(item);
      }
    });
  });

  items.forEach((item, index) => {
    if (index === 0) {
      openItem(item);
      return;
    }
    closeItem(item);
  });
}

function setupRevealOnScroll() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) {
    return;
  }

  elements.forEach((element, index) => {
    const delay = `${(index % 8) * 70}ms`;
    element.style.setProperty("--reveal-delay", delay);
  });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.2
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
}

function setupHeroParallax() {
  const hero = document.querySelector(".hero");
  const copy = hero ? hero.querySelector(".hero-copy") : null;
  const media = hero ? hero.querySelector(".hero-media") : null;
  if (!hero || !copy || !media) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  let pointerX = 0;
  let pointerY = 0;
  let rafId = null;

  const updateParallax = () => {
    const rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      rafId = null;
      return;
    }

    const x = (pointerX - rect.left) / rect.width - 0.5;
    const y = (pointerY - rect.top) / rect.height - 0.5;

    copy.style.setProperty("--shift-x", `${x * -10}px`);
    copy.style.setProperty("--shift-y", `${y * -8}px`);
    media.style.setProperty("--shift-x", `${x * 14}px`);
    media.style.setProperty("--shift-y", `${y * 12}px`);

    rafId = null;
  };

  const handlePointerMove = (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (rafId !== null) {
      return;
    }
    rafId = window.requestAnimationFrame(updateParallax);
  };

  const resetParallax = () => {
    copy.style.setProperty("--shift-x", "0px");
    copy.style.setProperty("--shift-y", "0px");
    media.style.setProperty("--shift-x", "0px");
    media.style.setProperty("--shift-y", "0px");
  };

  hero.addEventListener("pointermove", handlePointerMove);
  hero.addEventListener("pointerleave", resetParallax);
  hero.addEventListener("pointercancel", resetParallax);
}

function setupScheduleHighlight() {
  const dayCards = document.querySelectorAll(".day-card[data-weekday]");
  if (!dayCards.length) {
    return;
  }

  const currentWeekday = new Date().getDay();
  dayCards.forEach((card) => {
    const weekday = Number(card.dataset.weekday);
    if (Number.isNaN(weekday)) {
      return;
    }
    card.classList.toggle("is-today", weekday === currentWeekday);
  });
}

function setCurrentYear() {
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
}

function init() {
  applyDynamicLinks();
  setupMobileMenu();
  setupPortfolioFilters();
  setupFaqAccordion();
  setupRevealOnScroll();
  setupHeroParallax();
  setupScheduleHighlight();
  setCurrentYear();
}

document.addEventListener("DOMContentLoaded", init);
