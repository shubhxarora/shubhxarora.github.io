document.addEventListener('DOMContentLoaded', () => {
  // --- Sticky Navigation & Scroll Highlighting ---
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    // Sticky header transition
    if (window.scrollY > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }

    // Highlighting active nav link based on scroll position
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 120)) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // Smooth scroll for nav links (overriding default to accommodate sticky header)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        // Toggle mobile menu if open
        if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          mobileNavToggle.classList.remove('open');
        }

        const headerOffset = 80;
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Smooth scroll and auto-dismiss mobile menu for header 'Contact Us' CTA buttons
  const headerCtaButtons = document.querySelectorAll('#btn-header-quote, #btn-mobile-contact');
  headerCtaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        // Close mobile menu if open
        if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          mobileNavToggle.classList.remove('open');
        }

        const headerOffset = 80;
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Mobile Navigation Menu ---
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  mobileNavToggle.addEventListener('click', () => {
    mobileNavToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // --- Interactive Energy Calculator ---
  const appButtons = document.querySelectorAll('.app-select-btn');
  const loadSlider = document.getElementById('load-slider');
  const timeSlider = document.getElementById('time-slider');
  const loadVal = document.getElementById('load-val');
  const timeVal = document.getElementById('time-val');
  
  const capacityVal = document.getElementById('capacity-val');
  const gaugeFill = document.getElementById('gauge-fill');
  const recTechName = document.getElementById('rec-tech-name');
  const recDesc = document.getElementById('rec-desc');

  // Application Parameters
  let currentApp = 'forklift'; // default
  const appData = {
    forklift: {
      name: 'Forklift / Motive Power',
      maxLoad: 30, // kW
      maxTime: 12, // Hours
      efficiency: 0.85,
      getRecommendation: (kwh) => {
        if (kwh <= 40) {
          return {
            tech: 'NBA Deep Cycle Tubular',
            desc: 'Premium Italian heavy-duty lead-acid traction monoblocs. Built for extreme cycles and cost-effective daily material handling.'
          };
        } else {
          return {
            tech: 'Steatite Custom Lithium-Ion Pack',
            desc: 'High-performance UK-engineered custom battery packs with integrated Battery Management Systems (BMS) for extreme industrial cycles.'
          };
        }
      }
    },
    solar: {
      name: 'Solar & Grid Storage',
      maxLoad: 50, // kW
      maxTime: 24, // Hours
      efficiency: 0.90,
      getRecommendation: (kwh) => {
        if (kwh <= 25) {
          return {
            tech: 'LEOCH Pure GEL / AGM Series',
            desc: 'Sealed Valve-Regulated Lead Acid deep-cycle batteries. High thermal stability and excellent recovery from deep discharge.'
          };
        } else {
          return {
            tech: 'Steatite Industrial Lithium Storage',
            desc: 'High-density modular lithium-ion energy blocks. Tailored for seamless grid reserves and smart industrial storage scalability.'
          };
        }
      }
    },
    ups: {
      name: 'UPS & Data Center Backup',
      maxLoad: 80, // kW
      maxTime: 6, // Hours
      efficiency: 0.95,
      getRecommendation: (kwh) => {
        if (kwh <= 35) {
          return {
            tech: 'LEOCH High-Rate AGM VRLA',
            desc: 'Optimized flatplate technology engineered specifically for short-duration, high-current discharge critical backups.'
          };
        } else {
          return {
            tech: 'Steatite Smart UPS Lithium Cabinets',
            desc: 'Premium high-reliability custom lithium backup packs featuring active integrated cell monitoring and modular footprints.'
          };
        }
      }
    },
    golfcart: {
      name: 'Golf Carts & Light EVs',
      maxLoad: 10, // kW
      maxTime: 8, // Hours
      efficiency: 0.88,
      getRecommendation: (kwh) => {
        if (kwh <= 10) {
          return {
            tech: 'NBA Heavy Flatplate Monoblocs',
            desc: 'Robust reinforced flat-plate lead batteries. Excellent amp-hour capacity stability and high resistance to vibration.'
          };
        } else {
          return {
            tech: 'Steatite Lithium Motive EV Pack',
            desc: 'Lightweight vibration-resistant lithium traction upgrades with active smart cell monitoring for lightweight electric vehicles.'
          };
        }
      }
    }
  };

  // Switch Calculator Application Mode
  appButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      appButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentApp = btn.dataset.app;
      updateCalculatorBounds();
    });
  });

  function updateCalculatorBounds() {
    const config = appData[currentApp];
    
    // Scale ranges & step size dynamically
    loadSlider.max = config.maxLoad;
    timeSlider.max = config.maxTime;
    
    // Reset values to safe midpoints if currently out of bounds
    if (parseFloat(loadSlider.value) > config.maxLoad) {
      loadSlider.value = Math.round(config.maxLoad / 2);
    }
    if (parseFloat(timeSlider.value) > config.maxTime) {
      timeSlider.value = Math.round(config.maxTime / 2);
    }

    calculateEnergy();
  }

  function calculateEnergy() {
    const config = appData[currentApp];
    const load = parseFloat(loadSlider.value);
    const time = parseFloat(timeSlider.value);

    // Update Slider text
    loadVal.textContent = `${load} kW`;
    timeVal.textContent = `${time} hrs`;

    // Mathematical Capacity Calculation
    // Capacity (kWh) = (Load * Hours) / Efficiency
    const rawCapacity = (load * time) / config.efficiency;
    const capacityKwh = Math.round(rawCapacity * 10) / 10; // decimal format

    capacityVal.textContent = capacityKwh;

    // Recommendation logic
    const rec = config.getRecommendation(capacityKwh);
    recTechName.textContent = rec.tech;
    recDesc.textContent = rec.desc;

    // SVG Gauge Animation
    // Circumference = 2 * PI * r = 2 * 3.1415 * 70 = 439.8 (say 440)
    const maxPossibleCapacity = (config.maxLoad * config.maxTime) / config.efficiency;
    const percentage = Math.min((capacityKwh / maxPossibleCapacity) * 100, 100);
    const strokeDashoffset = 440 - (440 * percentage) / 100;
    
    gaugeFill.style.strokeDashoffset = strokeDashoffset;
  }

  // Bind slider changes
  loadSlider.addEventListener('input', calculateEnergy);
  timeSlider.addEventListener('input', calculateEnergy);

  // Initialize bounds
  updateCalculatorBounds();

  // --- Product Catalog Tabs & Filtering ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const prodCards = document.querySelectorAll('.prod-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.tab;

      prodCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';
        
        setTimeout(() => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        }, 300);
      });
    });
  });

  // --- Contact Quote Form Handling ---
  const quoteForm = document.getElementById('quote-form');
  const toast = document.querySelector('.toast-msg');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple validation indicator (all fields have basic HTML5 required validation)
      // Visual feedback with our custom Glassmorphic Toast
      toast.classList.add('show');
      
      // Auto-hide toast & reset form after 4 seconds
      setTimeout(() => {
        toast.classList.remove('show');
        quoteForm.reset();
      }, 4000);
    });
  }

  // --- Dynamic Logo Background Transparency ---
  function makeLogoTransparent() {
    const logoImages = document.querySelectorAll('.logo-img, .logo-img-footer');
    if (!logoImages.length) return;

    logoImages.forEach(img => {
      // Process image once it's loaded, or immediately if already loaded
      if (img.complete) {
        processImage(img);
      } else {
        img.addEventListener('load', () => processImage(img));
      }
    });

    function processImage(img) {
      if (img.dataset.processed === 'true') return;

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Loop through pixels and set alpha to 0 for white/near-white pixels
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];

          // If the pixel is very close to white (RGB > 240), make it transparent
          if (r > 240 && g > 240 && b > 240) {
            data[i+3] = 0; // alpha = 0 (transparent)
          }
        }

        ctx.putImageData(imgData, 0, 0);
        img.src = canvas.toDataURL('image/png');
        img.dataset.processed = 'true';
      } catch (e) {
        console.error('Failed to make logo transparent:', e);
      }
    }
  }

  makeLogoTransparent();

  // --- Certifications Modal Trigger ---
  const certModal = document.getElementById('certifications-modal');
  const certModalImage = document.getElementById('cert-modal-image');
  const certModalTitle = document.getElementById('cert-modal-title');
  const certModalSubtitle = document.getElementById('cert-modal-subtitle');
  const viewCertBtns = document.querySelectorAll('.btn-cert-view');
  const closeCertBtn = document.getElementById('btn-close-cert-modal');
  const closeOverlay = document.getElementById('cert-modal-close-overlay');

  const certData = {
    nba: {
      title: 'NBA Batterie Authorization Certificate',
      subtitle: 'Official certified exclusive distributor certificate for NBA traction monoblocs (Italy).',
      imgSrc: 'assets/nba2025.png'
    },
    leoch: {
      title: 'LEOCH International Authorization Certificate',
      subtitle: 'Official certified authorized distributor certificate for LEOCH battery storage portfolios (Global).',
      imgSrc: 'assets/leoch2025.png'
    }
  };

  if (certModal && viewCertBtns.length) {
    viewCertBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const certKey = btn.dataset.cert;
        const data = certData[certKey];

        if (data) {
          certModalImage.src = data.imgSrc;
          certModalImage.alt = data.title;
          certModalTitle.textContent = data.title;
          certModalSubtitle.textContent = data.subtitle;

          certModal.classList.add('show');
          certModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden'; // lock page scroll
        }
      });
    });

    const hideCertModal = () => {
      certModal.classList.remove('show');
      certModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; // unlock page scroll
    };

    if (closeCertBtn) closeCertBtn.addEventListener('click', hideCertModal);
    if (closeOverlay) closeOverlay.addEventListener('click', hideCertModal);

    // Escape key press to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && certModal.classList.contains('show')) {
        hideCertModal();
      }
    });
  }
});
