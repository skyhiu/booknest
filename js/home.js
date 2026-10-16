/*
 * BookNest — halaman Home (index.html)
 * - Rak sampul di hero
 * - Book of the Day (berganti setiap hari, tetap sama sepanjang hari itu)
 * - Editor's Picks & Mulai Membaca
 * - Metadata Google Books untuk buku yang tampil (memakai cache)
 */
window.BookNest = window.BookNest || {};

(function (BN) {
  "use strict";

  const { el } = BN.dom;
  const HERO_SHELF_IDS = ["the-hobbit", "factfulness", "spy-x-family", "the-little-prince", "atomic-habits"];

  /** Indeks hari dalam setahun → pilihan buku yang konsisten per hari. */
  function getBookOfTheDay(today) {
    const start = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((today - start) / 86400000);
    const books = BN.books.curated;
    return books[dayOfYear % books.length];
  }

  /**
   * Mengambil buku bergiliran per kategori (round-robin) agar
   * Editor's Picks mewakili semua kategori, bukan hanya yang pertama.
   */
  function pickBalanced(books, count) {
    const groups = BN.books.categories.map((c) => books.filter((b) => b.category === c.id));
    const result = [];
    for (let round = 0; result.length < count && groups.some((g) => g.length > round); round += 1) {
      groups.forEach((group) => {
        if (group[round] && result.length < count) result.push(group[round]);
      });
    }
    return result;
  }

  function renderHeroShelf() {
    const shelf = document.getElementById("hero-shelf");
    if (!shelf) return;
    const covers = HERO_SHELF_IDS.map((id) => BN.books.getBook(id))
      .filter(Boolean)
      .map((book) => el("div", { className: "shelf__book" }, [BN.books.createCover(book, { decorative: true })]));
    shelf.replaceChildren(...covers);
  }

  function renderBookOfTheDay(book, today) {
    const container = document.getElementById("book-of-day");
    if (!container) return;

    const dateLabel = today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
    const category = BN.books.getCategory(book.category);

    container.classList.remove("botd--loading");
    container.replaceChildren(
      el("div", { className: "botd__cover" }, [BN.books.createCover(book, { size: "L" })]),
      el("div", { className: "botd__text" }, [
        el("p", { className: "botd__date", text: `Pilihan untuk ${dateLabel}` }),
        el("h3", { className: "botd__title", text: book.title }),
        el("p", { className: "botd__author", text: `${BN.books.formatAuthors(book.authors)}, ${category.label}` }),
        el("p", { className: "botd__reason", text: book.reason }),
        el("div", { className: "botd__actions" }, [
          BN.books.createDetailButton(book, "Baca detailnya"),
          BN.books.createBookmarkButton(book),
        ]),
      ])
    );
  }

  function renderGrid(containerId, books) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.replaceChildren(...books.map((book) => BN.books.createBookCard(book)));
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("book-of-day")) return; // bukan halaman Home

    const today = new Date();
    const bookOfDay = getBookOfTheDay(today);
    const picks = pickBalanced(BN.books.curated.filter((b) => b.editorPick && b.id !== bookOfDay.id), 6);
    const starters = BN.books.curated.filter((b) => b.starter && b.id !== bookOfDay.id).slice(0, 4);

    renderHeroShelf();
    renderBookOfTheDay(bookOfDay, today);
    renderGrid("editors-picks", picks);
    renderGrid("starter-books", starters);

    // Ambil metadata hanya untuk buku yang tampil di Home.
    const visibleIds = new Set([bookOfDay.id, ...picks.map((b) => b.id), ...starters.map((b) => b.id), ...HERO_SHELF_IDS]);
    const visibleBooks = BN.books.curated.filter((b) => visibleIds.has(b.id));
    BN.api.enrichCuratedBooks(visibleBooks, { onBook: BN.books.setMetadata }).catch(() => {
      /* Home tetap berfungsi dengan data kurasi lokal. */
    });
  });
})(window.BookNest);
