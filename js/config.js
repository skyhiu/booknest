/*
 * BookNest — konfigurasi
 * ------------------------------------------------------------
 * googleBooksApiKey: API key Google Books (opsional).
 *
 * BACA SEBELUM MENGISI
 * - Key ini AKAN terlihat publik. Semua kode website statis bisa dibaca
 *   siapa pun lewat browser, jadi key ini memang tidak bisa disembunyikan.
 * - Keamanannya berasal dari PEMBATASAN di Google Cloud Console:
 *     1. Application restrictions → Websites → hanya alamat website BookNest
 *        (contoh: https://USERNAME.github.io/*).
 *     2. API restrictions → Restrict key → hanya "Books API".
 *   Dengan pembatasan itu, key tidak bisa dipakai dari website lain
 *   atau untuk layanan Google lain.
 * - JANGAN isi file ini dengan key yang belum dibatasi, key untuk layanan
 *   berbayar, password, token, atau kredensial apa pun.
 * - Biarkan kosong ("") untuk memakai Google Books tanpa key.
 *   Website tetap berfungsi dengan data kurasi lokal jika Google Books gagal.
 */
window.BOOKNEST_CONFIG = {
  googleBooksApiKey: "",
};
