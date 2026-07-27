(function () {
  "use strict";

  var WHATSAPP_NUMBER = "79037995036"; // +7 903 799-50-36, international format without symbols

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
