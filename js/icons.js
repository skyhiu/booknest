/*
 * BookNest — ikon SVG
 * Ikon dibuat dengan DOM (bukan innerHTML) agar aman dan bisa dipakai ulang.
 * Setiap ikon bersifat dekoratif (aria-hidden); makna dijelaskan oleh teks
 * di sebelahnya atau oleh aria-label pada tombol.
 */
window.BookNest = window.BookNest || {};

(function (BN) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  // Setiap ikon = daftar path (atribut "d"). Garis 24x24, stroke 1.8.
  const PATHS = {
    search: ["M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z", "m16 16 5 5"],
    bookmark: ["M6.5 3.5h11v17l-5.5-4-5.5 4v-17Z"],
    "book-open": [
      "M12 6.5C10.3 5 7.8 4.5 4 4.5v13c3.8 0 6.3.5 8 2 1.7-1.5 4.2-2 8-2v-13c-3.8 0-6.3.5-8 2Z",
      "M12 6.5v13",
    ],
    close: ["M6 6l12 12", "M18 6 6 18"],
    "arrow-up": ["M12 19V5", "m6 11 6-6 6 6"],
    menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
    refresh: ["M20 11a8 8 0 1 0-2.3 5.6", "M20 4v7h-7"],
    external: ["M14 4h6v6", "M20 4l-9 9", "M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"],
    alert: ["M12 3 2.5 20h19L12 3Z", "M12 10v4", "M12 17.2v.1"],
    info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 11v5", "M12 7.8v.1"],
    check: ["m5 12.5 4.5 4.5L19 7.5"],
    reset: ["M4 4v6h6", "M4.5 15a8 8 0 1 0 1.7-8.3L4 10"],
  };

  /**
   * Membuat elemen <svg> ikon.
   * @param {string} name  nama ikon pada PATHS
   * @param {object} opts  { filled: boolean, className: string }
   */
  function icon(name, opts = {}) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("class", "icon" + (opts.className ? " " + opts.className : ""));

    (PATHS[name] || []).forEach((d) => {
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });

    if (opts.filled) svg.classList.add("icon--filled");
    return svg;
  }

  /**
   * Ikon tingkat pembaca: tiga batang seperti indikator sinyal.
   * Jumlah batang terisi = tingkat kesulitan (1–3), jadi makna
   * tidak hanya bergantung pada warna.
   */
  function levelIcon(filledBars) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 14 12");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("class", "level-icon");

    [0, 1, 2].forEach((i) => {
      const rect = document.createElementNS(SVG_NS, "rect");
      const height = 4 + i * 4;
      rect.setAttribute("x", String(i * 5));
      rect.setAttribute("y", String(12 - height));
      rect.setAttribute("width", "3.5");
      rect.setAttribute("height", String(height));
      rect.setAttribute("rx", "1");
      rect.setAttribute("class", i < filledBars ? "is-on" : "is-off");
      svg.appendChild(rect);
    });
    return svg;
  }

  BN.icon = icon;
  BN.levelIcon = levelIcon;
})(window.BookNest);
