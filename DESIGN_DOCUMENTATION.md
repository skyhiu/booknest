# Dokumentasi Desain BookNest

Dokumen ini menjelaskan identitas proyek, penerapan sembilan prinsip desain, alasan desain memudahkan pengguna, integrasi API, dan evaluasi desain. Setiap contoh di dalamnya merujuk ke halaman, komponen, dan file yang benar-benar ada di kode proyek.

---

## A. Identitas proyek

| Aspek | Keterangan |
|---|---|
| **Nama** | BookNest |
| **Tujuan** | Membantu pengguna menemukan buku yang sesuai dengan minat, pengalaman membaca, dan tujuan belajar mereka, lengkap dengan alasan pemilihan dan tingkat kesulitan. |
| **Target pengguna** | Pelajar dan mahasiswa, pembaca pemula, orang yang ingin melatih berpikir kritis, penggemar novel, komik, dan manga, serta siapa pun yang sedang mencari bacaan baru. |
| **Masalah yang diselesaikan** | Pembaca pemula sering kewalahan oleh banyaknya pilihan. Daftar “buku terbaik” jarang menjelaskan *kenapa* sebuah buku layak dibaca atau *seberapa sulit* buku itu. Akibatnya, orang memilih buku yang terlalu berat, lalu berhenti membaca. |
| **Solusi** | Koleksi kecil berisi 25 buku dalam 4 kategori. Setiap buku punya ringkasan, alasan “Kenapa buku ini?”, label tingkat pembaca, dan catatan konten bila perlu. Koleksi ini bisa dicari dan disaring tanpa memuat ulang halaman. |
| **Teknologi** | HTML5 semantik, CSS3 (custom properties, Grid, Flexbox, media query mobile-first), JavaScript Vanilla ES6+ (`fetch`, `async/await`, `AbortController`, `<dialog>`, `localStorage`), Google Books API, Open Library API, Git/GitHub, dan GitHub Pages/Netlify. |

### Identitas visual

| Token | Nilai | Peran |
|---|---|---|
| `--color-background` | `#f3f5f2` | Latar abu-hijau lembut, seperti kertas, tidak menyilaukan |
| `--color-text` | `#1b2a33` | Tinta biru-slate untuk teks utama |
| `--color-primary` | `#1e4a3f` | Hijau botol untuk tombol utama, navigasi aktif, dan rak |
| `--color-accent` | `#d9a441` | Kuning-kuningan seperti pita pembatas buku, dipakai hemat untuk bookmark dan Book of the Day |
| `--cat-*` | biru, hijau, merah anggur, cokelat | Warna “punggung buku” untuk setiap kategori |
| Tipografi | Literata + Atkinson Hyperlegible | Literata adalah serif yang dirancang untuk membaca layar panjang. Atkinson Hyperlegible dirancang agar huruf mudah dibedakan, cocok untuk UI dan pembaca dengan gangguan penglihatan. |

Tema visualnya adalah **rak buku**. Hero menampilkan sampul yang berdiri di atas rak, kategori di Home tampil sebagai punggung buku dengan tinggi berbeda-beda, dan sampul diberi bayangan seperti benda fisik. Bagian lain sengaja dibuat tenang agar tema ini menjadi satu-satunya elemen yang paling mencolok.

---

## B. Pemetaan prinsip desain

Kesembilan prinsip diterapkan di dalam kode. Nama class dan file dicantumkan agar penerapannya bisa diperiksa langsung.

