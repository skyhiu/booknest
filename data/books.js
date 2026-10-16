/*
 * BookNest — data kurasi editorial (fallback lokal)
 * ------------------------------------------------------------
 * File ini adalah sumber kebenaran untuk hal-hal yang ditentukan
 * oleh editor BookNest: kategori, tingkat pembaca, ringkasan singkat,
 * alasan rekomendasi, dan catatan konten.
 *
 * Data bibliografis tambahan (deskripsi penerbit, penerbit edisi,
 * jumlah halaman, tautan) diambil dari Google Books API saat online.
 * Sampul diambil dari Open Library Covers API berdasarkan ISBN.
 * Jika API gagal, website tetap berjalan memakai data di file ini.
 *
 * Catatan:
 * - `firstPublished` = tahun terbit pertama karya (bukan edisi ISBN).
 * - `isbn` = ISBN-13 salah satu edisi berbahasa Inggris/Indonesia,
 *   dipakai untuk mencari metadata dan sampul. Edisi bisa berbeda.
 * - Ringkasan ditulis dengan kata-kata sendiri, tanpa membocorkan twist.
 * - Tidak ada rating, angka penjualan, atau statistik pembaca.
 */
window.BOOKNEST_DATA = {
  categories: [
    {
      id: "critical-thinking",
      label: "Critical Thinking",
      description: "Mengenali bias, menilai argumen, dan memeriksa klaim dengan bukti.",
    },
    {
      id: "fiction",
      label: "Fiction & Novels",
      description: "Fantasi, misteri, distopia, fiksi ilmiah, dan cerita yang membekas.",
    },
    {
      id: "comics",
      label: "Comics & Manga",
      description: "Cerita visual: dari petualangan ringan sampai memoar grafis.",
    },
    {
      id: "knowledge",
      label: "Knowledge for Beginners",
      description: "Sains, sejarah, uang, dan kebiasaan, dijelaskan untuk pemula.",
    },
  ],

  levels: [
    {
      id: "beginner",
      label: "Beginner Friendly",
      short: "Pemula",
      bars: 1,
      description: "Bahasa lancar, bab pendek, atau cerita yang mudah diikuti.",
    },
    {
      id: "intermediate",
      label: "Intermediate",
      short: "Menengah",
      bars: 2,
      description: "Butuh sedikit konsentrasi: tema lebih berat atau gaya bahasa lebih padat.",
    },
    {
      id: "advanced",
      label: "Advanced",
      short: "Lanjutan",
      bars: 3,
      description: "Struktur kompleks, tema dewasa, atau pembahasan berbasis riset.",
    },
  ],

  books: [
    /* ---------- Critical Thinking ---------- */
    {
      id: "factfulness",
      title: "Factfulness",
      authors: ["Hans Rosling", "Ola Rosling", "Anna Rosling Rönnlund"],
      category: "critical-thinking",
      genre: "Data & penalaran",
      level: "beginner",
      firstPublished: 2018,
      isbn: "9781250107817",
      editorPick: true,
      summary:
        "Mengajak pembaca menguji gambaran mereka tentang kondisi dunia, seperti kemiskinan, kesehatan, dan pendidikan, dengan data, lalu menjelaskan sepuluh naluri yang membuat kita sering salah menebak.",
      reason:
        "Membantu pembaca menguji asumsi tentang dunia menggunakan data dan memahami kesalahan penalaran yang umum, dengan gaya bercerita yang hangat.",
      contentNote:
        "Angka di dalamnya mencerminkan kondisi saat buku ditulis. Data terbaru bisa dicek di situs Gapminder.",
    },
    {
      id: "the-art-of-thinking-clearly",
      title: "The Art of Thinking Clearly",
      authors: ["Rolf Dobelli"],
      category: "critical-thinking",
      genre: "Bias kognitif",
      level: "beginner",
      firstPublished: 2011,
      isbn: "9780062219695",
      starter: true,
      summary:
        "Kumpulan bab pendek yang masing-masing membahas satu kesalahan berpikir sehari-hari, misalnya bias konfirmasi atau sunk cost fallacy, lengkap dengan contoh situasi nyata.",
      reason:
        "Setiap bab bisa dibaca dalam beberapa menit, jadi kamu bisa mengenali satu bias pada satu waktu tanpa harus menamatkan buku sekaligus.",
      contentNote:
        "Pembahasannya ringkas. Gunakan sebagai pengantar, lalu lanjutkan ke sumber yang lebih mendalam.",
    },
    {
      id: "a-rulebook-for-arguments",
      title: "A Rulebook for Arguments",
      authors: ["Anthony Weston"],
      category: "critical-thinking",
      genre: "Logika & argumen",
      level: "beginner",
      firstPublished: 1987,
      isbn: "9780872209541",
      summary:
        "Panduan tipis berisi aturan singkat untuk menyusun dan menilai argumen: memisahkan premis dari kesimpulan, memakai contoh dan analogi, serta mengutip sumber dengan tepat.",
      reason:
        "Sangat praktis untuk mahasiswa: aturannya bisa langsung dipakai saat menulis esai, berdiskusi di kelas, atau memeriksa argumen orang lain.",
    },
    {
      id: "the-demon-haunted-world",
      title: "The Demon-Haunted World",
      authors: ["Carl Sagan"],
      category: "critical-thinking",
      genre: "Sains & skeptisisme",
      level: "intermediate",
      firstPublished: 1995,
      isbn: "9780345409461",
      editorPick: true,
      summary:
        "Carl Sagan membahas mengapa pseudosains dan takhayul mudah dipercaya, lalu memperkenalkan cara berpikir ilmiah sebagai alat untuk memeriksa klaim, termasuk “baloney detection kit” yang terkenal.",
      reason:
        "Menunjukkan bahwa skeptis tidak sama dengan sinis: kamu belajar mengajukan pertanyaan yang tepat sebelum menerima sebuah klaim.",
      contentNote:
        "Ditulis pada 1990-an, jadi sebagian contohnya terasa lama, tetapi cara berpikirnya tetap relevan.",
    },
    {
      id: "thinking-fast-and-slow",
      title: "Thinking, Fast and Slow",
      authors: ["Daniel Kahneman"],
      category: "critical-thinking",
      genre: "Psikologi keputusan",
      level: "advanced",
      firstPublished: 2011,
      isbn: "9780374533557",
      summary:
        "Kahneman menjelaskan dua mode berpikir, yaitu cepat-intuitif dan lambat-analitis, serta bagaimana keduanya memengaruhi penilaian, keputusan, dan bias kita.",
      reason:
        "Untuk pembaca yang sudah nyaman dengan buku pengantar dan ingin memahami riset di balik bias kognitif secara lebih mendalam.",
      contentNote:
        "Beberapa studi priming yang dibahas kemudian gagal direplikasi, dan Kahneman sendiri mengakuinya. Baca bagian itu dengan kritis.",
    },

    /* ---------- Fiction & Novels ---------- */
    {
      id: "the-hobbit",
      title: "The Hobbit",
      authors: ["J.R.R. Tolkien"],
      category: "fiction",
      genre: "Fantasi petualangan",
      level: "beginner",
      firstPublished: 1937,
      isbn: "9780547928227",
      editorPick: true,
      summary:
        "Bilbo Baggins, hobbit yang menyukai hidup tenang, terseret dalam perjalanan bersama sekelompok kurcaci dan penyihir Gandalf menuju gunung yang dijaga seekor naga.",
      reason:
        "Pintu masuk yang ramah ke fantasi: perjalanan karakternya jelas, dunianya kaya, dan ceritanya awalnya ditulis untuk pembaca muda.",
    },
    {
      id: "harry-potter-philosophers-stone",
      title: "Harry Potter and the Philosopher's Stone",
      authors: ["J.K. Rowling"],
      category: "fiction",
      genre: "Fantasi",
      level: "beginner",
      firstPublished: 1997,
      isbn: "9780747532699",
      starter: true,
      summary:
        "Pada ulang tahun kesebelasnya, Harry mengetahui bahwa ia seorang penyihir dan mulai bersekolah di Hogwarts, tempat persahabatan dan misteri pertamanya menunggu.",
      reason:
        "Bahasanya lancar, babnya tidak terlalu panjang, dan misteri sekolahnya membuat penasaran: cocok untuk membangun kebiasaan membaca dari nol.",
    },
    {
      id: "the-hunger-games",
      title: "The Hunger Games",
      authors: ["Suzanne Collins"],
      category: "fiction",
      genre: "Distopia",
      level: "beginner",
      firstPublished: 2008,
      isbn: "9780439023481",
      summary:
        "Di negara Panem, Katniss Everdeen mengajukan diri menggantikan adiknya dalam Hunger Games, kompetisi bertahan hidup yang disiarkan ke seluruh negeri.",
      reason:
        "Temponya cepat dan narasi orang pertamanya mudah diikuti, sekaligus membuka diskusi tentang media, kekuasaan, dan ketidakadilan.",
      contentNote: "Berisi kekerasan antartokoh remaja.",
    },
    {
      id: "nineteen-eighty-four",
      title: "1984",
      authors: ["George Orwell"],
      category: "fiction",
      genre: "Distopia klasik",
      level: "intermediate",
      firstPublished: 1949,
      isbn: "9780451524935",
      editorPick: true,
      summary:
        "Winston Smith hidup di bawah pemerintahan yang mengawasi segalanya serta mengendalikan bahasa dan sejarah, lalu mulai mempertanyakan kebenaran yang diajarkan kepadanya.",
      reason:
        "Klasik yang membantu memahami propaganda, pengawasan, dan manipulasi bahasa, konsep yang sering muncul dalam diskusi politik dan media.",
      contentNote: "Suasananya suram dan ada adegan penyiksaan.",
    },
    {
      id: "and-then-there-were-none",
      title: "And Then There Were None",
      authors: ["Agatha Christie"],
      category: "fiction",
      genre: "Misteri",
      level: "beginner",
      firstPublished: 1939,
      isbn: "9780062073488",
      editorPick: true,
      summary:
        "Sepuluh orang asing diundang ke sebuah pulau terpencil. Satu per satu mereka mulai tewas, padahal tidak ada orang lain di pulau itu.",
      reason:
        "Cocok untuk pembaca pemula yang menyukai misteri dengan petunjuk bertahap; babnya pendek dan ketegangannya terjaga sampai akhir.",
      contentNote:
        "Judul edisi pertamanya mengandung istilah rasis dan sudah lama diganti; edisi modern memakai judul ini.",
    },
    {
      id: "the-little-prince",
      title: "The Little Prince",
      authors: ["Antoine de Saint-Exupéry"],
      category: "fiction",
      genre: "Fiksi reflektif",
      level: "beginner",
      firstPublished: 1943,
      isbn: "9780156012195",
      summary:
        "Seorang pilot yang terdampar di gurun bertemu pangeran kecil dari asteroid lain, yang bercerita tentang planet-planet dan penghuni yang pernah ia kunjungi.",
      reason:
        "Pendek dan bergambar, tetapi menyimpan banyak makna tentang persahabatan dan cara orang dewasa memandang dunia. Enak dibaca ulang di usia berbeda.",
    },
    {
      id: "project-hail-mary",
      title: "Project Hail Mary",
      authors: ["Andy Weir"],
      category: "fiction",
      genre: "Fiksi ilmiah",
      level: "intermediate",
      firstPublished: 2021,
      isbn: "9780593135204",
      summary:
        "Ryland Grace terbangun sendirian di pesawat luar angkasa tanpa ingat bagaimana ia sampai di sana, lalu perlahan menyusun kembali misinya dengan bantuan sains.",
      reason:
        "Pas untuk penyuka teka-teki: konsep sains dijelaskan sambil cerita berjalan, dan humornya membuat bagian teknis tetap ringan.",
      contentNote: "Banyak istilah sains. Kamu tidak perlu memahami semuanya untuk menikmati cerita.",
    },
    {
      id: "laskar-pelangi",
      title: "Laskar Pelangi",
      authors: ["Andrea Hirata"],
      category: "fiction",
      genre: "Fiksi Indonesia",
      level: "beginner",
      firstPublished: 2005,
      isbn: "9789793062792",
      summary:
        "Kisah sepuluh anak di Belitung yang bersekolah di sebuah SD sederhana, bersama guru-guru yang berjuang agar sekolah mereka tetap berdiri.",
      reason:
        "Pilihan berbahasa Indonesia yang hangat dan dekat dengan pengalaman pembaca lokal, cocok untuk memulai kebiasaan membaca fiksi.",
    },

    /* ---------- Comics & Manga ---------- */
    {
      id: "maus",
      title: "Maus",
      authors: ["Art Spiegelman"],
      category: "comics",
      genre: "Memoar grafis",
      level: "intermediate",
      firstPublished: 1986,
      isbn: "9780394747231",
      editorPick: true,
      summary:
        "Spiegelman merekam kisah ayahnya, seorang penyintas Holocaust, dan menggambarkan orang Yahudi sebagai tikus serta Nazi sebagai kucing.",
      reason:
        "Menunjukkan kekuatan media visual untuk menyampaikan sejarah dan trauma secara personal. Karya ini menerima penghargaan khusus Pulitzer pada 1992.",
      contentNote: "Menggambarkan genosida, kekerasan, dan trauma keluarga.",
    },
    {
      id: "one-piece",
      title: "One Piece, Vol. 1",
      authors: ["Eiichiro Oda"],
      category: "comics",
      genre: "Manga petualangan",
      level: "beginner",
      firstPublished: 1997,
      isbn: "9781569319017",
      summary:
        "Monkey D. Luffy, pemuda bertubuh karet, berlayar mengumpulkan kru untuk mencari harta karun legendaris bernama One Piece.",
      reason:
        "Volume awalnya ringan, lucu, dan penuh aksi. Pilihan aman untuk mencoba manga dengan cerita petualangan panjang.",
      contentNote: "Serinya sangat panjang (lebih dari 100 volume). Nikmati per arc cerita.",
    },
    {
      id: "spy-x-family",
      title: "Spy x Family, Vol. 1",
      authors: ["Tatsuya Endo"],
      category: "comics",
      genre: "Manga komedi aksi",
      level: "beginner",
      firstPublished: 2019,
      isbn: "9781974715466",
      starter: true,
      summary:
        "Seorang mata-mata harus membentuk keluarga palsu demi misinya, tanpa tahu bahwa ‘istrinya’ pembunuh bayaran dan ‘anaknya’ bisa membaca pikiran.",
      reason:
        "Komedi keluarga dengan bab pendek dan alur yang mudah diikuti. Cara ringan untuk mulai mengenal manga.",
      contentNote: "Ada adegan aksi ringan.",
    },
    {
      id: "death-note",
      title: "Death Note, Vol. 1",
      authors: ["Tsugumi Ohba", "Takeshi Obata"],
      category: "comics",
      genre: "Manga misteri",
      level: "intermediate",
      firstPublished: 2003,
      isbn: "9781421501680",
      summary:
        "Light Yagami menemukan buku catatan yang dapat membunuh siapa pun yang namanya ditulis di dalamnya, lalu terlibat permainan kucing-kucingan dengan detektif jenius L.",
      reason:
        "Duel strateginya mengajak pembaca menebak langkah berikutnya sekaligus memikirkan pertanyaan moral tentang keadilan.",
      contentNote: "Berisi kematian dan kekerasan; dialognya cukup padat.",
    },
    {
      id: "persepolis",
      title: "Persepolis",
      authors: ["Marjane Satrapi"],
      category: "comics",
      genre: "Memoar grafis",
      level: "intermediate",
      firstPublished: 2000,
      isbn: "9780375714573",
      summary:
        "Memoar grafis tentang masa kecil dan remaja Satrapi di Iran selama Revolusi Islam dan perang Iran–Irak, digambar dalam gaya hitam-putih yang sederhana.",
      reason:
        "Membantu memahami sejarah politik dari sudut pandang seorang anak; gambarnya yang sederhana membuat tema berat lebih mudah didekati.",
      contentNote: "Mengandung kekerasan, perang, dan penindasan politik.",
    },
    {
      id: "watchmen",
      title: "Watchmen",
      authors: ["Alan Moore", "Dave Gibbons"],
      category: "comics",
      genre: "Novel grafis",
      level: "advanced",
      firstPublished: 1987,
      isbn: "9780930289232",
      summary:
        "Di dunia alternatif tempat pahlawan bertopeng pernah nyata, pembunuhan seorang mantan pahlawan memicu penyelidikan yang membuka rahasia-rahasia kelam.",
      reason:
        "Contoh bagaimana komik memakai struktur panel, simbol, dan narasi berlapis untuk mempertanyakan ide tentang kepahlawanan dan kekuasaan.",
      contentNote: "Mengandung kekerasan grafis, kekerasan seksual, dan tema dewasa.",
    },

    /* ---------- Knowledge for Beginners ---------- */
    {
      id: "the-psychology-of-money",
      title: "The Psychology of Money",
      authors: ["Morgan Housel"],
      category: "knowledge",
      genre: "Perilaku & keuangan",
      level: "beginner",
      firstPublished: 2020,
      isbn: "9780857197689",
      editorPick: true,
      summary:
        "Kumpulan esai pendek tentang bagaimana perilaku, emosi, dan pengalaman pribadi memengaruhi keputusan keuangan, bukan sekadar rumus investasi.",
      reason:
        "Cocok untuk pemula yang ingin memahami hubungan perilaku, emosi, dan keputusan keuangan melalui esai pendek yang bisa dibaca terpisah.",
      contentNote:
        "Bukan nasihat keuangan pribadi, dan banyak contohnya berlatar Amerika Serikat.",
    },
    {
      id: "atomic-habits",
      title: "Atomic Habits",
      authors: ["James Clear"],
      category: "knowledge",
      genre: "Kebiasaan",
      level: "beginner",
      firstPublished: 2018,
      isbn: "9780735211292",
      starter: true,
      summary:
        "Menjelaskan cara membangun kebiasaan baik dan menghentikan kebiasaan buruk lewat perubahan kecil yang konsisten serta lingkungan yang dirancang dengan sengaja.",
      reason:
        "Praktis untuk mahasiswa yang ingin membangun rutinitas, termasuk kebiasaan membaca, dengan langkah kecil yang bisa langsung dicoba.",
      contentNote:
        "Ini buku pengembangan diri. Bandingkan sarannya dengan riset psikologi tentang kebiasaan.",
    },
    {
      id: "how-to-win-friends",
      title: "How to Win Friends and Influence People",
      authors: ["Dale Carnegie"],
      category: "knowledge",
      genre: "Keterampilan sosial",
      level: "beginner",
      firstPublished: 1936,
      isbn: "9780671027032",
      summary:
        "Panduan klasik tentang komunikasi dan hubungan antarmanusia: mendengarkan, memberi apresiasi yang tulus, dan menyampaikan pendapat tanpa menyerang.",
      reason:
        "Prinsipnya sederhana dan mudah dipraktikkan dalam organisasi, kerja kelompok, atau wawancara kerja.",
      contentNote: "Contoh-contohnya berasal dari era 1930-an. Ambil prinsipnya, bukan detail zamannya.",
    },
    {
      id: "a-short-history-of-nearly-everything",
      title: "A Short History of Nearly Everything",
      authors: ["Bill Bryson"],
      category: "knowledge",
      genre: "Sejarah sains",
      level: "intermediate",
      firstPublished: 2003,
      isbn: "9780767908184",
      summary:
        "Bryson menjelajahi sejarah sains, dari asal-usul alam semesta hingga kemunculan manusia, sambil menceritakan tokoh-tokoh unik di balik penemuan besar.",
      reason:
        "Memberi wawasan sains umum tanpa rumus. Gaya bertuturnya jenaka, meski bukunya cukup tebal.",
      contentNote: "Terbit 2003, jadi beberapa temuan sains sudah diperbarui sejak itu.",
    },
    {
      id: "sapiens",
      title: "Sapiens: A Brief History of Humankind",
      authors: ["Yuval Noah Harari"],
      category: "knowledge",
      genre: "Sejarah manusia",
      level: "intermediate",
      firstPublished: 2011,
      isbn: "9780062316097",
      summary:
        "Menelusuri perjalanan Homo sapiens dari revolusi kognitif, pertanian, hingga revolusi ilmiah, serta bagaimana “fiksi bersama” seperti uang dan negara membentuk masyarakat.",
      reason:
        "Memancing diskusi besar tentang sejarah manusia, sekaligus melatih kamu membedakan fakta, interpretasi, dan spekulasi.",
      contentNote:
        "Sebagian argumennya diperdebatkan oleh sejarawan dan ilmuwan. Bandingkan dengan sumber lain.",
    },
    {
      id: "cosmos",
      title: "Cosmos",
      authors: ["Carl Sagan"],
      category: "knowledge",
      genre: "Astronomi",
      level: "intermediate",
      firstPublished: 1980,
      isbn: "9780345539434",
      summary:
        "Sagan mengajak pembaca menjelajahi alam semesta dan sejarah sains, menghubungkan astronomi dengan kisah manusia yang berusaha memahaminya.",
      reason:
        "Membuat konsep astronomi terasa indah dan dekat. Cocok untuk kamu yang penasaran tentang luar angkasa.",
      contentNote: "Terbit 1980, jadi beberapa data astronomi sudah diperbarui.",
    },
  ],
};
