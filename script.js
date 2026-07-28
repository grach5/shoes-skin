(function () {
  "use strict";

  var WHATSAPP_NUMBER = "79037995036"; // +7 903 799-50-36, international format without symbols

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Service cards: full 3D tilt synced with the patent-leather shine
     Perspective + preserve-3d live in CSS (.services-grid / .service-card).
     Here we just read the cursor position and drive rotateX/rotateY plus
     a matching translate on .service-shine so the highlight travels with
     the tilt instead of just sweeping on a timer. Skipped entirely for
     touch/coarse pointers (no meaningful hover) and under reduced motion.
     --------------------------------------------------------------------- */
  var supportsFineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!prefersReducedMotion && supportsFineHover) {
    var MAX_TILT_DEG = 7;

    document.querySelectorAll(".service-card").forEach(function (card) {
      var shine = card.querySelector(".service-shine");
      var rafId = null;
      var pendingEvent = null;

      var applyTilt = function () {
        rafId = null;
        if (!pendingEvent) { return; }

        var rect = card.getBoundingClientRect();
        var px = (pendingEvent.clientX - rect.left) / rect.width - 0.5;  // -0.5 .. 0.5
        var py = (pendingEvent.clientY - rect.top) / rect.height - 0.5;  // -0.5 .. 0.5

        var rotateY = px * 2 * MAX_TILT_DEG;
        var rotateX = -(py * 2 * MAX_TILT_DEG);

        card.style.transform =
          "rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) translateY(-6px)";

        if (shine) {
          var shineX = px * 240;        // -120% .. 120%, matches the CSS sweep range
          var shineY = py * 40;         // small vertical drift
          var shineTilt = rotateY * 0.6;
          shine.style.transform =
            "translate3d(" + shineX.toFixed(1) + "%, " + shineY.toFixed(1) + "%, 30px) rotate(" + shineTilt.toFixed(2) + "deg)";
        }
      };

      card.addEventListener("mouseenter", function () {
        card.classList.add("is-tilting");
      });

      card.addEventListener("mousemove", function (event) {
        pendingEvent = event;
        if (rafId === null) {
          rafId = window.requestAnimationFrame(applyTilt);
        }
      });

      card.addEventListener("mouseleave", function () {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
        pendingEvent = null;
        card.classList.remove("is-tilting");
        card.style.transform = "";
        if (shine) { shine.style.transform = ""; }
      });
    });
  }

  /* ---------------------------------------------------------------------
     Hero parallax: the decorative shoe-last outline drifts at a slower
     rate than the page scroll (transform only, no background-attachment),
     throttled with requestAnimationFrame and paused once the hero is out
     of view. Disabled entirely under reduced motion.
     --------------------------------------------------------------------- */
  if (!prefersReducedMotion) {
    var heroSection = document.querySelector(".hero");
    var heroBg = document.querySelector(".hero-bg");

    if (heroSection && heroBg) {
      var PARALLAX_FACTOR = 0.18;
      var PARALLAX_MAX = 70; // px, keeps the drift subtle on long scrolls
      var parallaxTicking = false;

      var updateParallax = function () {
        parallaxTicking = false;
        var rect = heroSection.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) { return; }
        var shift = Math.min(window.scrollY * PARALLAX_FACTOR, PARALLAX_MAX);
        heroBg.style.transform = "translate3d(0, " + shift.toFixed(2) + "px, 0)";
      };

      window.addEventListener("scroll", function () {
        if (!parallaxTicking) {
          parallaxTicking = true;
          window.requestAnimationFrame(updateParallax);
        }
      }, { passive: true });

      updateParallax();
    }
  }

  /* ---------------------------------------------------------------------
     Before/after reveal: clip-path wipe on the "Результат" section,
     triggered once the demo block scrolls into view. The animation
     itself is pure CSS (.reveal-after / .reveal-sheen / .reveal-edge in
     styles.css) driven by the .is-revealed class toggled here; the
     global prefers-reduced-motion rule crushes the transition duration
     to ~0, so under reduced motion it snaps straight to the revealed
     state instead of wiping. Unobserves after the first trigger so the
     "wow" moment stays a one-time reveal rather than replaying on every
     scroll pass.
     --------------------------------------------------------------------- */
  var revealDemo = document.getElementById("revealDemo");
  if (revealDemo) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealDemo.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.45 });
      revealObserver.observe(revealDemo);
    } else {
      revealDemo.classList.add("is-revealed");
    }
  }

  /* ---------------------------------------------------------------------
     Mobile navigation toggle
     --------------------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navList = document.getElementById("navList");

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var isOpen = navList.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navList.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navList.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------------
     Sticky header shadow on scroll (subtle, purely cosmetic)
     --------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) {
        header.style.boxShadow = "0 12px 30px -20px rgba(0,0,0,0.6)";
      } else {
        header.style.boxShadow = "none";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     Booking form -> WhatsApp deep link
     --------------------------------------------------------------------- */
  var form = document.getElementById("bookingForm");
  var statusEl = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.elements["name"].value.trim();
      var phone = form.elements["phone"].value.trim();
      var service = form.elements["service"].value;
      var date = form.elements["date"].value;
      var time = form.elements["time"].value;
      var comment = form.elements["comment"].value.trim();

      if (!name || !phone || !service) {
        if (statusEl) {
          statusEl.textContent = "Пожалуйста, заполните имя, телефон и услугу.";
          statusEl.classList.add("is-error");
        }
        return;
      }

      var lines = [
        "Здравствуйте! Хочу записаться в Shoes&Skin.",
        "Имя: " + name,
        "Телефон: " + phone,
        "Услуга: " + service
      ];

      if (date) {
        lines.push("Желаемая дата: " + date);
      }
      if (time) {
        lines.push("Желаемое время: " + time);
      }
      if (comment) {
        lines.push("Комментарий: " + comment);
      }

      var text = encodeURIComponent(lines.join("\n"));
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;

      if (statusEl) {
        statusEl.classList.remove("is-error");
        statusEl.textContent = "Открываем WhatsApp в новой вкладке…";
      }

      window.open(url, "_blank", "noopener,noreferrer");
    });
  }
})();
