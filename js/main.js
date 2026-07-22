document.addEventListener("DOMContentLoaded", function () {
  initMobileNav();
  initGalleryEmptyState();
  initScrollReveal();
  initHeaderScroll();
  initScrollProgress();
  initBackToTop();
  initGalleryLightbox();
  initContactForm();
  initTiltCards();
  initParallax();
});

function initMobileNav() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("open");
    toggle.classList.toggle("is-active", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.classList.remove("is-active");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initGalleryEmptyState() {
  var galleryItems = document.querySelectorAll(".gallery-item img");
  if (!galleryItems.length) return;

  var loaded = 0;
  var remaining = galleryItems.length;
  var checkEmpty = function () {
    remaining -= 1;
    if (remaining === 0 && loaded === 0) {
      var empty = document.querySelector(".gallery-empty");
      if (empty) empty.style.display = "block";
    }
  };

  galleryItems.forEach(function (img) {
    img.addEventListener("load", function () {
      loaded += 1;
      remaining -= 1;
    });
    img.addEventListener("error", function () {
      img.closest(".gallery-item").style.display = "none";
      checkEmpty();
    });
  });
}

function initScrollReveal() {
  var selectors = [
    ".section-head", ".card", ".hero-copy > *", ".hero-card",
    ".split > *", ".cta-banner", ".area-list li", ".trust-item",
    ".gallery-item", ".footer-grid > div", ".contact-info-card",
    ".form-card", ".value-list > *", ".review-cta", ".map-wrap"
  ];

  var seen = new Set();
  var els = [];
  selectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (!seen.has(el)) {
        seen.add(el);
        els.push(el);
      }
    });
  });

  if (!els.length) return;

  if (!("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("reveal", "in-view"); });
    return;
  }

  var staggerIndex = new Map();
  els.forEach(function (el) {
    var parent = el.parentElement;
    var index = staggerIndex.get(parent) || 0;
    el.style.setProperty("--reveal-delay", Math.min(index, 6) * 90 + "ms");
    staggerIndex.set(parent, index + 1);
    el.classList.add("reveal");
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // Toggle both ways (rather than observing once) so each element
      // replays its move-in animation every time it re-enters the
      // viewport, not just on its first scroll past.
      entry.target.classList.toggle("in-view", entry.isIntersecting);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  els.forEach(function (el) { observer.observe(el); });
}

function initHeaderScroll() {
  var header = document.querySelector(".site-header");
  if (!header) return;

  var ticking = false;
  var update = function () {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    ticking = false;
  };

  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });

  update();
}

function initScrollProgress() {
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);

  var ticking = false;
  var update = function () {
    var scrollTop = window.scrollY;
    var height = document.documentElement.scrollHeight - window.innerHeight;
    var progress = height > 0 ? (scrollTop / height) * 100 : 0;
    bar.style.width = progress + "%";
    ticking = false;
  };

  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });
  window.addEventListener("resize", update);

  update();
}

function initBackToTop() {
  var btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
  document.body.appendChild(btn);

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  var ticking = false;
  var update = function () {
    btn.classList.toggle("is-visible", window.scrollY > 480);
    ticking = false;
  };

  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });

  update();
}

function initGalleryLightbox() {
  var allItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item img"));
  if (!allItems.length) return;

  var lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML =
    '<button class="lightbox-close" aria-label="Close">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
    '</button>' +
    '<button class="lightbox-prev" aria-label="Previous photo">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
    '</button>' +
    '<img alt="">' +
    '<button class="lightbox-next" aria-label="Next photo">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
    '</button>';
  document.body.appendChild(lightbox);

  var imgEl = lightbox.querySelector("img");
  var current = 0;

  allItems.forEach(function (img) {
    var item = img.closest(".gallery-item");
    if (item.querySelector(".gallery-zoom-icon")) return;
    var icon = document.createElement("span");
    icon.className = "gallery-zoom-icon";
    icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>';
    item.appendChild(icon);
  });

  var visibleItems = function () {
    return allItems.filter(function (img) {
      return img.closest(".gallery-item").style.display !== "none";
    });
  };

  var render = function (img) {
    imgEl.src = img.currentSrc || img.src;
    imgEl.alt = img.alt || "";
  };

  var open = function (img) {
    var list = visibleItems();
    current = list.indexOf(img);
    render(img);
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  var close = function () {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  var show = function (delta) {
    var list = visibleItems();
    if (!list.length) return;
    current = (current + delta + list.length) % list.length;
    render(list[current]);
  };

  allItems.forEach(function (img) {
    img.closest(".gallery-item").addEventListener("click", function () { open(img); });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", close);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { show(-1); });
  lightbox.querySelector(".lightbox-next").addEventListener("click", function () { show(1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(-1);
    if (e.key === "ArrowRight") show(1);
  });
}

function initTiltCards() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  var els = document.querySelectorAll(".card, .hero-card");
  if (!els.length) return;

  els.forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      el.style.setProperty("--lift", "-6px");
    });
    el.addEventListener("mousemove", function (e) {
      var rect = el.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--rx", (px * 8).toFixed(2) + "deg");
      el.style.setProperty("--ry", (py * -8).toFixed(2) + "deg");
    });
    el.addEventListener("mouseleave", function () {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--lift", "0px");
    });
  });
}

function initParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Photos and the hero visit-card drift at a slightly different speed
  // than the page as it scrolls, so the page keeps feeling "in motion"
  // rather than only animating once on first reveal.
  var els = [];
  document.querySelectorAll(".image-block, .hero-card").forEach(function (el) {
    var depth = el.classList.contains("hero-card") ? 0.06 : 0.09;
    els.push({ el: el, depth: depth });
  });
  if (!els.length) return;

  var viewportH = window.innerHeight;
  var ticking = false;

  var update = function () {
    els.forEach(function (item) {
      var rect = item.el.getBoundingClientRect();
      var centerOffset = rect.top + rect.height / 2 - viewportH / 2;
      var shift = Math.max(-40, Math.min(40, -centerOffset * item.depth));
      item.el.style.transform = "translateY(" + shift.toFixed(1) + "px)";
    });
    ticking = false;
  };

  var onScroll = function () {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll);
  window.addEventListener("resize", function () {
    viewportH = window.innerHeight;
    onScroll();
  });

  update();
}

function initContactForm() {
  var form = document.querySelector("#contact-form");
  if (!form) return;

  var nextField = form.querySelector('input[name="_next"]');
  if (nextField) {
    nextField.value = new URL("thank-you.html", window.location.href).href;
  }

  var submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    form.addEventListener("submit", function () {
      submitBtn.classList.add("is-loading");
      submitBtn.textContent = "Sending...";
    });
  }
}