| Prinsip | Halaman | Komponen / elemen | Cara penerapan | Manfaat bagi pengguna |
|---|---|---|---|---|
| **1. Komposisi** | Home | `.hero`, `#book-of-day`, `#editors-picks`, `.spines`, `.starter` | Urutan seksi dirancang sebagai alur: pengenalan dan ajakan (hero), satu rekomendasi menonjol (Book of the Day), enam pilihan editor, pilihan kategori, rekomendasi untuk pemula, lalu alasan memakai BookNest. Di kartu buku, sampul ada di kiri, sedangkan judul, penulis, ringkasan, alasan, dan tombol tersusun dari atas ke bawah sesuai prioritas. | Pengguna langsung tahu harus melihat apa lebih dulu dan apa langkah berikutnya. |
| **2. Ergonomi** | Explore (juga semua halaman) | `#search-form`, chip kategori (`.chip`), `#level-select`, `#sort-select`, `#reset-filters`, `.skip-link`, modal `<dialog>` | Pencarian dan filter berada di bagian atas Explore. Semua tombol dan chip berukuran minimal 44 × 44 px (`--tap-size`). Hasil tersaring langsung saat mengetik tanpa memuat ulang halaman. Chip kategori adalah radio button asli sehingga bisa dipilih dengan tombol panah. Detail buku dibuka di modal, bukan di halaman baru. Modal bisa ditutup dengan Esc, tombol ×, atau klik di luar panel, lalu fokus kembali ke tombol asalnya. | Lebih sedikit klik dan perpindahan halaman, nyaman di layar sentuh, dan bisa dipakai sepenuhnya dengan keyboard. |
| **3. Semiotik** | Semua halaman | Ikon kaca pembesar (pencarian), pita (bookmark), buku terbuka (Explore Books), panah atas, ikon peringatan dan info; label tingkat `.tag--level` dengan 1–3 batang (`BN.levelIcon`); warna punggung buku per kategori | Setiap ikon memakai simbol yang lazim dan selalu disertai teks atau `aria-label`. Tingkat pembaca ditunjukkan oleh jumlah batang **dan** teks (Beginner Friendly/Intermediate/Advanced), tidak hanya oleh warna. Warna kategori konsisten di tag, sampul pengganti, punggung buku di Home, dan penanda warna di About. | Fungsi kontrol dan karakter buku bisa dikenali sekilas, termasuk oleh pengguna buta warna dan pembaca layar. |
| **4. Kesederhanaan** | Explore, Home | `.book-card`, modal detail, 4 kategori, 3 tingkat | Kartu hanya memuat sampul, dua tag, judul, penulis, ringkasan tiga baris, alasan tiga baris, tombol detail, dan tombol simpan. Data lain seperti penerbit, halaman, deskripsi API, catatan, dan buku terkait dipindahkan ke modal. Hanya ada empat kategori dan tiga tingkat. Tidak ada login, rating buatan, atau tombol beli. | Informasi dasar cepat dipahami, dan detail tersedia hanya saat dibutuhkan. |
| **5. Fokus** | Home, Explore | Sampul buku (`.cover`), `.botd`, `#book-grid` | Sampul adalah satu-satunya elemen bergambar di katalog. Hero tidak memakai banner foto besar, melainkan rak berisi sampul buku asli. Di Explore, judul halaman langsung diikuti alat pencarian dan katalog. Rak Simpanan dilipat secara default (`<details>`) agar tidak mengalihkan perhatian dari katalog. | Perhatian pengguna tertuju pada buku dan proses menemukannya. |
| **6. Konsistensi** | Semua halaman | Header, footer, `.btn`, `.btn-bookmark`, `.tag`, `.book-card`; token di `:root` (`css/style.css`) | Header dan footer identik di ketiga halaman. Warna, jarak, radius, dan bayangan diambil dari CSS variables. Komponen kartu dan modal berasal dari satu file (`js/books.js`) sehingga tampil sama di Home dan Explore. Status hover, focus, dan disabled seragam di semua tombol. Istilah juga konsisten: tombol “Simpan” memunculkan pesan “disimpan ke Rak Simpanan”. | Pengguna tidak perlu mempelajari ulang pola interaksi saat berpindah halaman. |
| **7. Keseimbangan** | Home, About | `.hero__inner`, `.botd`, `.about-intro`, `.spines` | Hero membagi dua kolom: teks di kiri, rak sampul di kanan. Book of the Day menyeimbangkan sampul besar dengan teks. Di About, prosa pengantar diimbangi panel “Yang dilakukan / tidak dilakukan”. Empat punggung buku dengan tinggi berbeda menciptakan keseimbangan asimetris yang tetap teratur. | Halaman terasa stabil dan tidak berat sebelah, sehingga nyaman dipindai. |
| **8. Kontras** | Semua halaman | Judul serif besar (`--text-3xl`), `.btn--primary`, `.chip__input:checked`, `.book-card__reason` | Hierarki dibangun dari ukuran (judul halaman 34–56 px, teks isi 17 px), ketebalan, dan jenis huruf (serif untuk judul, sans untuk UI). Tombol utama berwarna hijau gelap dengan teks putih, sedangkan tombol sekunder berlatar putih dengan garis tepi. Chip terpilih menampilkan tanda centang dan huruf tebal selain perubahan warna. Audit axe-core tidak menemukan pelanggaran kontras WCAG AA. | Elemen penting cepat ditemukan dan teks mudah dibaca. |
| **9. Ruang kosong** | Home, Explore, About | Skala `--spacing-1` sampai `--spacing-9`, `.section` (jarak 4,5 rem), padding kartu, lebar baris maksimum 60–68 karakter | Jarak antarseksi besar dan konsisten. Kartu punya padding yang longgar. Ringkasan dan alasan dibatasi tiga baris. Paragraf dibatasi lebarnya (`max-width: 62ch`) agar baris tidak terlalu panjang. Ruang kosong dibiarkan kosong tanpa dekorasi tambahan. | Kelompok informasi terpisah dengan jelas dan teks lebih nyaman dibaca. |

