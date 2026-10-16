/*
 * BookNest — integrasi REST API
 * ------------------------------------------------------------
 * Sumber utama  : Google Books API (metadata & pencarian)
 *                 https://developers.google.com/books/docs/v1/using
 * Sumber cadangan: Open Library Search API & Covers API
 *                 https://openlibrary.org/developers/api
 *
 * Prinsip yang dipakai:
 * - Semua permintaan memakai fetch() + async/await dengan batas waktu.
 * - Setiap field dari API diperiksa dulu (bisa kosong / tidak ada).
 * - URL gambar dipaksa HTTPS; URL selain http/https ditolak.
 * - Teks deskripsi dibersihkan dari tag HTML sebelum ditampilkan.
 * - API key Google Books bersifat opsional dan diatur di js/config.js.
 *   Tanpa key, request memakai kuota bersama yang bisa cepat habis.
 * - Hemat kuota: metadata diambil hanya saat dibutuhkan (detail dibuka
 *   atau sampul Open Library tidak ada), lalu disimpan di cache.
 * - Setelah Google menolak (HTTP 429 / key ditolak), Google tidak
 *   dipanggil lagi selama 30 menit.
 */
window.BookNest = window.BookNest || {};

(function (BN) {
  "use strict";

  const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";
  const OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json";
  const OPEN_LIBRARY_COVERS_URL = "https://covers.openlibrary.org/b";
  const REQUEST_TIMEOUT_MS = 10000;
  const SEARCH_LIMIT = 12;
  const GOOGLE_COOLDOWN_MS = 30 * 60 * 1000; // 30 menit
  const GOOGLE_EVENT = "booknest:google-unavailable";

  const config = window.BOOKNEST_CONFIG || {};
  const GOOGLE_API_KEY =
    typeof config.googleBooksApiKey === "string" ? config.googleBooksApiKey.trim() : "";

  class ApiError extends Error {
    constructor(message, status, reason) {
      super(message);
      this.name = "ApiError";
      this.status = status || null; // kode HTTP, misalnya 429 (kuota habis)
      this.reason = reason || null; // "quota" | "key" | null
    }
  }

  function isAbortError(error) {
    return error && error.name === "AbortError";
  }

  /* ---------------- Google Books: key & jeda ---------------- */

  function googleUrl(params) {
    const query = new URLSearchParams(params);
    if (GOOGLE_API_KEY) query.set("key", GOOGLE_API_KEY);
    return `${GOOGLE_BOOKS_URL}?${query.toString()}`;
  }

  function cooldownError(cooldown) {
    const time = new Date(cooldown.until).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return cooldown.reason === "key"
      ? new ApiError(`Google Books menolak API key website ini. Dicoba lagi otomatis setelah pukul ${time}.`, 403, "key")
      : new ApiError(`Kuota Google Books sedang habis. Dicoba lagi otomatis setelah pukul ${time}.`, 429, "quota");
  }

  function notifyGoogleUnavailable(cooldown) {
    window.dispatchEvent(new CustomEvent(GOOGLE_EVENT, { detail: cooldown }));
  }

  /**
   * Semua request ke Google lewat fungsi ini:
   * - jika sedang dalam masa jeda, langsung gagal tanpa request;
   * - jika Google membalas 429, atau 400/403 saat memakai key, mulai jeda.
   */
  async function fetchGoogle(params, signal) {
    const cooldown = BN.storage.getGoogleCooldown();
    if (cooldown) throw cooldownError(cooldown);

    try {
      return await fetchJson(googleUrl(params), signal);
    } catch (error) {
      const keyRejected = GOOGLE_API_KEY && (error.status === 400 || error.status === 403);
      if (error.status === 429 || keyRejected) {
        const reason = error.status === 429 ? "quota" : "key";
        BN.storage.setGoogleCooldown(GOOGLE_COOLDOWN_MS, reason);
        const active = BN.storage.getGoogleCooldown() || { until: Date.now() + GOOGLE_COOLDOWN_MS, reason };
        notifyGoogleUnavailable(active);
        throw cooldownError(active);
      }
      throw error;
    }
  }

  function getGoogleStatus() {
    return { hasKey: Boolean(GOOGLE_API_KEY), cooldown: BN.storage.getGoogleCooldown() };
  }

  /**
   * fetch() + parsing JSON + batas waktu.
   * `signal` dari pemanggil dipakai untuk membatalkan permintaan lama
   * (misalnya saat pengguna mengetik kata kunci baru).
   */
  async function fetchJson(url, signal) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const forwardAbort = () => controller.abort();

    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener("abort", forwardAbort, { once: true });
    }

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        const message =
          response.status === 429
            ? "Batas kuota permintaan API tercapai (HTTP 429)."
            : `Server merespons dengan status HTTP ${response.status}.`;
        throw new ApiError(message, response.status);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new ApiError("Respons API bukan JSON yang valid.");
      }
      if (!data || typeof data !== "object") throw new ApiError("Data dari API tidak valid.");
      return data;
    } catch (error) {
      if (isAbortError(error)) {
        // Dibatalkan oleh pemanggil → teruskan apa adanya agar bisa diabaikan.
        if (signal && signal.aborted) throw error;
        throw new ApiError("Permintaan melebihi batas waktu. Periksa koneksi internet.");
      }
      if (error instanceof ApiError) throw error;
      // TypeError dari fetch = jaringan putus, DNS gagal, atau diblokir CORS.
      throw new ApiError("Tidak dapat terhubung ke server. Periksa koneksi internet.");
    } finally {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener("abort", forwardAbort);
    }
  }

  /* ---------------- Helper data ---------------- */

  /** Mengubah URL gambar menjadi HTTPS. URL tidak dikenal → null. */
  function toHttps(url) {
    if (typeof url !== "string") return null;
    const trimmed = url.trim();
    let secure = null;
    if (trimmed.startsWith("https://")) secure = trimmed;
    else if (trimmed.startsWith("http://")) secure = "https://" + trimmed.slice(7);
    if (!secure) return null;
    // Google Books menambahkan efek "lipatan halaman" lewat &edge=curl.
    return secure.replace("&edge=curl", "");
  }

  /**
   * Membersihkan deskripsi yang kadang berisi tag HTML (<b>, <br>, <p>).
   * DOMParser tidak menjalankan skrip; kita hanya mengambil teksnya.
   */
  function toPlainText(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    const doc = new DOMParser().parseFromString(value, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }

  function toStringArray(value, max) {
    if (!Array.isArray(value)) return [];
    return value.filter((item) => typeof item === "string" && item.trim()).slice(0, max || 10);
  }

  function toPositiveNumber(value) {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  /* ---------------- Normalisasi respons ---------------- */

  /** Mengubah satu item Google Books menjadi objek buku BookNest. */
  function normalizeGoogleVolume(item) {
    const info = item && item.volumeInfo;
    if (!info || typeof info.title !== "string" || !info.title.trim()) return null;

    const images = info.imageLinks && typeof info.imageLinks === "object" ? info.imageLinks : {};
    const title = info.subtitle && typeof info.subtitle === "string"
      ? `${info.title}: ${info.subtitle}`
      : info.title;

    return {
      id: "gb-" + String(item.id || title),
      source: "google",
      title: title.trim(),
      authors: toStringArray(info.authors, 6),
      description: toPlainText(info.description),
      categories: toStringArray(info.categories, 3),
      publishedDate: typeof info.publishedDate === "string" ? info.publishedDate : null,
      publisher: typeof info.publisher === "string" ? info.publisher : null,
      pageCount: toPositiveNumber(info.pageCount),
      cover: toHttps(images.thumbnail || images.smallThumbnail),
      link: toHttps(info.infoLink || info.canonicalVolumeLink),
    };
  }

  /** Mengubah satu dokumen Open Library menjadi objek buku BookNest. */
  function normalizeOpenLibraryDoc(doc) {
    if (!doc || typeof doc.title !== "string" || !doc.title.trim()) return null;
    const key = typeof doc.key === "string" && doc.key.startsWith("/") ? doc.key : null;
    const coverId = Number.isInteger(doc.cover_i) && doc.cover_i > 0 ? doc.cover_i : null;

    return {
      id: "ol-" + (key ? key.split("/").pop() : doc.title),
      source: "openlibrary",
      title: doc.title.trim(),
      authors: toStringArray(doc.author_name, 6),
      description: "", // Search API Open Library tidak menyertakan deskripsi
      categories: toStringArray(doc.subject, 3),
      publishedDate: Number.isInteger(doc.first_publish_year) ? String(doc.first_publish_year) : null,
      publisher: Array.isArray(doc.publisher) && typeof doc.publisher[0] === "string" ? doc.publisher[0] : null,
      pageCount: null,
      cover: coverId ? `${OPEN_LIBRARY_COVERS_URL}/id/${coverId}-M.jpg` : null,
      link: key ? "https://openlibrary.org" + key : null,
    };
  }

  /* ---------------- Pencarian ---------------- */

  async function searchGoogleBooks(query, signal) {
    const data = await fetchGoogle({ q: query, maxResults: String(SEARCH_LIMIT), printType: "books" }, signal);
    // Jika tidak ada hasil, Google Books tidak mengirim field "items".
    const items = Array.isArray(data.items) ? data.items : [];
    return items.map(normalizeGoogleVolume).filter(Boolean);
  }

  async function searchOpenLibrary(query, signal) {
    const fields = "key,title,author_name,first_publish_year,cover_i,subject,publisher";
    const url =
      `${OPEN_LIBRARY_SEARCH_URL}?q=${encodeURIComponent(query)}` +
      `&limit=${SEARCH_LIMIT}&fields=${fields}`;
    const data = await fetchJson(url, signal);
    const docs = Array.isArray(data.docs) ? data.docs : [];
    return docs.map(normalizeOpenLibraryDoc).filter(Boolean);
  }

  /**
   * Mencari buku: Google Books dulu, lalu Open Library jika Google gagal
   * atau tidak menemukan apa pun.
   * @returns {Promise<{source: string, books: object[], fallbackReason: string|null}>}
   */
  async function searchBooks(query, signal) {
    let googleError = null;
    try {
      const books = await searchGoogleBooks(query, signal);
      if (books.length) return { source: "google", books, fallbackReason: null };
    } catch (error) {
      if (isAbortError(error)) throw error;
      googleError = error;
    }

    try {
      const books = await searchOpenLibrary(query, signal);
      return {
        source: "openlibrary",
        books,
        fallbackReason: googleError ? googleError.message : "Google Books tidak menemukan hasil.",
      };
    } catch (error) {
      if (isAbortError(error)) throw error;
      throw new ApiError(
        "Google Books dan Open Library sama-sama tidak dapat dihubungi. " + error.message,
        (googleError && googleError.status) || error.status
      );
    }
  }

  /* ---------------- Metadata untuk buku kurasi ---------------- */

  function lastName(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/);
    return parts[parts.length - 1] || "";
  }

  /**
   * Mengambil metadata Google Books untuk satu buku kurasi.
   * Langkah 1: cari berdasarkan ISBN (paling tepat).
   * Langkah 2: jika tidak ditemukan, cari berdasarkan judul + nama belakang penulis.
   * @returns {Promise<object|null>} null jika buku tidak ditemukan
   */
  async function fetchCuratedMetadata(book, signal) {
    const queries = [];
    if (book.isbn) queries.push(`isbn:${book.isbn}`);
    queries.push(`intitle:"${book.title}" inauthor:${lastName(book.authors[0])}`);

    for (const query of queries) {
      const data = await fetchGoogle({ q: query, maxResults: "1", printType: "books" }, signal);
      const item = Array.isArray(data.items) ? data.items[0] : null;
      const volume = item ? normalizeGoogleVolume(item) : null;
      if (volume) {
        return {
          googleId: item.id || null,
          description: volume.description,
          publisher: volume.publisher,
          publishedDate: volume.publishedDate,
          pageCount: volume.pageCount,
          categories: volume.categories,
          cover: volume.cover,
          link: volume.link,
        };
      }
    }
    return null;
  }

  /** URL sampul Open Library berdasarkan ISBN. default=false → 404 jika tidak ada. */
  function openLibraryCoverByIsbn(isbn, size) {
    if (!/^\d{10}(\d{3})?$/.test(String(isbn || ""))) return null;
    return `${OPEN_LIBRARY_COVERS_URL}/isbn/${isbn}-${size || "M"}.jpg?default=false`;
  }

  BN.api = {
    ApiError,
    isAbortError,
    searchBooks,
    fetchCuratedMetadata,
    openLibraryCoverByIsbn,
    getGoogleStatus,
    GOOGLE_EVENT,
    toHttps, // diekspor untuk pengujian
  };
})(window.BookNest);
