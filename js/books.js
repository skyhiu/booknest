/*
 * BookNest — komponen tampilan buku
 * ------------------------------------------------------------
 * Dipakai bersama oleh Home dan Explore:
 * - createCover          : sampul + fallback berlapis
 * - createBookCard       : kartu buku untuk grid
 * - createBookmarkButton : tombol simpan (localStorage)
 * - openBookDetail       : modal "Quick View" berbasis <dialog>
 *
 * Keamanan: semua teks (terutama dari API) dimasukkan dengan
 * textContent / node teks, tidak pernah lewat innerHTML.
 */
window.BookNest = window.BookNest || {};

(function (BN) {
  "use strict";

  const DATA = window.BOOKNEST_DATA;
  const categoriesById = new Map(DATA.categories.map((c) => [c.id, c]));
  const levelsById = new Map(DATA.levels.map((l) => [l.id, l]));
  const curatedBooks = DATA.books.map((book) => ({ ...book, source: "curated" }));
  const curatedById = new Map(curatedBooks.map((b) => [b.id, b]));

  const metadataById = new Map(); // metadata Google Books untuk buku kurasi
  const metadataStatus = new Map(); // "loading" | "error" untuk modal
  const externalById = new Map(); // hasil pencarian API (belum dikurasi)

  /* ---------------- Helper DOM ---------------- */

  /** Membuat elemen dengan aman. `text` selalu dimasukkan sebagai teks biasa. */
  function el(tag, options = {}, children = []) {
    const node = document.createElement(tag);
    if (options.className) node.className = options.className;
    if (options.text !== undefined && options.text !== null) node.textContent = options.text;
    if (options.attrs) {
      Object.entries(options.attrs).forEach(([key, value]) => {
        if (value === null || value === undefined || value === false) return;
        node.setAttribute(key, value === true ? "" : String(value));
      });
    }
    children.forEach((child) => {
      if (child !== null && child !== undefined && child !== false) node.append(child);
    });
    return node;
  }

  function srOnly(text) {
    return el("span", { className: "sr-only", text });
  }

  /** Pesan singkat untuk pengguna (terlihat + dibacakan pembaca layar). */
  let toastTimer = null;
  function announce(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = el("div", { className: "toast", attrs: { id: "toast", role: "status", "aria-live": "polite" } });
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  /* ---------------- Helper data ---------------- */

  function formatAuthors(authors) {
    const list = Array.isArray(authors) ? authors.filter(Boolean) : [];
    if (!list.length) return "Penulis tidak diketahui";
    if (list.length === 1) return list[0];
    return list.slice(0, -1).join(", ") + " dan " + list[list.length - 1];
  }

  function truncate(text, maxLength) {
    if (typeof text !== "string") return "";
    if (text.length <= maxLength) return text;
    const cut = text.slice(0, maxLength);
    return cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : maxLength).trim() + "…";
  }

  function getCategory(id) {
    return categoriesById.get(id) || null;
  }

  function getLevel(id) {
    return levelsById.get(id) || null;
  }

  /** Mencari buku dari kurasi, hasil API, atau snapshot bookmark. */
  function getBook(id) {
    if (curatedById.has(id)) return curatedById.get(id);
    if (externalById.has(id)) return externalById.get(id);
    const saved = BN.storage.getBookmarks().find((item) => item.id === id);
    if (saved) return { description: "", categories: [], ...saved };
    return null;
  }

  function registerExternalBooks(books) {
    books.forEach((book) => externalById.set(book.id, book));
  }

  function getMetadata(id) {
    return metadataById.get(id) || null;
  }

  /** Dipanggil saat metadata API tiba: perbarui sampul fallback & modal. */
  function setMetadata(id, meta) {
    if (!meta) return;
    metadataById.set(id, meta);
    metadataStatus.delete(id);
    refreshFallbackCovers(id);
    if (modal.currentId === id) {
      renderEdition(getBook(id));
      renderDescription(getBook(id));
    }
  }

  /* ---------------- Sampul ---------------- */

  /**
   * Urutan sumber sampul:
   * 1. Open Library Covers API (berdasarkan ISBN kurasi)
   * 2. Thumbnail Google Books (jika metadata sudah dimuat)
   * 3. Sampul pengganti buatan lokal
   */
  function getCoverSources(book, size) {
    const sources = [];
    if (book.source === "curated") {
      sources.push(BN.api.openLibraryCoverByIsbn(book.isbn, size));
      const meta = metadataById.get(book.id);
      if (meta) sources.push(BN.api.toHttps(meta.cover));
    } else {
      let cover = BN.api.toHttps(book.cover);
      if (cover && size === "L" && book.source === "openlibrary") cover = cover.replace("-M.jpg", "-L.jpg");
      sources.push(cover);
    }
    return sources.filter(Boolean);
  }

  function createFallbackCover(book, decorative) {
    const category = book.category || "external";
    return el(
      "div",
      {
        className: `cover-fallback cover-fallback--${category}`,
        attrs: decorative
          ? { "aria-hidden": "true" }
          : { role: "img", "aria-label": `Sampul pengganti untuk ${book.title}` },
      },
      [
        BN.icon("book-open", { className: "cover-fallback__icon" }),
        el("span", { className: "cover-fallback__title", text: truncate(book.title, 60) }),
        el("span", { className: "cover-fallback__author", text: formatAuthors(book.authors) }),
      ]
    );
  }

  function createCover(book, { size = "M", decorative = false } = {}) {
    const frame = el("div", { className: `cover cover--${size === "L" ? "large" : "medium"}` });
    frame.dataset.coverFor = book.id;
    frame.dataset.size = size;
    if (decorative) frame.dataset.decorative = "true";

    const sources = getCoverSources(book, size);
    let index = 0;

    function showNext() {
      // Metadata API bisa tiba saat gambar pertama masih dimuat:
      // cek ulang sumber baru sebelum menyerah ke sampul pengganti.
      if (index >= sources.length) {
        getCoverSources(book, size).forEach((url) => {
          if (!sources.includes(url)) sources.push(url);
        });
      }
      if (index >= sources.length) {
        frame.dataset.state = "fallback";
        frame.replaceChildren(createFallbackCover(book, decorative));
        return;
      }
      frame.dataset.state = "loading";
      const img = el("img", {
        attrs: {
          src: sources[index],
          alt: decorative ? "" : `Sampul buku ${book.title}`,
          loading: "lazy",
          decoding: "async",
          width: 200,
          height: 300,
        },
      });
      index += 1;
      img.addEventListener("error", showNext, { once: true });
      img.addEventListener(
        "load",
        () => {
          // Beberapa layanan mengirim gambar 1x1 piksel jika sampul tidak ada.
          if (img.naturalWidth < 10) showNext();
          else frame.dataset.state = "image";
        },
        { once: true }
      );
      frame.replaceChildren(img);
    }

    showNext();
    return frame;
  }

  /** Ganti sampul fallback dengan gambar jika sumber baru tersedia. */
  function refreshFallbackCovers(id) {
    const book = getBook(id);
    if (!book) return;
    document.querySelectorAll('.cover[data-state="fallback"]').forEach((frame) => {
      if (frame.dataset.coverFor !== id) return;
      const replacement = createCover(book, {
        size: frame.dataset.size,
        decorative: frame.dataset.decorative === "true",
      });
      frame.replaceWith(replacement);
    });
  }

  /* ---------------- Badge / label ---------------- */

  function createCategoryBadge(categoryId) {
    const category = getCategory(categoryId);
    return el("span", { className: `tag tag--${categoryId}`, text: category ? category.label : "Lainnya" });
  }

  function createLevelBadge(levelId) {
    const level = getLevel(levelId);
    if (!level) return el("span", { className: "tag tag--muted", text: "Tingkat belum dinilai" });
    return el("span", { className: "tag tag--level" }, [
      BN.levelIcon(level.bars),
      srOnly("Tingkat pembaca: "),
      level.label,
    ]);
  }

  function createSourceBadge(book) {
    const name = book.source === "openlibrary" ? "Open Library" : "Google Books";
    return el("span", { className: "tag tag--muted", text: `Dari ${name}, belum dikurasi` });
  }

  /* ---------------- Bookmark ---------------- */

  function syncBookmarkButton(button, saved) {
    button.setAttribute("aria-pressed", String(saved));
    button.classList.toggle("is-saved", saved);
    const iconSlot = button.querySelector(".icon");
    if (iconSlot) iconSlot.classList.toggle("icon--filled", saved);
    const label = button.querySelector(".btn-bookmark__label");
    if (label) label.textContent = saved ? "Tersimpan" : "Simpan";
  }

  /**
   * Tombol simpan memakai aria-pressed (toggle). Nama aksesibel tetap
   * "Simpan [judul]"; status tersimpan dibacakan sebagai "ditekan".
   */
  function createBookmarkButton(book, { showLabel = true } = {}) {
    const button = el("button", {
      className: "btn-bookmark" + (showLabel ? "" : " btn-bookmark--icon"),
      attrs: { type: "button", "aria-label": `Simpan ${book.title}` },
    });
    button.dataset.bookmarkId = book.id;
    button.append(BN.icon("bookmark"));
    if (showLabel) button.append(el("span", { className: "btn-bookmark__label", attrs: { "aria-hidden": "true" } }));

    button.addEventListener("click", () => {
      const result = BN.storage.toggleBookmark(book);
      if (!result.ok) {
        announce("Bookmark tidak bisa disimpan: penyimpanan browser tidak tersedia.");
        return;
      }
      announce(result.saved ? `“${book.title}” disimpan ke Rak Simpanan.` : `“${book.title}” dihapus dari Rak Simpanan.`);
    });

    syncBookmarkButton(button, BN.storage.isBookmarked(book.id));
    return button;
  }

  // Satu listener untuk menyinkronkan semua tombol bookmark di halaman.
  window.addEventListener(BN.storage.BOOKMARK_EVENT, () => {
    const savedIds = new Set(BN.storage.getBookmarks().map((item) => item.id));
    document.querySelectorAll("[data-bookmark-id]").forEach((button) => {
      syncBookmarkButton(button, savedIds.has(button.dataset.bookmarkId));
    });
  });

  /* ---------------- Kartu buku ---------------- */

  function createDetailButton(book, label) {
    const button = el("button", { className: "btn btn--quiet", attrs: { type: "button" } }, [
      label || "Lihat detail",
      srOnly(` buku ${book.title}`),
    ]);
    button.addEventListener("click", () => openBookDetail(book.id, button));
    return button;
  }

  function createBookCard(book, { headingLevel = 3 } = {}) {
    const isCurated = book.source === "curated";
    const headingId = `card-${book.id}-${Math.random().toString(36).slice(2, 7)}`;

    const tags = el(
      "div",
      { className: "tag-row" },
      isCurated ? [createCategoryBadge(book.category), createLevelBadge(book.level)] : [createSourceBadge(book)]
    );

    const summaryText = isCurated
      ? book.summary
      : truncate(book.description, 200) || "Sumber data tidak menyediakan deskripsi untuk buku ini.";

    const reason = isCurated
      ? el("p", { className: "book-card__reason" }, [el("strong", { text: "Kenapa buku ini? " }), book.reason])
      : null;

    const body = el("div", { className: "book-card__body" }, [
      tags,
      el(`h${headingLevel}`, { className: "book-card__title", text: book.title, attrs: { id: headingId } }),
      el("p", { className: "book-card__author", text: formatAuthors(book.authors) }),
      el("p", { className: "book-card__summary", text: summaryText }),
      reason,
      el("div", { className: "book-card__actions" }, [createDetailButton(book), createBookmarkButton(book, { showLabel: false })]),
    ]);

    const card = el("article", { className: "book-card", attrs: { "aria-labelledby": headingId } }, [
      createCover(book),
      body,
    ]);
    card.dataset.bookId = book.id;
    return card;
  }

  /* ---------------- Modal detail (Quick View) ---------------- */

  const modal = { dialog: null, content: null, edition: null, links: null, description: null, trigger: null, currentId: null };

  function ensureDialog() {
    if (modal.dialog) return modal.dialog;

    const closeButton = el("button", {
      className: "icon-btn modal__close",
      attrs: { type: "button", "aria-label": "Tutup detail buku" },
    }, [BN.icon("close")]);

    modal.content = el("div", { className: "modal__content" });
    // Tombol tutup berada di luar area gulir agar selalu terlihat.
    modal.dialog = el("dialog", { className: "modal", attrs: { "aria-labelledby": "modal-title" } }, [
      closeButton,
      el("div", { className: "modal__panel" }, [modal.content]),
    ]);

    closeButton.addEventListener("click", () => modal.dialog.close());

    // Klik di luar panel (pada backdrop) menutup modal.
    modal.dialog.addEventListener("click", (event) => {
      if (event.target === modal.dialog) modal.dialog.close();
    });

    modal.dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("has-modal");
      const closedId = modal.currentId;
      modal.currentId = null;
      if (modal.trigger && document.contains(modal.trigger)) modal.trigger.focus();
      window.dispatchEvent(new CustomEvent("booknest:detail-closed", { detail: { id: closedId } }));
    });

    document.body.append(modal.dialog);
    return modal.dialog;
  }

  function metaItem(label, value) {
    if (value === null || value === undefined || value === "") return null;
    return el("div", { className: "meta-list__item" }, [el("dt", { text: label }), el("dd", { text: String(value) })]);
  }

  /** Bagian deskripsi dari API: bisa loading, error, kosong, atau berisi teks. */
  function renderDescription(book) {
    const box = modal.description;
    if (!box || !book) return;
    box.replaceChildren();
    box.removeAttribute("aria-busy");

    const isCurated = book.source === "curated";
    const meta = isCurated ? metadataById.get(book.id) : book;
    const sourceName = book.source === "openlibrary" ? "Open Library" : "Google Books";
    box.append(el("h3", { className: "detail__heading", text: `Deskripsi dari ${sourceName}` }));

    if (isCurated && metadataStatus.get(book.id) === "loading") {
      box.setAttribute("aria-busy", "true");
      box.append(el("p", { className: "state-inline" }, [el("span", { className: "spinner", attrs: { "aria-hidden": "true" } }), "Mengambil deskripsi dari Google Books…"]));
      return;
    }

    if (isCurated && metadataStatus.get(book.id) === "error") {
      const retry = el("button", { className: "btn btn--quiet btn--small", attrs: { type: "button" } }, [BN.icon("refresh"), "Coba lagi"]);
      retry.addEventListener("click", () => loadMetadataForDetail(book, true));
      box.append(
        el("p", { className: "state-inline state-inline--error" }, [BN.icon("alert"), "Deskripsi belum bisa dimuat karena Google Books tidak dapat dihubungi."]),
        retry
      );
      return;
    }

    const description = meta && meta.description;
    if (!description) {
      box.append(el("p", { className: "muted", text: `${sourceName} tidak menyediakan deskripsi untuk buku ini.` }));
      return;
    }

    const LIMIT = 520;
    const paragraph = el("p", { className: "detail__description", text: truncate(description, LIMIT) });
    box.append(paragraph);

    if (description.length > LIMIT) {
      const toggle = el("button", { className: "link-button", attrs: { type: "button", "aria-expanded": "false" }, text: "Tampilkan deskripsi lengkap" });
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        paragraph.textContent = expanded ? truncate(description, LIMIT) : description;
        toggle.setAttribute("aria-expanded", String(!expanded));
        toggle.textContent = expanded ? "Tampilkan deskripsi lengkap" : "Ringkas deskripsi";
      });
      box.append(toggle);
    }
    box.append(el("p", { className: "source-note", text: `Teks dari ${sourceName}; bisa berbahasa Inggris dan merujuk ke edisi tertentu.` }));
  }

  /** Mengambil metadata satu buku hanya ketika detailnya dibuka (lazy). */
  async function loadMetadataForDetail(book, force) {
    if (book.source !== "curated" || metadataById.has(book.id)) return;
    const cached = BN.storage.getCachedMetadata(book.id);
    if (cached !== undefined && !force) {
      if (cached) setMetadata(book.id, cached);
      return;
    }
    if (metadataStatus.get(book.id) === "loading") return;

    metadataStatus.set(book.id, "loading");
    renderDescription(book);
    try {
      const meta = await BN.api.fetchCuratedMetadata(book);
      BN.storage.setCachedMetadata(book.id, meta);
      metadataStatus.delete(book.id);
      if (meta) setMetadata(book.id, meta);
      else if (modal.currentId === book.id) renderDescription(book);
    } catch (error) {
      metadataStatus.set(book.id, "error");
      if (modal.currentId === book.id) renderDescription(book);
    }
  }

  function createExternalLink(href, label) {
    if (!href) return null;
    return el("a", { className: "btn btn--quiet btn--small", attrs: { href, target: "_blank", rel: "noopener noreferrer" } }, [
      label,
      BN.icon("external"),
      srOnly(" (membuka tab baru)"),
    ]);
  }

  function getRelatedBooks(book, count) {
    if (book.source !== "curated") return [];
    const sameCategory = curatedBooks.filter((b) => b.category === book.category);
    const start = sameCategory.findIndex((b) => b.id === book.id);
    const ordered = sameCategory.slice(start + 1).concat(sameCategory.slice(0, start));
    return ordered.slice(0, count);
  }

  /** Data edisi & tautan dari API. Dipisah agar bisa diperbarui saat metadata tiba. */
  function renderEdition(book) {
    if (!modal.edition || !modal.links || !book) return;
    const isCurated = book.source === "curated";
    const meta = isCurated ? metadataById.get(book.id) : book;

    const apiMetaItems = meta
      ? [
          metaItem("Penerbit edisi", meta.publisher),
          metaItem(isCurated ? "Tanggal edisi" : "Tanggal terbit", meta.publishedDate),
          metaItem("Jumlah halaman", meta.pageCount),
        ].filter(Boolean)
      : [];
    modal.edition.replaceChildren(
      ...(apiMetaItems.length
        ? [
            el("p", { className: "meta-group__caption", text: isCurated ? "Data edisi dari Google Books" : "Data dari sumber" }),
            el("dl", { className: "meta-list" }, apiMetaItems),
          ]
        : [])
    );

    const googleLink = meta && meta.link && book.source !== "openlibrary" ? createExternalLink(meta.link, "Google Books") : null;
    const openLibraryLink = isCurated
      ? createExternalLink(`https://openlibrary.org/isbn/${book.isbn}`, "Open Library")
      : book.source === "openlibrary"
        ? createExternalLink(book.link, "Open Library")
        : null;
    modal.links.replaceChildren(...[googleLink, openLibraryLink].filter(Boolean));
  }

  function renderDetail(book) {
    const isCurated = book.source === "curated";

    const tags = el(
      "div",
      { className: "tag-row" },
      isCurated ? [createCategoryBadge(book.category), createLevelBadge(book.level)] : [createSourceBadge(book)]
    );

    // Data kurasi dan data API dipisahkan agar sumbernya jelas.
    const curatedMeta = isCurated
      ? el("dl", { className: "meta-list" }, [metaItem("Genre", book.genre), metaItem("Terbit pertama", book.firstPublished)])
      : null;

    modal.edition = el("div", { className: "meta-group" });
    modal.links = el("span", { className: "detail__links" });

    const header = el("div", { className: "detail__header" }, [
      el("div", { className: "detail__cover" }, [createCover(book, { size: "L" })]),
      el("div", { className: "detail__info" }, [
        tags,
        el("h2", { className: "detail__title", text: book.title, attrs: { id: "modal-title", tabindex: "-1" } }),
        el("p", { className: "detail__authors", text: formatAuthors(book.authors) }),
        curatedMeta,
        modal.edition,
        el("div", { className: "detail__actions" }, [createBookmarkButton(book), modal.links]),
      ]),
    ]);

    const sections = [];
    if (isCurated) {
      sections.push(
        el("section", { className: "detail__section" }, [
          el("h3", { className: "detail__heading", text: "Ringkasan BookNest" }),
          el("p", { text: book.summary }),
        ]),
        el("section", { className: "detail__section detail__reason" }, [
          el("h3", { className: "detail__heading", text: "Kenapa buku ini?" }),
          el("p", { text: book.reason }),
        ])
      );
      if (book.contentNote) {
        sections.push(
          el("aside", { className: "detail__note", attrs: { "aria-label": "Catatan untuk pembaca" } }, [
            BN.icon("info"),
            el("p", {}, [el("strong", { text: "Catatan untuk pembaca: " }), book.contentNote]),
          ])
        );
      }
    } else {
      sections.push(
        el("p", { className: "detail__note detail__note--plain" }, [
          BN.icon("info"),
          "Buku ini hasil pencarian API dan belum ditinjau editor BookNest, jadi belum ada alasan rekomendasi dan tingkat pembaca.",
        ])
      );
    }

    modal.description = el("section", { className: "detail__section" });
    sections.push(modal.description);

    const related = getRelatedBooks(book, 3);
    if (related.length) {
      const list = el("ul", { className: "related-list" });
      related.forEach((item) => {
        const button = el("button", { className: "related-item", attrs: { type: "button" } }, [
          createCover(item, { decorative: true }),
          el("span", { className: "related-item__text" }, [
            el("span", { className: "related-item__title", text: item.title }),
            el("span", { className: "related-item__author", text: formatAuthors(item.authors) }),
          ]),
        ]);
        button.addEventListener("click", () => openBookDetail(item.id));
        list.append(el("li", {}, [button]));
      });
      sections.push(
        el("section", { className: "detail__section" }, [
          el("h3", { className: "detail__heading", text: `Buku lain di ${getCategory(book.category).label}` }),
          list,
        ])
      );
    }

    modal.content.replaceChildren(header, ...sections);
    renderEdition(book);
    renderDescription(book);
  }

  /**
   * Membuka modal detail. `trigger` = elemen yang menerima fokus
   * kembali setelah modal ditutup.
   */
  function openBookDetail(bookOrId, trigger) {
    const book = typeof bookOrId === "string" ? getBook(bookOrId) : bookOrId;
    if (!book) return false;
    const dialog = ensureDialog();

    modal.currentId = book.id;
    renderDetail(book);

    if (!dialog.open) {
      modal.trigger = trigger || document.activeElement;
      document.documentElement.classList.add("has-modal");
      dialog.showModal();
    }
    const panel = dialog.querySelector(".modal__panel");
    if (panel) panel.scrollTop = 0;
    const title = document.getElementById("modal-title");
    if (title) title.focus();

    loadMetadataForDetail(book, false);
    window.dispatchEvent(new CustomEvent("booknest:detail-opened", { detail: { id: book.id } }));
    return true;
  }

  BN.dom = { el, srOnly };
  BN.announce = announce;
  BN.books = {
    categories: DATA.categories,
    levels: DATA.levels,
    curated: curatedBooks,
    getBook,
    getCategory,
    getLevel,
    getMetadata,
    setMetadata,
    registerExternalBooks,
    formatAuthors,
    truncate,
    createCover,
    createBookCard,
    createBookmarkButton,
    createCategoryBadge,
    createLevelBadge,
    createDetailButton,
    openBookDetail,
  };
})(window.BookNest);