---

## C. Alasan desain memudahkan pengguna

### 1. Pencarian dan filter mengurangi beban mencari

Di Explore Books, kotak pencarian, chip kategori, dan menu tingkat pembaca bekerja bersamaan dan memperbarui hasil **seketika**, tanpa memuat ulang halaman. Kalimat status seperti “Menampilkan 2 dari 25 buku kurasi untuk Comics & Manga, Beginner Friendly” menjelaskan apa yang sedang terjadi.

**Akibatnya**, pengguna tidak perlu membaca 25 kartu satu per satu. Contohnya, pembaca pemula yang ingin mencoba manga cukup dua kali klik untuk melihat dua pilihan yang cocok. Jika hasilnya kosong, website menampilkan saran kata kunci dan tombol reset, bukan halaman kosong tanpa petunjuk.

### 2. Label tingkat pembaca dan alasan rekomendasi membantu memutuskan

Setiap kartu menjawab dua pertanyaan yang biasanya muncul sebelum orang mulai membaca:

- **“Apa manfaatnya untukku?”** dijawab oleh bagian *Kenapa buku ini?* yang ditulis khusus untuk setiap buku.
- **“Apakah aku sanggup membacanya?”** dijawab oleh label Beginner, Intermediate, atau Advanced, plus catatan konten untuk buku dengan tema berat.

**Akibatnya**, pengguna bisa memilih buku yang sesuai dengan kemampuan dan tujuannya, sehingga kecil kemungkinan berhenti di tengah jalan karena buku terlalu sulit atau tidak sesuai harapan.

### 3. Hierarki visual dan ruang kosong mempercepat pemindaian

Judul ditulis dengan serif besar, penulis dengan teks abu-abu yang lebih kecil, dan alasan rekomendasi ditandai garis kuning di sisi kiri. Setiap kartu dipisahkan oleh jarak yang cukup.

**Akibatnya**, mata pengguna bisa melompat dari satu judul ke judul berikutnya dan langsung menemukan alasan rekomendasi tanpa membaca seluruh isi kartu.

### 4. Konsistensi navigasi mengurangi kebingungan

Header, tombol, kartu, dan warna kategori sama di ketiga halaman. Tombol bookmark dan modal detail juga bekerja dengan cara yang sama, baik di Home maupun di Explore.

**Akibatnya**, pengguna cukup mempelajari pola interaksi satu kali, lalu bisa memakainya di seluruh website.

---

## D. Penjelasan API

### Layanan dan endpoint

| Layanan | Endpoint | Informasi yang diambil | Dipanggil oleh |
|---|---|---|---|
| Google Books API | `GET https://www.googleapis.com/books/v1/volumes?q={query}&maxResults={n}&printType=books` | Judul, subjudul, penulis, deskripsi, kategori, penerbit, tanggal terbit, jumlah halaman, thumbnail, tautan | `fetchCuratedMetadata()` dan `searchGoogleBooks()` di `js/api.js` |
| Open Library Covers API | `https://covers.openlibrary.org/b/isbn/{ISBN}-{M\|L}.jpg?default=false` dan `/b/id/{cover_i}-M.jpg` | Gambar sampul | `openLibraryCoverByIsbn()` di `js/api.js`, dipakai `createCover()` di `js/books.js` |
| Open Library Search API | `GET https://openlibrary.org/search.json?q={query}&limit=12&fields=...` | Judul, penulis, tahun terbit pertama, ID sampul, subjek, penerbit | `searchOpenLibrary()` di `js/api.js` |

### Cara data diproses

