/*
 * BookNest — halaman Explore (explore.html)
 * ------------------------------------------------------------
 * Dua lapis katalog:
 * 1. Koleksi kurasi (25 buku) → search, filter, dan sorting LOKAL.
 *    Mengganti filter tidak memicu request jaringan sama sekali.
 * 2. Hasil tambahan dari API → hanya saat kata kunci ≥ 3 huruf,
 *    dengan debounce 600 ms dan pembatalan request lama.
 * Metadata Google Books tidak diambil massal; hanya per buku saat
 * detail dibuka atau sampul Open Library tidak tersedia.
 */
window.BookNest = window.BookNest || {};

(function (BN) {
  "use strict";

  const { el } = BN.dom;
  const DEFAULT_STATE = { query: "", category: "all", level: "all", sort: "recommended" };
  const SORT_OPTIONS = ["recommended", "title", "newest"];
  const API_MIN_LENGTH = 3;
  const API_DEBOUNCE_MS = 600;
  const LOCAL_DEBOUNCE_MS = 150;
  const SUGGESTIONS = ["misteri", "fantasi", "sains", "kebiasaan"];

  const state = { ...DEFAULT_STATE };
  const els = {};
  const cardCache = new Map(); // kartu dibuat sekali, lalu dipakai ulang saat filter berubah
  const api = { controller: null, timer: null, results: new Map() };
  let localTimer = null;

  /* ---------------- Helper ---------------- */

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function debounce(timerName, fn, delay) {
    clearTimeout(timerName === "local" ? localTimer : api.timer);
    const id = setTimeout(fn, delay);
    if (timerName === "local") localTimer = id;
    else api.timer = id;
  }

  function isDefaultState() {
    return Object.keys(DEFAULT_STATE).every((key) => state[key] === DEFAULT_STATE[key]);
  }

  /* ---------------- URL ---------------- */

  function readStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const categoryIds = BN.books.categories.map((c) => c.id);
    const levelIds = BN.books.levels.map((l) => l.id);

    const category = params.get("category");
    const level = params.get("level");
    const sort = params.get("sort");
    if (category && categoryIds.includes(category)) state.category = category;
    if (level && levelIds.includes(level)) state.level = level;
    if (sort && SORT_OPTIONS.includes(sort)) state.sort = sort;
    state.query = (params.get("q") || "").slice(0, 100);
    return params.get("book");
  }

  /** Menyimpan filter di URL agar bisa dibagikan atau di-bookmark browser. */
  function writeStateToUrl(openBookId) {
    const params = new URLSearchParams();
    if (state.query.trim()) params.set("q", state.query.trim());
    if (state.category !== "all") params.set("category", state.category);
    if (state.level !== "all") params.set("level", state.level);
    if (state.sort !== "recommended") params.set("sort", state.sort);
    if (openBookId) params.set("book", openBookId);
    const query = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (query ? "?" + query : "") + window.location.hash);
  }

  /* ---------------- Kontrol filter ---------------- */

  function buildCategoryFilter() {
    const options = [{ id: "all", label: "Semua" }, ...BN.books.categories];
    const chips = options.map((option) => {
      const input = el("input", {
        className: "chip__input",
        attrs: { type: "radio", name: "category", value: option.id, id: `category-${option.id}` },
      });
      input.checked = state.category === option.id;
      input.addEventListener("change", () => {
        state.category = option.id;
        update();
      });
      return el("div", { className: "chip" }, [
        input,
        el("label", { className: "chip__label", attrs: { for: `category-${option.id}` } }, [
          option.label,
          el("span", { className: "chip__count", attrs: { "data-count-category": option.id } }),
        ]),
      ]);
    });
    els.categoryGroup.replaceChildren(...chips);
  }

  function buildLevelFilter() {
    const options = [el("option", { attrs: { value: "all" }, text: "Semua tingkat" })];
    BN.books.levels.forEach((level) => options.push(el("option", { attrs: { value: level.id }, text: level.label })));
    els.level.replaceChildren(...options);
  }

  function syncControls() {
    els.search.value = state.query;
    els.level.value = state.level;
    els.sort.value = state.sort;
    document.querySelectorAll('input[name="category"]').forEach((input) => {
      input.checked = input.value === state.category;
    });
  }

  /* ---------------- Filter & sorting lokal ---------------- */

  function getFilteredBooks() {
    const words = normalize(state.query.trim()).split(/\s+/).filter(Boolean);

    const list = BN.books.curated.filter((book) => {
      if (state.category !== "all" && book.category !== state.category) return false;
      if (state.level !== "all" && book.level !== state.level) return false;
      if (!words.length) return true;
      const haystack = normalize([book.title, ...book.authors, book.genre].join(" "));
      return words.every((word) => haystack.includes(word));
    });

    const originalIndex = new Map(BN.books.curated.map((b, i) => [b.id, i]));
    const byOriginal = (a, b) => originalIndex.get(a.id) - originalIndex.get(b.id);

    if (state.sort === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title, "id", { sensitivity: "base", numeric: true }));
    } else if (state.sort === "newest") {
      list.sort((a, b) => b.firstPublished - a.firstPublished || byOriginal(a, b));
    } else {
      // "Rekomendasi": Pilihan Editor lebih dulu, lalu urutan kurasi.
      list.sort((a, b) => Number(Boolean(b.editorPick)) - Number(Boolean(a.editorPick)) || byOriginal(a, b));
    }
    return list;
  }

  function getCard(book) {
    if (!cardCache.has(book.id)) cardCache.set(book.id, BN.books.createBookCard(book, { headingLevel: 3 }));
    return cardCache.get(book.id);
  }

  function describeFilters() {
    const parts = [];
    if (state.category !== "all") parts.push(BN.books.getCategory(state.category).label);
    if (state.level !== "all") parts.push(BN.books.getLevel(state.level).label);
    if (state.query.trim()) parts.push(`kata kunci “${state.query.trim()}”`);
    return parts.join(", ");
  }

  function renderResults() {
    const books = getFilteredBooks();
    const total = BN.books.curated.length;
    const filters = describeFilters();

    els.grid.replaceChildren(...books.map(getCard));
    els.grid.hidden = books.length === 0;
    els.empty.hidden = books.length !== 0;
    els.reset.disabled = isDefaultState();

    els.count.textContent =
      books.length === total
        ? `Menampilkan semua ${total} buku kurasi.`
        : `Menampilkan ${books.length} dari ${total} buku kurasi${filters ? " untuk " + filters : ""}.`;

    if (!books.length) renderEmptyState();
  }

  function renderEmptyState() {
    const query = state.query.trim();
    els.emptyText.textContent = query
      ? `Tidak ada buku kurasi yang cocok dengan “${query}” pada filter ini. Coba kata kunci lain, longgarkan filter, atau lihat hasil online di bawah.`
      : "Tidak ada buku kurasi dengan kombinasi kategori dan tingkat ini. Coba pilih tingkat atau kategori lain.";

    const buttons = SUGGESTIONS.map((word) => {
      const button = el("button", { className: "chip-button", attrs: { type: "button" }, text: word });
      button.addEventListener("click", () => {
        state.query = word;
        state.category = "all";
        state.level = "all";
        syncControls();
        update();
        els.search.focus();
      });
      return button;
    });
    els.suggestions.replaceChildren(...buttons);
  }

  /* ---------------- Pencarian API ---------------- */

  function setApiBody(...nodes) {
    els.apiBody.replaceChildren(...nodes);
  }

  function renderApiLoading(query) {
    els.apiSection.setAttribute("aria-busy", "true");
    els.apiSource.textContent = `Mencari “${query}” di Google Books…`;
    const skeletons = Array.from({ length: 4 }, () =>
      el("div", { className: "skeleton-card", attrs: { "aria-hidden": "true" } }, [
        el("div", { className: "skeleton skeleton--cover" }),
        el("div", { className: "skeleton skeleton--line" }),
        el("div", { className: "skeleton skeleton--line skeleton--short" }),
      ])
    );
    setApiBody(el("div", { className: "book-grid" }, skeletons));
  }

  function renderApiResults(query, result) {
    els.apiSection.removeAttribute("aria-busy");
    const sourceName = result.source === "google" ? "Google Books" : "Open Library";
    els.apiTitle.textContent = `Hasil tambahan dari ${sourceName}`;
    els.apiSource.textContent =
      result.source === "google"
        ? `${result.books.length} hasil teratas untuk “${query}”. Urutan berasal dari relevansi Google Books, bukan tingkat popularitas.`
        : `${result.books.length} hasil dari Open Library untuk “${query}” (cadangan: ${result.fallbackReason})`;

    if (!result.books.length) {
      setApiBody(
        el("div", { className: "state-panel" }, [
          BN.icon("search", { className: "state-panel__icon" }),
          el("h3", { className: "state-panel__title", text: "Tidak ada hasil online" }),
          el("p", { text: `Google Books dan Open Library tidak menemukan buku untuk “${query}”. Periksa ejaan atau coba judul aslinya dalam bahasa Inggris.` }),
        ])
      );
      return;
    }

    BN.books.registerExternalBooks(result.books);
    setApiBody(el("div", { className: "book-grid" }, result.books.map((book) => BN.books.createBookCard(book, { headingLevel: 3 }))));
  }

  function renderApiError(query, error) {
    els.apiSection.removeAttribute("aria-busy");
    els.apiSource.textContent = "";
    const retry = el("button", { className: "btn btn--primary", attrs: { type: "button" } }, [BN.icon("refresh"), "Coba lagi"]);
    retry.addEventListener("click", () => runApiSearch(query, true));
    setApiBody(
      el("div", { className: "state-panel state-panel--error", attrs: { role: "alert" } }, [
        BN.icon("alert", { className: "state-panel__icon" }),
        el("h3", { className: "state-panel__title", text: "Pencarian online gagal" }),
        el("p", { text: `${error.message} Koleksi kurasi di atas tetap bisa dipakai.` }),
        retry,
      ])
    );
  }

  async function runApiSearch(query, force) {
    const key = normalize(query);
    if (!force && api.results.has(key)) {
      renderApiResults(query, api.results.get(key));
      return;
    }

    if (api.controller) api.controller.abort(); // batalkan pencarian sebelumnya
    const controller = new AbortController();
    api.controller = controller;
    renderApiLoading(query);

    try {
      const result = await BN.api.searchBooks(query, controller.signal);
      api.results.set(key, result);
      if (controller === api.controller) renderApiResults(query, result);
    } catch (error) {
      if (BN.api.isAbortError(error)) return;
      if (controller === api.controller) renderApiError(query, error);
    }
  }

  function scheduleApiSearch() {
    const query = state.query.trim();
    clearTimeout(api.timer);

    if (query.length < API_MIN_LENGTH) {
      if (api.controller) api.controller.abort();
      api.controller = null;
      els.apiSection.hidden = true;
      return;
    }
    els.apiSection.hidden = false;
    els.apiTitle.textContent = "Hasil tambahan dari Google Books";
    debounce("api", () => runApiSearch(query, false), API_DEBOUNCE_MS);
  }

  /* ---------------- Status Google Books ---------------- */

  function formatTime(ms) {
    return new Date(ms).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  /**
   * Pemberitahuan saat Google Books tidak tersedia.
   * reason: "quota" (HTTP 429), "key" (API key ditolak), "network" (tidak terhubung).
   */
  function showGoogleNotice(info) {
    const titles = {
      quota: "Kuota Google Books sedang habis",
      key: "Google Books menolak API key website ini",
      network: "Google Books tidak dapat dihubungi",
    };
    const keyHint = info.reason === "key"
      ? "Pemilik website perlu memeriksa pembatasan API key di Google Cloud Console. "
      : "";
    const retryHint = info.until ? ` BookNest mencoba lagi otomatis setelah pukul ${formatTime(info.until)}.` : "";

    els.syncErrorTitle.textContent = titles[info.reason] || titles.network;
    els.syncErrorText.textContent =
      keyHint +
      "Deskripsi dan data edisi dari Google Books belum tersedia, tetapi katalog, ringkasan, dan alasan rekomendasi tetap tampil dari kurasi BookNest. Pencarian online memakai Open Library." +
      retryHint;
    els.syncError.hidden = false;
  }

  /** "Coba lagi sekarang": hapus jeda, lalu uji dengan SATU request saja. */
  async function retryGoogle() {
    BN.storage.clearGoogleCooldown();
    els.syncError.hidden = true;
    els.syncRetry.disabled = true;

    const probe = BN.books.curated.find(
      (book) => !BN.books.getMetadata(book.id) && BN.storage.getCachedMetadata(book.id) === undefined
    );
    try {
      if (probe) await BN.books.requestMetadata(probe, true);
      BN.announce("Google Books dapat dihubungi kembali.");
    } catch (error) {
      // Kuota/key: pemberitahuan sudah muncul lewat event. Selain itu tampilkan di sini.
      if (!BN.storage.getGoogleCooldown()) showGoogleNotice({ reason: "network" });
    } finally {
      els.syncRetry.disabled = false;
    }
  }

  /* ---------------- Rak simpanan ---------------- */

  function renderSavedShelf() {
    const saved = BN.storage.getBookmarks();
    els.savedCount.textContent = String(saved.length);

    if (!saved.length) {
      els.savedList.replaceChildren();
      els.savedEmpty.hidden = false;
      return;
    }
    els.savedEmpty.hidden = true;

    const items = saved.map((snapshot) => {
      const book = BN.books.getBook(snapshot.id) || snapshot;
      const detail = el("button", { className: "btn btn--quiet btn--small", attrs: { type: "button" } }, [
        "Detail",
        BN.dom.srOnly(` buku ${book.title}`),
      ]);
      detail.addEventListener("click", () => BN.books.openBookDetail(book.id, detail));

      const remove = el("button", { className: "btn btn--quiet btn--small", attrs: { type: "button" } }, [
        "Hapus",
        BN.dom.srOnly(` ${book.title} dari simpanan`),
      ]);
      remove.addEventListener("click", () => {
        BN.storage.removeBookmark(book.id);
        BN.announce(`“${book.title}” dihapus dari Rak Simpanan.`);
        els.savedSummary.focus();
      });

      return el("li", { className: "saved-item" }, [
        BN.books.createCover(book, { decorative: true }),
        el("div", { className: "saved-item__text" }, [
          el("span", { className: "saved-item__title", text: book.title }),
          el("span", { className: "saved-item__author", text: BN.books.formatAuthors(book.authors) }),
        ]),
        el("div", { className: "saved-item__actions" }, [detail, remove]),
      ]);
    });
    els.savedList.replaceChildren(...items);
  }

  function openShelfFromHash() {
    if (window.location.hash === "#saved") {
      els.savedShelf.open = true;
      els.savedSummary.focus();
    }
  }

  /* ---------------- Alur utama ---------------- */

  function update() {
    renderResults();
    writeStateToUrl();
  }

  function resetFilters() {
    Object.assign(state, DEFAULT_STATE);
    syncControls();
    update();
    scheduleApiSearch();
    els.search.focus();
    BN.announce("Filter dikembalikan ke kondisi awal.");
  }

  function bindEvents() {
    els.search.addEventListener("input", () => {
      state.query = els.search.value.slice(0, 100);
      debounce("local", update, LOCAL_DEBOUNCE_MS);
      scheduleApiSearch();
    });
    // Tombol Enter tidak memuat ulang halaman; langsung jalankan pencarian.
    els.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      update();
      const query = state.query.trim();
      if (query.length >= API_MIN_LENGTH) {
        clearTimeout(api.timer);
        els.apiSection.hidden = false;
        runApiSearch(query, false);
      }
    });
    els.level.addEventListener("change", () => {
      state.level = els.level.value;
      update();
    });
    els.sort.addEventListener("change", () => {
      state.sort = els.sort.value;
      update();
    });
    els.reset.addEventListener("click", resetFilters);
    els.emptyReset.addEventListener("click", resetFilters);
    els.syncRetry.addEventListener("click", retryGoogle);
    window.addEventListener(BN.api.GOOGLE_EVENT, (event) => showGoogleNotice(event.detail));

    window.addEventListener(BN.storage.BOOKMARK_EVENT, renderSavedShelf);
    window.addEventListener("hashchange", openShelfFromHash);
    window.addEventListener("booknest:detail-opened", (event) => writeStateToUrl(event.detail.id));
    window.addEventListener("booknest:detail-closed", () => writeStateToUrl());
  }

  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("book-grid");
    if (!grid) return; // bukan halaman Explore

    Object.assign(els, {
      grid,
      searchForm: document.getElementById("search-form"),
      search: document.getElementById("search-input"),
      categoryGroup: document.getElementById("category-options"),
      level: document.getElementById("level-select"),
      sort: document.getElementById("sort-select"),
      reset: document.getElementById("reset-filters"),
      count: document.getElementById("result-count"),
      empty: document.getElementById("empty-state"),
      emptyText: document.getElementById("empty-text"),
      emptyReset: document.getElementById("empty-reset"),
      suggestions: document.getElementById("empty-suggestions"),
      apiSection: document.getElementById("api-results"),
      apiTitle: document.getElementById("api-results-title"),
      apiSource: document.getElementById("api-results-source"),
      apiBody: document.getElementById("api-results-body"),
      syncError: document.getElementById("sync-error"),
      syncErrorTitle: document.getElementById("sync-error-title"),
      syncErrorText: document.getElementById("sync-error-text"),
      syncRetry: document.getElementById("sync-retry"),
      savedShelf: document.getElementById("saved"),
      savedSummary: document.getElementById("saved-summary"),
      savedCount: document.getElementById("saved-shelf-count"),
      savedList: document.getElementById("saved-list"),
      savedEmpty: document.getElementById("saved-empty"),
    });

    const bookFromUrl = readStateFromUrl();
    buildCategoryFilter();
    buildLevelFilter();
    BN.fillCounts();
    syncControls();
    bindEvents();
    renderResults();
    renderSavedShelf();
    openShelfFromHash();
    scheduleApiSearch();

    const googleStatus = BN.api.getGoogleStatus();
    if (googleStatus.cooldown) showGoogleNotice(googleStatus.cooldown);

    if (bookFromUrl && !BN.books.openBookDetail(bookFromUrl)) writeStateToUrl();
  });
})(window.BookNest);
