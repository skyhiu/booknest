/*
 * BookNest — penyimpanan lokal (localStorage)
 * ------------------------------------------------------------
 * 1. Bookmark: daftar buku yang disimpan pengguna. Bersifat lokal,
 *    hanya ada di browser & perangkat ini, tidak disinkronkan.
 * 2. Cache metadata Google Books: agar katalog tidak meminta data
 *    yang sama berulang kali (hemat kuota API, lebih cepat).
 *
 * Semua akses dibungkus try/catch karena localStorage bisa diblokir
 * (mode privat tertentu, kuota penuh, atau pengaturan browser).
 */
window.BookNest = window.BookNest || {};

(function (BN) {
  "use strict";

  const KEYS = {
    bookmarks: "booknest:bookmarks:v1",
    metadata: "booknest:metadata-cache:v1",
  };
  const METADATA_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari
  const BOOKMARK_EVENT = "booknest:bookmarks-changed";

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  /* ---------------- Bookmark ---------------- */

  // Memastikan data dari localStorage berbentuk benar sebelum dipakai.
  function isValidSnapshot(item) {
    return (
      item &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      Array.isArray(item.authors)
    );
  }

  function getBookmarks() {
    const list = readJson(KEYS.bookmarks, []);
    if (!Array.isArray(list)) return [];
    return list.filter(isValidSnapshot).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  }

  function isBookmarked(id) {
    return getBookmarks().some((item) => item.id === id);
  }

  // Simpan hanya data minimum agar bookmark tetap bisa ditampilkan
  // meski API sedang tidak tersedia.
  function toSnapshot(book) {
    return {
      id: book.id,
      title: book.title,
      authors: Array.isArray(book.authors) ? book.authors.slice(0, 4) : [],
      source: book.source || "curated",
      cover: typeof book.cover === "string" ? book.cover : null,
      link: typeof book.link === "string" ? book.link : null,
      savedAt: Date.now(),
    };
  }

  function notifyBookmarkChange(id, saved) {
    window.dispatchEvent(new CustomEvent(BOOKMARK_EVENT, { detail: { id, saved } }));
  }

  /** Menyimpan atau menghapus bookmark. Mengembalikan status baru (true = tersimpan). */
  function toggleBookmark(book) {
    const list = getBookmarks();
    const exists = list.some((item) => item.id === book.id);
    const next = exists ? list.filter((item) => item.id !== book.id) : [toSnapshot(book), ...list];
    const ok = writeJson(KEYS.bookmarks, next);
    if (!ok) return { saved: exists, ok: false };
    notifyBookmarkChange(book.id, !exists);
    return { saved: !exists, ok: true };
  }

  function removeBookmark(id) {
    const next = getBookmarks().filter((item) => item.id !== id);
    writeJson(KEYS.bookmarks, next);
    notifyBookmarkChange(id, false);
  }

  // Sinkron antar-tab: event "storage" muncul di tab lain yang terbuka.
  window.addEventListener("storage", (event) => {
    if (event.key === KEYS.bookmarks) notifyBookmarkChange(null, null);
  });

  /* ---------------- Cache metadata ---------------- */

  let metadataCache = null; // dibaca sekali, lalu disimpan di memori

  function loadMetadataCache() {
    if (!metadataCache) {
      const stored = readJson(KEYS.metadata, {});
      metadataCache = stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
    }
    return metadataCache;
  }

  /**
   * @returns {object|null|undefined}
   *   object    = metadata tersedia
   *   null      = sudah dicari, tetapi API tidak menemukan buku ini
   *   undefined = belum ada di cache / sudah kedaluwarsa
   */
  function getCachedMetadata(bookId) {
    const entry = loadMetadataCache()[bookId];
    if (!entry || typeof entry.savedAt !== "number") return undefined;
    if (Date.now() - entry.savedAt > METADATA_TTL_MS) return undefined;
    return entry.data === null || typeof entry.data === "object" ? entry.data : undefined;
  }

  function setCachedMetadata(bookId, data) {
    const cache = loadMetadataCache();
    cache[bookId] = { savedAt: Date.now(), data: data || null };
    writeJson(KEYS.metadata, cache);
  }

  BN.storage = {
    BOOKMARK_EVENT,
    getBookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    getCachedMetadata,
    setCachedMetadata,
  };
})(window.BookNest);