1. **Data kurasi lebih dulu.** Katalog langsung ditampilkan dari `data/books.js`, jadi pengguna tidak menunggu API sebelum melihat buku.
2. **Metadata buku kurasi, hanya saat dibutuhkan.** Metadata tidak diambil massal untuk 25 buku. Aplikasi hanya memintanya untuk **satu buku** ketika detail buku dibuka, atau ketika sampul dari Open Library tidak tersedia. Urutannya: memori, lalu cache `localStorage` (berlaku 7 hari), lalu Google Books dengan `q=isbn:{ISBN}`, dan jika tidak ditemukan, `intitle:"{judul}" inauthor:{nama belakang penulis}`. Permintaan ganda untuk buku yang sama digabung menjadi satu.
3. **API key opsional.** Jika `js/config.js` berisi key, key ditambahkan ke setiap request Google Books. Key dibatasi ke domain website dan ke Books API di Google Cloud Console.
4. **Jeda otomatis.** Jika Google membalas HTTP 429 (kuota habis), atau 400/403 saat memakai key (key ditolak), Google tidak dipanggil lagi selama 30 menit. Selama jeda, detail buku memakai data kurasi, pencarian online memakai Open Library, dan halaman Explore menampilkan pemberitahuan dengan tombol **Coba lagi sekarang** (satu request uji).
5. **Pencarian online.** Pencarian berjalan saat kata kunci minimal 3 huruf, setelah jeda 600 ms (debounce). Request lama dibatalkan dengan `AbortController`. Hasil per kata kunci disimpan di memori agar tidak diminta ulang.
6. **Normalisasi.** `normalizeGoogleVolume()` dan `normalizeOpenLibraryDoc()` mengubah respons kedua layanan menjadi bentuk objek yang sama: `{ id, source, title, authors, description, categories, publishedDate, publisher, pageCount, cover, link }`.
7. **Keamanan.**
   - Query selalu dikodekan dengan `encodeURIComponent()`.
   - Deskripsi yang berisi tag HTML dibersihkan dengan `DOMParser` lalu diambil `textContent`-nya. `DOMParser` tidak menjalankan skrip.
   - Semua teks dari API dimasukkan ke halaman dengan `textContent`, tidak pernah dengan `innerHTML`.
   - URL gambar `http://` diubah menjadi `https://`. URL dengan skema lain, misalnya `javascript:`, ditolak.

### Penanganan data kosong atau tidak valid

| Kondisi | Penanganan |
|---|---|
| Respons tanpa `items` atau `docs` | Dianggap tidak ada hasil, lalu tampil pesan “Tidak ada hasil online” beserta saran |
| Item tanpa `volumeInfo` atau tanpa judul | Dibuang |
| Tanpa penulis | Ditampilkan “Penulis tidak diketahui” |
| Tanpa deskripsi | Ditampilkan “… tidak menyediakan deskripsi untuk buku ini” |
| Tanpa penerbit, tanggal, atau halaman | Baris data tersebut tidak ditampilkan |
| Tanpa sampul, atau gambar gagal dimuat | Dicoba sumber berikutnya; jika semuanya gagal, tampil sampul pengganti lokal berisi judul dan penulis |
| Gambar 1 × 1 piksel | Dianggap tidak ada sampul |
| Respons bukan JSON | Ditampilkan pesan error yang jelas |

### Fallback berlapis

| Kebutuhan | Urutan sumber |
|---|---|
| Sampul | Open Library (ISBN) → thumbnail Google Books → sampul pengganti lokal |
| Pencarian | Google Books → Open Library → pesan error dengan tombol **Coba lagi** |
| Metadata | Memori → cache → Google Books (ISBN) → Google Books (judul dan penulis) → data kurasi lokal. Saat kuota habis atau key ditolak: jeda 30 menit, pemberitahuan, dan tombol **Coba lagi sekarang** |
| Tanpa internet | Seluruh katalog, filter, modal, dan bookmark tetap berfungsi dari `data/books.js` |

### Batasan dan atribusi

