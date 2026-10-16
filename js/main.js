/*
 * BookNest — skrip bersama untuk ketiga halaman
 * - Menu navigasi mobile
 * - Jumlah buku tersimpan di header
 * - Tombol "Kembali ke atas"
 * - Angka jumlah buku per kategori/tingkat (diambil dari data, bukan ditulis manual)
 * - Tahun pada footer
 */
window.BookNest = window.BookNest || {};

(function (BN) {
  "use strict";

  BN.prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initMobileNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Tutup menu jika layar diperlebar ke ukuran desktop.
    window.matchMedia("(min-width: 48rem)").addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
  }

  function updateSavedCount() {
    const count = BN.storage.getBookmarks().length;
    document.querySelectorAll("[data-saved-count]").forEach((node) => {
      node.textContent = String(count);
    });
  }

  function initBackToTop() {
    const button = document.querySelector("[data-back-to-top]");
    if (!button) return;

    const toggleVisibility = () => {
      button.hidden = window.scrollY < 700;
    };
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: BN.prefersReducedMotion() ? "auto" : "smooth" });
      // Pindahkan fokus ke awal konten agar pengguna keyboard ikut "naik".
      const main = document.getElementById("main");
      if (main) main.focus({ preventScroll: true });
    });
  }

  function fillCounts() {
    const books = BN.books.curated;
    document.querySelectorAll("[data-count-category]").forEach((node) => {
      const id = node.dataset.countCategory;
      node.textContent = String(id === "all" ? books.length : books.filter((b) => b.category === id).length);
    });
    document.querySelectorAll("[data-count-level]").forEach((node) => {
      node.textContent = String(books.filter((b) => b.level === node.dataset.countLevel).length);
    });
  }

  BN.fillCounts = fillCounts; // dipakai ulang oleh explore.js setelah filter dibuat

  function initFooterYear() {
    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    updateSavedCount();
    initBackToTop();
    fillCounts();
    initFooterYear();
  });

  window.addEventListener(BN.storage.BOOKMARK_EVENT, updateSavedCount);
})(window.BookNest);
