# BookNest

BookNest adalah website rekomendasi buku untuk pelajar, mahasiswa, dan pembaca pemula. Website ini berisi 25 buku hasil kurasi editorial dalam empat kategori: **Critical Thinking**, **Fiction & Novels**, **Comics & Manga**, dan **Knowledge for Beginners**. Setiap buku dilengkapi ringkasan singkat, alasan rekomendasi, dan label tingkat pembaca.

Proyek ini dibuat sebagai proyek pembelajaran web design dengan **HTML5, CSS3, dan JavaScript Vanilla (ES6+)**, tanpa framework dan tanpa library pihak ketiga.

Penjelasan prinsip desain ada di [`DESIGN_DOCUMENTATION.md`](DESIGN_DOCUMENTATION.md).

---

## Fitur

- **Tiga halaman** yang saling terhubung: Home (`index.html`), About (`about.html`), dan Explore Books (`explore.html`).
- **Pencarian** judul, penulis, atau genre. Koleksi kurasi langsung tersaring saat kamu mengetik.
- **Filter** kategori dan tingkat pembaca, **sorting** (rekomendasi editor, judul A–Z, terbit pertama terbaru), serta tombol **Reset filter**.
- **Quick View**: modal detail berisi ringkasan, alasan rekomendasi, catatan untuk pembaca, deskripsi dari Google Books, data edisi, dan buku terkait.
- **Bookmark** yang disimpan di `localStorage`, dengan **Rak Simpanan** dan penghitung di header.
- **Pencarian online** tambahan dari Google Books, dengan Open Library sebagai cadangan.
- **Book of the Day**, Editor's Picks, dan bagian Mulai Membaca di Home.
- Tampilan khusus untuk kondisi **loading**, **kosong**, dan **error**, lengkap dengan tombol **Coba lagi**.
- **Sampul pengganti** yang dibuat secara lokal jika gambar sampul tidak tersedia.
- Filter tersimpan di URL agar bisa dibagikan, misalnya `explore.html?category=comics&book=maus`.
- Responsif, bisa dipakai dengan keyboard, dan menghormati pengaturan `prefers-reduced-motion`.

---

## Struktur folder

```
booknest/
├── index.html                 Halaman Home
├── about.html                 Halaman About / Profile
├── explore.html               Halaman Explore Books (konten utama)
├── README.md                  Dokumen ini
├── DESIGN_DOCUMENTATION.md    Dokumentasi prinsip desain
├── assets/
│   └── icons/
│       └── favicon.svg
├── css/
│   ├── style.css              Token desain, komponen, layout mobile-first
│   └── responsive.css         Penyesuaian untuk tablet, laptop, dan desktop
├── data/
│   └── books.js               25 buku kurasi (sekaligus data cadangan offline)
└── js/
    ├── icons.js               Pembuat ikon SVG (tanpa innerHTML)
    ├── storage.js             Bookmark dan cache metadata (localStorage)
    ├── api.js                 Integrasi Google Books dan Open Library
    ├── books.js               Komponen: kartu, sampul, badge, bookmark, modal
    ├── main.js                Skrip bersama: menu mobile, penghitung, back to top
    ├── home.js                Logika halaman Home
    └── explore.js             Logika halaman Explore
```

Beberapa catatan tentang struktur ini:

- Logika halaman dipisah menjadi `home.js` dan `explore.js` agar setiap file punya satu tanggung jawab.
- Folder `assets/images/` sengaja tidak dibuat karena semua gambar sampul berasal dari API atau dibuat secara lokal sebagai sampul pengganti.
- Script dimuat sebagai **script biasa dengan `defer`**, bukan ES modules. Akibatnya urutan tag `<script>` penting, tetapi website tetap bisa dibuka langsung dengan klik dua kali pada `index.html`. ES modules diblokir browser jika dibuka lewat `file://`.

Urutan script yang benar:

```
data/books.js → js/icons.js → js/storage.js → js/api.js → js/books.js → js/main.js → (home.js / explore.js)
```

