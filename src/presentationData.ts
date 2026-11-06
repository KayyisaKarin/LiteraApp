import { SlideData, PresenterInfo } from './types/presentation';

export const DEFAULT_PRESENTER_INFO: PresenterInfo = {
  name: 'Naqiyya Najwa',
  classGrade: 'XII RPL (Rekayasa Perangkat Lunak)',
  school: 'SMK Negeri 1 / Sekolah Menengah Kejuruan',
  academicYear: '2026/2027',
  advisorName: 'Guru Pembimbing Kejuruan RPL',
  projectUrl: 'https://openlibrary.org/developers/api',
};

export const SLIDES_DATA: SlideData[] = [
  // Slide 1: Cover & Project Overview
  {
    id: 1,
    slideNumber: '01',
    tag: 'PROJECT PRESENTATION',
    title: 'litera',
    subtitle: 'Open Library Books App — Digital Library Explorer',
    category: 'intro',
    highlights: [
      { label: 'Jenis Aplikasi', value: 'Digital Library Explorer', detail: 'Katalog & Penjelajahan Buku Digital' },
      { label: 'Sumber Data', value: 'Open Library API', detail: 'Internet Archive (Non-profit Repository)' },
      { label: 'Metode & Format', value: 'HTTP GET • JSON', detail: 'Arsitektur REST API Terbuka' },
    ],
    speakerNotes:
      'Selamat pagi/siang kepada Bapak/Ibu guru serta rekan-rekan sekalian. Pada kesempatan ini, saya mempresentasikan project aplikasi bernama "litera" (Open Library Books App — Digital Library Explorer). Aplikasi ini dirancang sebagai katalog dan penjelajah buku digital modern yang memanfaatkan REST API dari Open Library untuk mempermudah pencarian serta pengorganisasian koleksi buku secara visual, ringan, dan cepat.',
  },

  // Slide 2: Problem (Tantangan Pengembangan)
  {
    id: 2,
    slideNumber: '02',
    tag: 'DEVELOPMENT CHALLENGE',
    title: 'Tantangan Proses Pengembangan dengan AI',
    subtitle: 'Waktu Pemrosesan Komputasi & Risiko Inkonsistensi Visual Antarmuka',
    category: 'problem',
    bulletPoints: [
      {
        title: 'Latensi Pemrosesan Prompt AI',
        description:
          'AI membutuhkan jeda waktu komputasi untuk menganalisis konteks instruksi, memvalidasi dependensi, dan meregenerasi struktur file sebelum kode siap dijalankan.',
        badge: 'Tantangan 1',
      },
      {
        title: 'Risiko Inkonsistensi Visual (UI Shifts)',
        description:
          'Tampilan antarmuka terkadang dapat mengalami perubahan tata letak atau komponen yang bergeser ketika diberikan prompt baru tanpa pembatasan ruang lingkup yang tegas.',
        badge: 'Tantangan 2',
      },
      {
        title: 'Risiko Regresi Komponen yang Sudah Stabil',
        description:
          'Mengubah satu bagian kecil berpotensi memengaruhi styling atau tata letak elemen lain yang sebelumnya sudah rapi dan berfungsi optimal jika konteksnya tidak dijaga.',
        badge: 'Tantangan 3',
      },
    ],
    speakerNotes:
      'Pada slide ini, saya menyampaikan tantangan yang dihadapi selama proses pengembangan aplikasi bersama asisten AI. Pertama, AI membutuhkan waktu pemrosesan komputasi untuk membaca prompt dan mengompilasi kode program secara menyeluruh. Kedua, ketika instruksi baru diberikan, terdapat kecenderungan tampilan antarmuka ikut berubah secara tidak terduga. Ketiga, perubahan parsial berisiko mengubah elemen lain yang sebelumnya sudah stabil. Tantangan ini murni berfokus pada alur teknis pengembangan, bukan masalah pengguna aplikasi.',
  },

  // Slide 3: Solution (Solusi & Strategi Pengembangan)
  {
    id: 3,
    slideNumber: '03',
    tag: 'DEVELOPMENT STRATEGY',
    title: 'Solusi: Disiplin Prompting & Desain Bertahap',
    subtitle: 'Pendekatan Terstruktur untuk Menjaga Konsistensi UI dan Keutuhan Kode',
    category: 'solution',
    bulletPoints: [
      {
        title: 'Menunggu Pemrosesan Selesai Sepenuhnya',
        description:
          'Memberikan jeda waktu yang cukup hingga proses pembuatan, penulisan file, dan kompilasi sistem tuntas sebelum mengevaluasi dan menambahkan instruksi berikutnya.',
        badge: 'Strategi 1',
      },
      {
        title: 'Instruksi Mikro yang Sangat Spesifik (Targeted Prompts)',
        description:
          'Menyusun prompt yang terfokus hanya pada komponen yang hendak diubah dengan batasan yang tegas agar bagian lain yang sudah stabil tidak ikut termodifikasi.',
        badge: 'Strategi 2',
      },
      {
        title: 'Penerapan Design Guardrails yang Konsisten',
        description:
          'Menegaskan aturan desain—mulai dari palet warna lavender dan navy, hierarki tipografi, hingga tata letak kartu—agar identitas visual tetap konsisten di setiap siklus pembaruan.',
        badge: 'Strategi 3',
      },
    ],
    speakerNotes:
      'Untuk mengatasi tantangan pengembangan tersebut, solusi yang kami terapkan adalah disiplin prompting dan pendekatan bertahap. Pertama, selalu menunggu proses pemrosesan AI selesai sepenuhnya sebelum memberikan arahan berikutnya. Kedua, merumuskan instruksi yang sangat spesifik dan terarah sehingga AI hanya mengubah elemen target. Ketiga, menetapkan batasan desain yang konsisten agar warna lavender, kontras navy, dan layout kartu buku tetap terjaga rapi di setiap perubahan.',
  },

  // Slide 4: Tech Stack & API Integration
  {
    id: 4,
    slideNumber: '04',
    tag: 'TECH STACK & API INTEGRATION',
    title: 'Integrasi API & Alur Pengambilan Data',
    subtitle: 'Pemanfaatan Open Library Search & Covers API Berbasis HTTP GET & JSON',
    category: 'tech',
    bulletPoints: [
      {
        title: 'Open Library Search API (HTTP GET)',
        description:
          'Endpoint: https://openlibrary.org/search.json?q=javascript&limit=10. Mengirimkan permintaan HTTP GET untuk mencari koleksi buku publik secara efisien.',
        badge: 'Search Endpoint',
      },
      {
        title: 'Format Respons Data JSON',
        description:
          'Payload terstruktur memuat properti: title, author_name, first_publish_year, cover_i, edition_count, ratings_average, dan numFound.',
        badge: 'JSON Payload',
      },
      {
        title: 'Open Library Covers API (Dynamic Images)',
        description:
          'Endpoint: https://covers.openlibrary.org/b/id/8228691-M.jpg. Menampilkan gambar sampul ukuran sedang secara dinamis menggunakan nilai cover_i.',
        badge: 'Covers Endpoint',
      },
      {
        title: 'Alur Data (Data Flow Pipeline)',
        description:
          'Input Pencarian Pengguna -> Pengiriman HTTP GET -> Parsing JSON -> Penanganan Nilai Kosong (Safe Null-Handling) -> Rendering Kartu & Tampilan Detail.',
        badge: 'Alur Pipeline',
      },
    ],
    speakerNotes:
      'Pada aspek teknologi dan integrasi data, aplikasi litera terhubung langsung ke Open Library yang dikelola oleh Internet Archive. Pengambilan data menggunakan metode HTTP GET dengan format respons JSON. Endpoint pencarian memuat parameter kata kunci dan batas data, menghasilkan payload seperti judul, penulis, tahun pertama terbit, ID sampul cover_i, jumlah edisi, dan rating. Untuk sampul buku, aplikasi menggunakan Open Library Covers API secara dinamis berdasarkan ID yang diperoleh dari respons pencarian.',
  },

  // Slide 5: List of Features
  {
    id: 5,
    slideNumber: '05',
    tag: 'FEATURE BREAKDOWN',
    title: 'Daftar Fitur Aplikasi litera',
    subtitle: 'Transparansi Fitur yang Tersedia vs Fitur Belum Dikonfirmasi',
    category: 'features',
    bulletPoints: [
      {
        title: 'Katalog Buku Berbentuk Kartu (Tersedia)',
        description:
          'Menampilkan koleksi buku dalam bentuk kartu visual yang rapi dan responsif, memudahkan penjelajahan literatur secara efisien.',
        badge: 'Fitur Tersedia',
      },
      {
        title: 'Pencarian Judul & Kata Kunci Cepat (Tersedia)',
        description:
          'Mencari buku secara dinamis dari database Open Library berdasarkan judul atau topik yang diketik pengguna.',
        badge: 'Fitur Tersedia',
      },
      {
        title: 'Sampul Dinamis & Fallback Buku Tanpa Cover (Tersedia)',
        description:
          'Menampilkan sampul via cover_i. Jika buku belum memiliki sampul di Open Library, aplikasi menampilkan fallback tipografi yang elegan.',
        badge: 'Fitur Tersedia',
      },
      {
        title: 'Informasi Lengkap & Halaman Detail Buku (Tersedia)',
        description:
          'Menampilkan judul, penulis, tahun terbit pertama, total edisi, dan rating bila tersedia, dilengkapi layar detail mandiri.',
        badge: 'Fitur Tersedia',
      },
      {
        title: 'Koleksi Buku Favorit & Bottom Navigation (Tersedia)',
        description:
          'Menyimpan buku terpilih ke dalam daftar favorit perangkat lokal yang dapat diakses sewaktu-waktu melalui bottom navigation bar.',
        badge: 'Fitur Tersedia',
      },
      {
        title: 'Fitur Belum Dikonfirmasi / Belum Diimplementasikan',
        description:
          'Fitur membaca teks penuh (e-book reader langsung di dalam aplikasi), sinkronisasi akun lintas perangkat, dan filter penerbit belum diimplementasikan.',
        badge: 'Belum Dikonfirmasi',
      },
    ],
    speakerNotes:
      'Slide ini memaparkan daftar fitur aplikasi secara transparan, membedakan mana yang sudah selesai dan mana yang belum dikonfirmasi. Fitur yang sudah tersedia meliputi katalog kartu, pencarian judul/kata kunci, tampilan sampul dinamis via cover_i beserta penanganan buku tanpa cover, informasi buku (judul, penulis, tahun terbit, edisi, rating bila ada), layar detail, dan koleksi favorit. Kami juga secara jujur menegaskan bahwa fitur pembaca e-book teks penuh di dalam aplikasi dan sinkronisasi akun belum diimplementasikan pada versi ini.',
  },

  // Slide 6: Conclusion & Future Improvements
  {
    id: 6,
    slideNumber: '06',
    tag: 'CONCLUSION & ROADMAP',
    title: 'Kesimpulan & Rencana Pengembangan',
    subtitle: 'Rangkuman Manfaat litera dan Langkah Peningkatan di Masa Depan',
    category: 'closing',
    bulletPoints: [
      {
        title: 'Akses Literatur Terbuka yang Efisien & Visual',
        description:
          'litera berhasil menyediakan akses yang ringan, visual, dan cepat ke arsip buku dunia Open Library tanpa beban registrasi yang rumit.',
        badge: 'Pencapaian Proyek',
      },
      {
        title: 'Keberhasilan Desain & Penanganan Data Fleksibel',
        description:
          'Aplikasi terbukti mampu menangani variasi data API secara aman (aman dari data null/kosong) dengan antarmuka lavender-navy yang konsisten.',
        badge: 'Hasil Pengujian',
      },
      {
        title: 'Rencana: Filter Kategori & Bahasa Lebih Spesifik',
        description:
          'Rencana pengembangan ke depan untuk menambahkan opsi penyaringan buku berdasarkan kode bahasa (language) dan klasifikasi subjek literatur.',
        badge: 'Rencana Masa Depan',
      },
      {
        title: 'Rencana: Ekspor Daftar Buku Favorit',
        description:
          'Mengembangkan kemampuan mengekspor daftar buku yang telah disimpan pengguna ke dalam format dokumen ringkas (PDF atau catatan teks).',
        badge: 'Rencana Masa Depan',
      },
    ],
    speakerNotes:
      'Sebagai penutup, aplikasi litera berhasil mewujudkan penjelajahan buku digital yang nyaman, estetis, dan terintegrasi langsung dengan Open Library API. Untuk pengembangan selanjutnya tanpa mengklaim yang belum dibuat, kami merencanakan penambahan filter bahasa dan kemampuan ekspor daftar buku favorit. Terima kasih kepada Bapak/Ibu guru dan teman-teman atas perhatiannya. Saya dengan senang hati menyambut pertanyaan maupun masukan.',
  },
];
