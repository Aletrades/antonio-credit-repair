/* ============================================
   Antonio Picon — Credit Repair Website
   GSAP + Lenis + ScrollTrigger
   Heavy animations: floating cards, 3D tilt,
   score counters, FAQ accordion
   ============================================ */

// ---- Lenis Smooth Scroll ----
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ---- Loader ----
function initLoader() {
  const loader = document.getElementById("loader");
  const bar = document.getElementById("loader-bar");
  const cardIcon = document.querySelector(".loader-card-icon svg");
  const images = [...document.querySelectorAll("img")];

  let loaded = 0;
  const total = Math.max(images.length, 1);

  function update() {
    loaded++;
    bar.style.width = Math.round((loaded / total) * 100) + "%";
  }

  if (images.length === 0) {
    bar.style.width = "100%";
  } else {
    images.forEach((img) => img.decode().then(update).catch(update));
  }

  // 3D spin the credit card icon
  if (cardIcon) {
    gsap.to(cardIcon, {
      rotateY: 360,
      duration: 1.5,
      ease: "power2.inOut",
      repeat: -1,
      transformPerspective: 600,
    });
  }

  // Min display time then fade out
  setTimeout(() => {
    bar.style.width = "100%";
    setTimeout(() => {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => loader.remove(),
      });
    }, 300);
  }, 1200);
}

// ---- Header scroll effect ----
function initHeader() {
  const header = document.querySelector(".header");
  ScrollTrigger.create({
    start: "top -60",
    onUpdate: () => {
      header.classList.toggle("scrolled", window.scrollY > 60);
    },
  });
}