---

## Menjalankan secara lokal (tanpa terminal)

### Cara 1: buka langsung (paling mudah)

1. Ekstrak `booknest.zip`: klik kanan, lalu pilih **Extract All…** di Windows, atau klik dua kali di macOS.
2. Buka folder `booknest`, lalu **klik dua kali `index.html`**. Website akan terbuka di browser.

Semua fitur berjalan dengan cara ini, termasuk API dan bookmark, asalkan komputer terhubung ke internet.

### Cara 2: Live Server di VS Code (opsional)

Gunakan cara ini jika kamu sudah memakai Visual Studio Code dan ingin halaman otomatis dimuat ulang setiap kali file disimpan.

1. Buka VS Code, pilih **File → Open Folder…**, lalu pilih folder `booknest`.
2. Buka panel **Extensions** (ikon kotak-kotak di sisi kiri), cari **Live Server**, lalu klik **Install**.
3. Klik kanan `index.html`, lalu pilih **Open with Live Server**.

### Jika tidak ada internet

Katalog tetap tampil karena memakai data kurasi di `data/books.js`. Yang tidak tersedia hanya sampul asli, deskripsi dari Google Books, dan pencarian online. Sampul diganti dengan sampul pengganti lokal, dan website menampilkan pesan error beserta tombol **Coba lagi**.

---

## API yang digunakan

| Layanan | Endpoint | Dipakai untuk |
|---|---|---|
| Google Books API | `https://www.googleapis.com/books/v1/volumes?q=...` | Deskripsi, penerbit, tanggal edisi, jumlah halaman, tautan, dan pencarian online |
| Open Library Covers API | `https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg?default=false` | Sampul buku kurasi berdasarkan ISBN |
| Open Library Search API | `https://openlibrary.org/search.json?q=...` | Cadangan pencarian jika Google Books gagal atau tidak menemukan hasil |

Hal yang perlu diketahui:

- **Tanpa API key.** Google Books mengizinkan akses data publik tanpa key, tetapi tetap ada kuota per IP/proyek. Jika kuota habis (HTTP 429), BookNest berhenti meminta data dan memakai data kurasi lokal.
- **Hemat request.** Metadata disimpan di cache `localStorage` selama 7 hari, request berjalan paling banyak 3 sekaligus, dan pencarian memakai debounce 600 ms. Mengganti filter tidak memicu request sama sekali.
- **CORS.** Google Books dan Open Library mengirim header CORS sehingga bisa dipanggil langsung dari browser. Jika suatu hari sebuah API memblokir request dari browser, solusinya adalah **proxy di sisi server**, misalnya Netlify Functions. Masalah CORS tidak bisa diperbaiki hanya dengan mengubah `fetch()` di frontend.
- **Jika nanti memakai API key.** Key di frontend selalu bisa dilihat publik. Batasi key tersebut dengan *HTTP referrer restriction* di Google Cloud Console, dan jangan pernah menyimpan key rahasia di repository.

---

## Publikasi online (GitHub Desktop + website GitHub, tanpa terminal)

Repository GitHub dan website online adalah dua hal yang berbeda. **Kode yang sudah ada di GitHub belum berarti websitenya online.** Website baru bisa dibuka publik setelah GitHub Pages (atau Netlify) selesai melakukan deploy.

Kamu cukup login lewat browser saat GitHub Desktop memintanya. **Jangan pernah membagikan password, token, atau kode verifikasi GitHub kepada siapa pun**, termasuk ke chat AI.

> Nama menu di bawah sesuai tampilan GitHub Desktop dan GitHub yang saya ketahui. Jika letak atau nama menu sedikit berbeda di versimu, cari menu dengan nama yang mirip.

### Langkah 1 — Siapkan GitHub Desktop

