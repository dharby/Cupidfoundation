/* =====================================================================
   CUPID FOUNDATION — Interactions
   ===================================================================== */
(function () {
  "use strict";

  /* ---- Theme (dark mode) ---- */
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    var btn = document.getElementById("themeToggle");
    if (btn) btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    if (meta) meta.setAttribute("content", t === "dark" ? "#0f1715" : "#0b2a5b");
  }
  var saved = null;
  try { saved = localStorage.getItem("cupid-theme"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var initial = saved || (prefersDark ? "dark" : "light");
  applyTheme(initial);
  var themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("cupid-theme", next); } catch (e) {}
    });
  }

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Nav scroll state ---- */
  var nav = document.getElementById("nav");
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("scrolled", y > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu (side drawer) ---- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A" || e.target.closest("a")) {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
    // Close on backdrop click (click outside drawer)
    document.addEventListener("click", function (e) {
      if (document.body.classList.contains("menu-open") && 
          !links.contains(e.target) && 
          !toggle.contains(e.target)) {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
    // Close on Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* ---- Footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Animated counters ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var dur = 1600;
    var start = null;
    function fmt(v) {
      if (decimals > 0) return v.toFixed(decimals) + suffix;
      return Math.floor(v).toLocaleString("en-US") + suffix;
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      var t = parseFloat(el.getAttribute("data-count"));
      var s = el.getAttribute("data-suffix") || "";
      var d = parseInt(el.getAttribute("data-decimals") || "0", 10);
      el.textContent = d > 0 ? t.toFixed(d) + s : Math.floor(t).toLocaleString("en-US") + s;
    });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var open = q.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-q").forEach(function (o) {
        o.setAttribute("aria-expanded", "false");
        o.parentElement.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!open) {
        q.setAttribute("aria-expanded", "true");
        var a = q.parentElement.querySelector(".faq-a");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---- Gallery filter ---- */
  var filters = document.querySelectorAll(".gfilter");
  var items = document.querySelectorAll(".gallery-grid .g");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      filters.forEach(function (x) { x.classList.remove("active"); });
      f.classList.add("active");
      var cat = f.getAttribute("data-filter");
      items.forEach(function (it) {
        var show = cat === "all" || it.getAttribute("data-cat") === cat;
        it.style.display = show ? "" : "none";
      });
    });
  });

  /* ---- Lightbox ---- */
  var lb = document.getElementById("lightbox");
  var lbClose = document.getElementById("lbClose");
  var lbInner = lb ? lb.querySelector(".lb-inner") : null;
  if (lb && lbInner) {
    document.querySelectorAll(".gallery-grid .g-photo").forEach(function (img) {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        lbInner.innerHTML = '<img src="' + this.src + '" alt="" style="max-width:100%;max-height:90vh;object-fit:contain;">';
        lb.classList.add("open");
      });
    });
    lbClose.addEventListener("click", function () { lb.classList.remove("open"); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.classList.remove("open"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) lb.classList.remove("open"); });
  }

  /* ---- Countdown timers ---- */
  var cdEls = document.querySelectorAll(".countdown");
  function tick() {
    var now = new Date().getTime();
    cdEls.forEach(function (cd) {
      var date = new Date(cd.getAttribute("data-date")).getTime();
      var diff = date - now;
      var cells = cd.querySelectorAll(".cd b");
      if (diff < 0) { cells.forEach(function (c) { c.textContent = "0"; }); return; }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      cells[0].textContent = d;
      cells[1].textContent = h;
      cells[2].textContent = m;
      cells[3].textContent = s;
    });
  }
  if (cdEls.length) { tick(); setInterval(tick, 1000); }

  /* ---- Smooth anchor offset for fixed nav ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1) {
        var t = document.querySelector(id);
        if (t) {
          e.preventDefault();
          var top = t.getBoundingClientRect().top + window.scrollY - 64;
          window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
        }
      }
    });
  });

  /* ---- Hero slideshow ---- */
  var slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1 && !prefersReduced) {
    var si = 0;
    setInterval(function () {
      slides[si].classList.remove("is-active");
      si = (si + 1) % slides.length;
      slides[si].classList.add("is-active");
    }, 5000);
  }

})();