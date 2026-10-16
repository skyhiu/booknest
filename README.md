# BookNest

**Rekomendasi buku hasil kurasi untuk pelajar, mahasiswa, dan pembaca pemula.**

**Website:** https://USERNAME.github.io/booknest/ <!-- Ganti USERNAME dengan nama akun GitHub-mu setelah GitHub Pages aktif -->

BookNest membantu kamu menemukan bacaan yang sesuai dengan minat, pengalaman membaca, dan tujuan belajar. Website ini berisi 25 buku pilihan dalam empat kategori:

- **Critical Thinking**
- **Fiction & Novels**
- **Comics & Manga**
- **Knowledge for Beginners**

Setiap buku dilengkapi ringkasan singkat, alasan rekomendasi (“Kenapa buku ini?”), dan label tingkat pembaca.

Proyek ini dibuat sebagai proyek pembelajaran mata kuliah web design, menggunakan **HTML5, CSS3, dan JavaScript Vanilla**, tanpa framework dan tanpa library pihak ketiga.

---

## Halaman

| Halaman | File | Isi |
|---|---|---|
| **Home** | `index.html` | Pengantar BookNest, Book of the Day, Editor's Picks, rak kategori, rekomendasi untuk pemula |
| **About** | `about.html` | Tujuan, target pengguna, cara memilih buku, arti label tingkat pembaca, sumber data |
| **Explore Books** | `explore.html` | Pencarian, filter, pengurutan, detail buku, dan Rak Simpanan |

## Fitur

- **Pencarian** judul, penulis, atau genre yang langsung menyaring katalog saat kamu mengetik.
- **Filter** kategori dan tingkat pembaca (Beginner Friendly, Intermediate, Advanced), **pengurutan**, dan tombol **Reset filter**.
- **Detail buku (Quick View)**: ringkasan, alasan rekomendasi, catatan untuk pembaca, deskripsi dari Google Books, data edisi, dan buku terkait.
- **Bookmark** yang tersimpan di browser (`localStorage`) dan bisa dilihat di Rak Simpanan.
- **Pencarian online tambahan** dari Google Books, dengan Open Library sebagai cadangan.
- **Tetap berfungsi tanpa API**: katalog memakai data kurasi lokal, dan sampul yang tidak tersedia diganti dengan sampul pengganti.
- **Tautan yang bisa dibagikan**, misalnya `explore.html?category=comics&book=maus`.
- **Responsif dan aksesibel**: bisa dipakai di ponsel hingga desktop, dapat dioperasikan dengan keyboard, dan menghormati pengaturan *reduce motion*.

## Teknologi

| Bagian | Yang digunakan |
|---|---|
| Struktur | HTML5 semantik |
| Tampilan | CSS3: custom properties, Grid, Flexbox, media query mobile-first |
| Interaksi | JavaScript ES6+: `fetch`, `async/await`, `AbortController`, `<dialog>`, `localStorage` |
| Data | [Google Books API](https://developers.google.com/books/docs/v1/using), [Open Library API](https://openlibrary.org/developers/api), [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers) |
| Hosting | GitHub Pages (website statis, tanpa backend) |

Tidak ada API key di kode. BookNest hanya memakai endpoint publik.

## Struktur folder

```
booknest/
├── index.html                 Halaman Home
├── about.html                 Halaman About
├── explore.html               Halaman Explore Books
├── README.md                  Dokumen ini
├── assets/icons/favicon.svg
├── css/
│   ├── style.css              Token desain, komponen, layout mobile-first
│   └── responsive.css         Penyesuaian tablet, laptop, desktop
├── data/
│   └── books.js               25 buku kurasi (juga cadangan saat offline)
└── js/
    ├── icons.js               Ikon SVG
    ├── storage.js             Bookmark dan cache metadata
    ├── api.js                 Integrasi Google Books dan Open Library
    ├── books.js               Komponen kartu, sampul, bookmark, modal
    ├── main.js                Skrip bersama untuk semua halaman
    ├── home.js                Logika halaman Home
    └── explore.js             Logika halaman Explore
```

## Menjalankan di komputer sendiri

Tidak perlu instalasi dan tidak perlu terminal.

1. Unduh repository ini: klik tombol hijau **Code → Download ZIP**, lalu ekstrak. Bisa juga lewat **Code → Open with GitHub Desktop**.
2. Klik dua kali `index.html`.

Website akan terbuka di browser. Fitur API membutuhkan koneksi internet; tanpa internet, katalog tetap bisa dipakai dengan data lokal.

## Menambah buku

Tambahkan satu objek ke array `books` di `data/books.js`:

```js
{
  id: "judul-unik-pakai-tanda-hubung",
  title: "Judul Buku",
  authors: ["Nama Penulis"],
  category: "fiction",         // critical-thinking | fiction | comics | knowledge
  genre: "Misteri",
  level: "beginner",           // beginner | intermediate | advanced
  firstPublished: 2020,        // tahun terbit pertama karya
  isbn: "9780000000000",       // ISBN-13 salah satu edisi
  summary: "Ringkasan 1–2 kalimat, ditulis sendiri, tanpa spoiler.",
  reason: "Alasan spesifik kenapa buku ini direkomendasikan.",
  contentNote: "Opsional: peringatan konten atau catatan.",
  editorPick: false,           // opsional: tampil di Editor's Picks
  starter: false,              // opsional: tampil di Mulai Membaca
}
```

Simpan file. Jumlah buku di semua halaman akan diperbarui secara otomatis.

## Status pengujian

Sebelum dipublikasikan, website diuji di Chromium (Playwright) dengan **respons API tiruan**:

| Pengujian | Hasil |
|---|---|
| Uji fungsional (navigasi, pencarian, filter, modal, bookmark, keamanan teks) | 59/59 lulus |
| Uji kondisi gagal (API error, kuota habis, offline, penyimpanan diblokir) | 16/16 lulus |
| Uji keyboard dan reduce motion | 8/8 lulus |
| Validasi HTML | Tanpa error |
| Audit aksesibilitas axe-core | 0 pelanggaran |

Perilaku terhadap **API asli** baru bisa dipastikan setelah website online.

## Batasan

- Koleksi kurasi berisi 25 buku, dengan sebagian besar data edisi berbahasa Inggris.
- Google Books dipakai tanpa API key, sehingga bergantung pada kuota publik. Jika kuota habis, website otomatis memakai data lokal.
- Bookmark hanya tersimpan di browser dan perangkat yang sedang dipakai.
- Book of the Day berganti setiap hari berdasarkan tanggal di perangkat pengunjung.

## Atribusi

- Metadata dan deskripsi buku berasal dari [Google Books](https://books.google.com/). Sampul dan pencarian cadangan berasal dari [Open Library](https://openlibrary.org/).
- Sampul dan deskripsi buku adalah milik penerbit dan pemegang hak masing-masing, dan tidak disimpan di repository ini.
- Ringkasan, alasan rekomendasi, kategori, dan tingkat pembaca ditulis oleh editor BookNest.
- Rekomendasi BookNest adalah **kurasi editorial**, bukan peringkat universal. Tidak ada rating, angka penjualan, atau statistik buatan.