// ---- Hero animations ----
function initHero() {
  const tl = gsap.timeline({ delay: 1.2 });

  tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" })
    .from(".hero-title", { y: 30, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.3")
    .from(".hero-subtitle", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.3")
    .from(".hero-actions", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.2")
    .from(".hero-trust-mini span", { y: 15, opacity: 0, duration: 0.4, stagger: 0.1, ease: "power3.out" }, "-=0.2")
    .from(".hero-photo", { y: 50, opacity: 0, duration: 0.8, ease: "power3.out" }, 0.8)
    .from(".float-card", {
      scale: 0, opacity: 0, rotation: -15,
      duration: 0.6, stagger: 0.15,
      ease: "back.out(1.7)",
    }, 1.2)
    .from(".hero-gauge", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" }, 1.5);

  // Animate gauge needle from left (low) to right (high)
  const needle = document.querySelector(".gauge-needle");
  if (needle) {
    gsap.to(needle, {
      attr: { transform: "rotate(50, 100, 100)" },
      duration: 2,
      delay: 2.5,
      ease: "power2.out",
    });
  }
}

// ---- Floating credit cards continuous animation ----
function initFloatingCards() {
  const cards = document.querySelectorAll(".float-card");
  if (!cards.length) return;

  // Each card floats independently
  cards.forEach((card, i) => {
    gsap.to(card, {
      y: "random(-15, 15)",
      x: "random(-8, 8)",
      rotation: "random(-5, 5)",
      duration: "random(2.5, 4)",
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: i * 0.3,
    });
  });

  // Parallax tilt on mouse move (desktop only)
  if (window.matchMedia("(min-width: 769px)").matches) {
    const heroRight = document.querySelector(".hero-right");
    if (!heroRight) return;

    heroRight.addEventListener("mousemove", (e) => {
      const rect = heroRight.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      cards.forEach((card, i) => {
        const depth = 1 + i * 0.3;
        gsap.to(card, {
          rotateY: x * 15 * depth,
          rotateX: -y * 10 * depth,
          duration: 0.5,
          ease: "power2.out",
          transformPerspective: 600,
        });
      });
    });

    heroRight.addEventListener("mouseleave", () => {
      cards.forEach((card) => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
        });
      });
    });
  }
}

// ---- Reveal on scroll (multiple animation types) ----
function initReveal() {
  const revealTypes = [
    "reveal-up",
    "reveal-left",
    "reveal-right",
    "reveal-scale",
    "reveal-flip",
  ];

  revealTypes.forEach((type) => {
    const elements = document.querySelectorAll(`.${type}`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const parent = entry.target.parentElement;
            const siblings = [...parent.querySelectorAll(`.${type}`)];
            const index = siblings.indexOf(entry.target);

            setTimeout(() => {
              entry.target.classList.add("visible");
            }, index * 100);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
  });
}

// ---- Counter animations ----
function initCounters() {
  const stats = document.querySelectorAll(".stat");

  ScrollTrigger.create({
    trigger: ".trust-bar",
    start: "top 80%",
    once: true,
    onEnter: () => {
      stats.forEach((stat) => {
        const numEl = stat.querySelector(".stat-num");
        const target = parseInt(stat.dataset.value);
        if (target === 0) return; // skip $0 stat
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.5,
          ease: "power1.out",
          onUpdate: () => {
            numEl.textContent = Math.round(obj.val);
          },
        });
      });
    },
  });
}

// ---- Credit card showcase 3D tilt ----
function initCardShowcase() {
  const cards = document.querySelectorAll(".showcase-card");
  const section = document.querySelector(".card-showcase");
  if (!section || !cards.length) return;

  // Parallax scroll — cards move at different speeds
  cards.forEach((card) => {
    const speed = parseFloat(card.dataset.speed) || 1;
    gsap.to(card, {
      y: (speed - 1) * -100,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  // 3D tilt on mouse move (desktop)
  if (window.matchMedia("(min-width: 769px)").matches) {
    section.addEventListener("mousemove", (e) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      cards.forEach((card) => {
        gsap.to(card, {
          rotateY: x * 20,
          rotateX: -y * 15,
          duration: 0.4,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      });
    });

    section.addEventListener("mouseleave", () => {
      cards.forEach((card) => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        });
      });
    });
  }

  // Mobile: gentle auto-float
  if (window.matchMedia("(max-width: 768px)").matches) {
    cards.forEach((card, i) => {
      gsap.to(card, {
        rotateY: 5,
        rotateX: -3,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.5,
        transformPerspective: 1000,
      });
    });
  }
}

// ---- Service card elastic hover ----
function initServiceHover() {
  const cards = document.querySelectorAll(".service-card");

  cards.forEach((card) => {
    const icon = card.querySelector(".service-icon");
    if (!icon) return;

    card.addEventListener("mouseenter", () => {
      gsap.to(icon, {
        scale: 1.15,
        duration: 0.4,
        ease: "elastic.out(1, 0.5)",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(icon, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });
}

// ---- Testimonial score counter animation ----
function initTestimonialScores() {
  ScrollTrigger.create({
    trigger: ".testimonios",
    start: "top 70%",
    once: true,
    onEnter: () => {
      // Animate "before" scores
      document.querySelectorAll(".score-before .score-value").forEach((el) => {
        const target = parseInt(el.dataset.from);
        const obj = { val: 300 };
        gsap.to(obj, {
          val: target,
          duration: 1.2,
          ease: "power1.out",
          onUpdate: () => {
            el.textContent = Math.round(obj.val);
          },
        });
      });

      // Animate "after" scores with delay + color transition
      document.querySelectorAll(".score-after .score-value").forEach((el) => {
        const target = parseInt(el.dataset.to);
        const obj = { val: 300 };
        gsap.to(obj, {
          val: target,
          duration: 1.5,
          delay: 0.5,
          ease: "power2.out",
          onUpdate: () => {
            const val = Math.round(obj.val);
            el.textContent = val;
            // Color: red (300) -> green (700+)
            const ratio = Math.min((val - 300) / 400, 1);
            const r = Math.round(231 - ratio * 192);
            const g = Math.round(76 + ratio * 98);
            const b = Math.round(60 - ratio * 0);
            el.style.color = `rgb(${r}, ${g}, ${b})`;
          },
        });
      });
    },
  });
}

// ---- FAQ accordion ----
function initFAQ() {
  const items = document.querySelectorAll(".faq-item");

  items.forEach((item) => {
    const summary = item.querySelector("summary");
    const answer = item.querySelector(".faq-answer");

    summary.addEventListener("click", (e) => {
      e.preventDefault();

      if (item.open) {
        gsap.to(answer, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => {
            item.open = false;
          },
        });
      } else {
        // Close all others
        items.forEach((other) => {
          if (other !== item && other.open) {
            const otherAnswer = other.querySelector(".faq-answer");
            gsap.to(otherAnswer, {
              height: 0,
              opacity: 0,
              duration: 0.2,
              ease: "power2.inOut",
              onComplete: () => {
                other.open = false;
              },
            });
          }
        });

        // Open this one
        item.open = true;
        const fullHeight = answer.scrollHeight;
        gsap.fromTo(
          answer,
          { height: 0, opacity: 0 },
          { height: fullHeight, opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      }
    });
  });
}

// ---- Contact Form ----
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = document.getElementById("formStatus");
    const btn = form.querySelector("button[type='submit']");
    const originalText = btn.textContent;
    btn.textContent = "Enviando...";
    btn.disabled = true;

    const data = Object.fromEntries(new FormData(form));

    try {
      // Placeholder webhook — replace when Antonio's n8n workflow is created
      const res = await fetch(
        "https://n8n.srv906468.hstgr.cloud/webhook/antonio-credit-leads",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) {
        status.textContent =
          "¡Mensaje enviado! Te contactaremos en menos de 24 horas.";
        status.style.color = "var(--success)";
        form.reset();
      } else {
        throw new Error("Server error");
      }
    } catch {
      status.textContent =
        "Algo salió mal. Llámanos directamente al (XXX) XXX-XXXX.";
      status.style.color = "var(--error)";
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// ---- Smooth anchors ----
function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      }
    });
  });
}

// ---- Hamburger ----
function initHamburger() {
  const btn = document.querySelector(".hamburger");
  const links = document.querySelector(".nav-links");
  if (!btn || !links) return;

  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    links.classList.toggle("open");
  });
  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      btn.classList.remove("active");
      links.classList.remove("open");
    });
  });
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initHeader();
  initHero();
  initFloatingCards();
  initReveal();
  initCounters();
  initCardShowcase();
  initServiceHover();
  initTestimonialScores();
  initFAQ();
  initContactForm();
  initAnchors();
  initHamburger();
});