- **Hasil uji API asli setelah website online:** Google Books **tanpa key** membalas HTTP 429 (kuota habis), sehingga data edisi dimuat untuk 0 dari 25 buku. Fallback berjalan sesuai rancangan, dan karena browser bisa membaca kode 429, CORS dipastikan tidak memblokir request. Sebagai tindak lanjut, ditambahkan API key opsional (dibatasi ke domain dan Books API) serta pengambilan metadata per buku dengan jeda otomatis.
- API key frontend selalu terlihat publik. Perlindungannya berasal dari pembatasan domain dan API di Google Cloud Console, bukan dari menyembunyikan key.
- Urutan hasil pencarian berasal dari relevansi Google Books, **bukan** popularitas. Hal ini juga dijelaskan di antarmuka.
- ISBN di data kurasi merujuk ke satu edisi buku, sehingga data edisi dari API bisa berbeda dengan edisi yang dimiliki pengguna.
- Data API selalu diberi label sumbernya, seperti “Data edisi dari Google Books” dan “Deskripsi dari Google Books”. Footer dan halaman About mencantumkan atribusi ke Google Books dan Open Library.

---

## E. Evaluasi desain

### Kelebihan

- **Tahan gangguan.** Website tetap berguna saat API gagal, kuota habis, gambar gagal dimuat, atau `localStorage` diblokir.
- **Hemat request.** Metadata hanya diambil per buku saat dibutuhkan, ada cache 7 hari, debounce pencarian, dan jeda 30 menit setelah kuota habis. Mengganti filter tidak memicu request jaringan.
- **Aksesibel.** HTML semantik, skip link, label pada semua input, fokus yang terlihat, modal dengan fokus terkunci, dan dukungan `prefers-reduced-motion`.
- **Jujur.** Tidak ada rating, angka penjualan, atau statistik buatan. Data kurasi dan data API dibedakan dengan jelas.
- **Mudah dikembangkan.** Menambah buku cukup dengan menambah satu objek di `data/books.js`, dan jumlah buku di semua halaman ikut diperbarui.

### Pengujian yang telah dilakukan

Pengujian berikut bersifat **teknis** dan dijalankan di Chromium headless (Playwright).

- **Uji fungsional: 59/59 lulus.** Mencakup navigasi, pencarian, filter, sorting, modal, bookmark, deep link, cache, debounce, dan keamanan XSS.
- **Uji kondisi gagal: 21/21 lulus.** Mencakup HTTP 500, HTTP 429 dengan jeda otomatis (0 request selama jeda, tepat 1 request saat coba lagi), pemulihan setelah Google kembali normal, kondisi offline, `localStorage` diblokir, dan sampul gagal dimuat.
- **Uji API key: 9/9 lulus.** Key terkirim di setiap request Google, key yang ditolak memunculkan pemberitahuan yang tepat, dan tanpa key tidak ada parameter key yang terkirim.
- **Uji keyboard dan reduced motion: 8/8 lulus.**
- **Validasi HTML (html-validate):** tanpa error.
- **Audit aksesibilitas (axe-core, aturan WCAG 2.1 AA dan best practice):** 0 pelanggaran di lebar 1280 px dan 375 px.

Sandbox pengujian tidak punya akses ke internet, sehingga **respons API diganti dengan data tiruan (mock)** dan Google Fonts tidak dimuat. Perilaku terhadap API asli, kecocokan setiap ISBN, dan tampilan font asli perlu diperiksa ulang setelah website online.

**Pengujian dengan pengguna nyata belum dilakukan.** Penilaian kemudahan penggunaan dalam dokumen ini didasarkan pada prinsip desain, bukan pada hasil observasi pengguna.

### Keterbatasan

- Koleksi kurasi masih kecil (25 buku), dan sebagian besar memakai edisi berbahasa Inggris.
- Bookmark hanya tersimpan di browser dan perangkat yang sedang dipakai.
- Deskripsi dari Google Books sering berbahasa Inggris.
- Hasil pencarian online belum punya alasan rekomendasi dan tingkat pembaca karena belum ditinjau editor.
- Di layar ponsel, area filter masih cukup tinggi sebelum katalog terlihat.

### Pengembangan berikutnya

1. Melakukan uji pengguna sederhana dengan 5–8 mahasiswa, misalnya tugas “temukan satu buku pemula tentang misteri”, lalu mencatat waktu dan kendala yang dialami.
2. Menambah koleksi buku berbahasa Indonesia dan memakai ISBN edisi terjemahan.
3. Menambahkan filter yang bisa dilipat di ponsel, atau tombol “Lompat ke hasil”.
4. Menyinkronkan bookmark antarperangkat melalui backend dan sistem akun.
5. Membuat halaman “Daftar baca” tematik, misalnya “Buku untuk semester pertama”.