1. Buat akun di [github.com](https://github.com/) jika belum punya.
2. Unduh dan pasang **GitHub Desktop** dari [desktop.github.com](https://desktop.github.com/).
3. Buka GitHub Desktop, lalu pilih **Sign in to GitHub.com**. Proses login berlangsung di browser. Setelah berhasil, kembali ke GitHub Desktop.
   - Jika layar sambutan tidak muncul: di Windows buka **File → Options → Accounts**; di macOS buka **GitHub Desktop → Settings → Accounts**.

### Langkah 2 — Jadikan folder BookNest sebagai repository

1. Ekstrak `booknest.zip` ke lokasi yang mudah ditemukan, misalnya `Documents/booknest`.
2. Di GitHub Desktop, pilih **File → Add local repository…**, lalu klik **Choose…** dan pilih folder `booknest`.
3. GitHub Desktop akan memberi tahu bahwa folder ini belum menjadi repository. Klik tautan **create a repository** pada pesan tersebut.
4. Di jendela **Create a New Repository**:
   - **Name:** `booknest`
   - **Local path:** biarkan seperti yang terisi otomatis.
   - **Initialize this repository with a README:** jangan dicentang, karena README sudah ada.
   - **Git ignore** dan **License:** biarkan *None*.
5. Klik **Create Repository**.

### Langkah 3 — Commit pertama

1. Buka tab **Changes** di sisi kiri. Semua file BookNest akan tercantum di sana.
2. Di kotak **Summary** (kiri bawah), tulis `Versi awal BookNest`.
3. Klik **Commit to main**.

Commit artinya menyimpan "titik simpan" perubahan di komputermu. Sampai tahap ini, belum ada yang terkirim ke GitHub.

### Langkah 4 — Unggah ke GitHub

1. Klik tombol **Publish repository** di bagian atas.
2. **Hapus centang** pada **Keep this code private**. GitHub Pages pada akun gratis memerlukan repository publik.
3. Klik **Publish repository**, lalu tunggu sampai selesai.
4. Pilih **Repository → View on GitHub** untuk membuka repository di browser. Pastikan `index.html`, `about.html`, `explore.html`, serta folder `css`, `js`, `data`, dan `assets` terlihat di halaman utama repository.

### Langkah 5 — Aktifkan GitHub Pages (di website GitHub)

1. Di halaman repository, klik tab **Settings**.
2. Di menu kiri, klik **Pages**.
3. Di bagian **Build and deployment**:
   - **Source:** pilih **Deploy from a branch**.
   - **Branch:** pilih **main**, lalu folder **/ (root)**.
4. Klik **Save**.
5. Tunggu 1–3 menit. Proses deploy bisa dipantau di tab **Actions**: tanda centang hijau berarti selesai.
6. Muat ulang halaman **Settings → Pages**. Alamat website akan muncul dalam format `https://USERNAME.github.io/booknest/`, disertai tombol **Visit site**.

### Langkah 6 — Memperbarui website setelah ada perubahan

1. Ubah atau ganti file di folder `booknest` seperti biasa, misalnya mengedit `data/books.js` atau mengganti file dengan versi baru.
2. Buka GitHub Desktop. Perubahan akan muncul di tab **Changes**.
3. Tulis ringkasan di **Summary**, misalnya `Tambah buku baru`, lalu klik **Commit to main**.
4. Klik **Push origin** di bagian atas.
5. GitHub Pages akan memperbarui website secara otomatis dalam beberapa menit. Jika perubahan belum tampil, tekan **Ctrl+Shift+R** (Windows) atau **Cmd+Shift+R** (macOS) untuk memuat ulang tanpa cache.

### Alternatif tanpa GitHub Desktop: unggah lewat website GitHub

1. Di [github.com](https://github.com/), klik **+ → New repository**, beri nama `booknest`, pilih **Public**, lalu klik **Create repository**.
2. Di halaman repository yang masih kosong, klik tautan **uploading an existing file**.
3. Buka folder `booknest` di komputermu, pilih **seluruh isinya** (bukan folder `booknest` itu sendiri), lalu seret ke halaman unggah.
4. Tunggu semua file selesai terunggah, isi pesan commit, lalu klik **Commit changes**.
5. **Periksa hasilnya.** `index.html` harus berada di halaman utama repository, dan folder `css`, `js`, `data`, dan `assets` harus terlihat. Jika browsermu tidak ikut mengunggah subfolder, buka folder tersebut di repository dan unggah isinya lewat **Add file → Upload files**.
6. Lanjutkan ke **Langkah 5** di atas untuk mengaktifkan GitHub Pages.

Untuk memperbarui file lewat website, buka file di repository lalu klik ikon pensil (**Edit**), atau pilih **Add file → Upload files** untuk mengganti file dengan versi baru.

### Alternatif hosting: Netlify (tanpa terminal)

**Dari repository GitHub (deploy otomatis):**

1. Masuk ke [netlify.com](https://www.netlify.com/) menggunakan akun GitHub.
2. Pilih **Add new site → Import an existing project → GitHub**, lalu pilih repository `booknest`.
3. Kosongkan **Build command**, lalu isi **Publish directory** dengan `.` (titik).
4. Klik **Deploy**. Setiap kali kamu melakukan **Push origin** di GitHub Desktop, Netlify akan memperbarui website secara otomatis.

**Tanpa GitHub:** buka [app.netlify.com/drop](https://app.netlify.com/drop), lalu seret folder `booknest` ke halaman tersebut. Dengan cara ini tidak ada deploy otomatis; setiap perubahan harus diseret ulang.

### Hal yang sering membuat deploy gagal

- **Halaman 404 setelah Pages aktif.** Tunggu beberapa menit, lalu pastikan `index.html` berada langsung di root repository, bukan di dalam subfolder `booknest/booknest/`.
- **Kapitalisasi nama file.** Server hosting membedakan `Style.css` dan `style.css`. Jangan mengganti nama file atau folder proyek.
- **Repository privat.** Pages tidak tersedia untuk repository privat pada akun gratis.
- **Tombol "Commit to main" tidak bisa diklik.** Kotak **Summary** belum diisi.
- **Hosting statis tidak menjalankan kode server.** GitHub Pages dan Netlify hanya mengirim file apa adanya. BookNest bisa berjalan di sana karena semua logikanya ada di browser.

### Daftar periksa setelah online

- [ ] Ketiga halaman terbuka dan navigasi antarhalaman berfungsi.
- [ ] Sampul muncul, atau sampul pengganti tampil jika gambar tidak tersedia.
- [ ] Status di Explore menunjukkan “Data edisi Google Books dimuat untuk … buku”. Ini adalah bukti pertama bahwa API bisa diakses dari website online.
- [ ] Pencarian dengan minimal 3 huruf menampilkan bagian “Hasil tambahan”.
- [ ] Filter, sorting, dan reset berfungsi.
- [ ] Modal detail bisa dibuka dan ditutup, termasuk dengan tombol Esc.
- [ ] Bookmark tetap ada setelah halaman dimuat ulang.
- [ ] Tampilan di ponsel tidak bergeser ke samping.

---

## Data, atribusi, dan batasan

- Ringkasan, alasan rekomendasi, kategori, tingkat pembaca, dan catatan konten ditulis oleh editor BookNest. Semua data dari API diberi label sumbernya.
- Sampul dan deskripsi buku adalah milik penerbit dan pemegang hak masing-masing. Data diperoleh melalui Google Books dan Open Library.
- ISBN di `data/books.js` merujuk ke salah satu edisi buku. Edisi yang ditampilkan API bisa berbeda dari edisi yang kamu miliki.
- Rekomendasi BookNest adalah kurasi editorial, bukan peringkat universal. Tidak ada rating, angka penjualan, atau statistik pembaca yang ditampilkan.
- Bookmark hanya tersimpan di browser dan perangkat yang sedang dipakai, dan belum disinkronkan antarperangkat.

---

## Menambah buku

Tambahkan objek baru ke array `books` di `data/books.js`:

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

Jumlah buku per kategori di semua halaman akan diperbarui secara otomatis.
