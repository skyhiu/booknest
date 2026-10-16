# BookNest

**Rekomendasi buku hasil kurasi untuk pelajar, mahasiswa, dan pembaca pemula.**

**Website:** https://USERNAME.github.io/booknest/

BookNest membantu pembaca menemukan buku yang sesuai dengan minat, pengalaman membaca, dan tujuan belajar. Website ini berisi 25 buku pilihan dalam empat kategori:

- **Critical Thinking**
- **Fiction & Novels**
- **Comics & Manga**
- **Knowledge for Beginners**

Setiap buku dilengkapi ringkasan singkat, alasan rekomendasi (“Kenapa buku ini?”), dan label tingkat pembaca.

BookNest adalah proyek pembelajaran mata kuliah web design, dibuat dengan **HTML5, CSS3, dan JavaScript Vanilla** tanpa framework dan tanpa library pihak ketiga.

---

## Halaman

| Halaman | File | Isi |
|---|---|---|
| **Home** | `index.html` | Pengantar BookNest, Book of the Day, Editor's Picks, rak kategori, rekomendasi untuk pemula |
| **About** | `about.html` | Tujuan, target pengguna, cara memilih buku, arti label tingkat pembaca, sumber data |
| **Explore Books** | `explore.html` | Pencarian, filter, pengurutan, detail buku, dan Rak Simpanan |

## Fitur

- **Pencarian** judul, penulis, atau genre yang langsung menyaring katalog saat pengguna mengetik.
- **Filter** kategori dan tingkat pembaca (Beginner Friendly, Intermediate, Advanced), **pengurutan**, dan **Reset filter**.
- **Detail buku (Quick View)**: ringkasan, alasan rekomendasi, catatan untuk pembaca, deskripsi dari Google Books, data edisi, dan buku terkait.
- **Bookmark** yang tersimpan di browser dan ditampilkan di Rak Simpanan.
- **Pencarian online tambahan** dari Google Books, dengan Open Library sebagai cadangan.
- **Tetap berfungsi tanpa API**: katalog memakai data kurasi lokal, dan sampul yang tidak tersedia diganti dengan sampul pengganti.
- **Tautan yang bisa dibagikan**, misalnya `explore.html?category=comics&book=maus`.
- **Responsif dan aksesibel**: nyaman di ponsel hingga desktop, bisa dioperasikan dengan keyboard, dan menghormati pengaturan *reduce motion*.

## Teknologi

| Bagian | Yang digunakan |
|---|---|
| Struktur | HTML5 semantik |
| Tampilan | CSS3: custom properties, Grid, Flexbox, media query mobile-first |
| Interaksi | JavaScript ES6+: `fetch`, `async/await`, `AbortController`, `<dialog>`, `localStorage` |
| Data | [Google Books API](https://developers.google.com/books/docs/v1/using), [Open Library API](https://openlibrary.org/developers/api), [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers) |
| Hosting | GitHub Pages (website statis, tanpa backend) |

### Cara data diambil

- Katalog, ringkasan, dan alasan rekomendasi berasal dari data kurasi lokal (`data/books.js`), sehingga website tetap berjalan meskipun API tidak tersedia.
- Sampul diambil dari Open Library.
- Deskripsi dan data edisi diambil dari Google Books, **hanya untuk satu buku** saat detailnya dibuka, lalu disimpan sementara di browser.
- Jika kuota Google Books habis, website berhenti memanggil Google selama 30 menit dan pencarian online beralih ke Open Library.
- API key Google Books bersifat opsional dan diatur di `js/config.js`. Key tersebut dibatasi hanya untuk domain website ini dan hanya untuk Books API.

## Struktur folder

```
booknest/
├── index.html                 Halaman Home
├── about.html                 Halaman About
├── explore.html               Halaman Explore Books
├── DESIGN_DOCUMENTATION.md    Dokumentasi prinsip desain
├── assets/icons/favicon.svg
├── css/
│   ├── style.css              Token desain, komponen, layout mobile-first
│   └── responsive.css         Penyesuaian tablet, laptop, desktop
├── data/
│   └── books.js               25 buku kurasi
└── js/
    ├── config.js              Pengaturan API key Google Books (opsional)
    ├── icons.js               Ikon SVG
    ├── storage.js             Bookmark dan cache data
    ├── api.js                 Integrasi Google Books dan Open Library
    ├── books.js               Komponen kartu, sampul, bookmark, modal
    ├── main.js                Skrip bersama untuk semua halaman
    ├── home.js                Logika halaman Home
    └── explore.js             Logika halaman Explore
```

## Mencoba di komputer sendiri

Tidak perlu instalasi.

1. Klik tombol hijau **Code → Download ZIP**, lalu ekstrak.
2. Buka `index.html` di browser.

Fitur yang memakai API membutuhkan koneksi internet. Tanpa internet, katalog tetap bisa dijelajahi dengan data lokal.

## Pengujian

Website diuji di Chromium (Playwright) dengan respons API tiruan:

| Pengujian | Hasil |
|---|---|
| Fungsional: navigasi, pencarian, filter, modal, bookmark, keamanan teks | 59/59 lulus |
| Kondisi gagal: API error, kuota habis, jeda otomatis, offline, penyimpanan diblokir | 21/21 lulus |
| Konfigurasi API key | 9/9 lulus |
| Keyboard dan reduce motion | 8/8 lulus |
| Validasi HTML | Tanpa error |
| Audit aksesibilitas axe-core | 0 pelanggaran |

## Batasan

- Koleksi kurasi berisi 25 buku, dengan sebagian besar data edisi berbahasa Inggris.
- Deskripsi dari Google Books bisa tidak tersedia saat kuota layanan sedang habis. Ringkasan dan alasan rekomendasi BookNest tetap tampil.
- Bookmark hanya tersimpan di browser dan perangkat yang sedang dipakai.
- Book of the Day berganti setiap hari berdasarkan tanggal di perangkat pengunjung.

## Atribusi

- Metadata dan deskripsi buku berasal dari [Google Books](https://books.google.com/). Sampul dan pencarian cadangan berasal dari [Open Library](https://openlibrary.org/).
- Sampul dan deskripsi buku adalah milik penerbit dan pemegang hak masing-masing, dan tidak disimpan di repository ini.
- Ringkasan, alasan rekomendasi, kategori, dan tingkat pembaca ditulis oleh editor BookNest.
- Rekomendasi BookNest adalah **kurasi editorial**, bukan peringkat universal. Tidak ada rating, angka penjualan, atau statistik buatan.
